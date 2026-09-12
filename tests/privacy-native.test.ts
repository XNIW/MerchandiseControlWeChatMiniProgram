import { readFileSync } from "node:fs";
import test from "node:test";
import { policyBundle } from "../miniprogram/content/policies";
import type { LocaleKey } from "../miniprogram/locales/index";
import { assert, assertEqual } from "./fakes";

test("native privacy and deletion remain complete for all four locales", () => {
  for (const locale of ["en", "es", "it", "zh-Hans"] as const) {
    const text = policyBundle.locales[locale];
    assertEqual(text.privacy.sections.length, 6, "all privacy sections retained");
    assertEqual(text.deletion.sections.length, 4, "all deletion sections retained");
    for (const kind of ["privacy", "deletion"] as const) {
      text[kind].sections.forEach((section, index) => {
        assert(section.title.length > 0, "translated title");
        assertEqual(
          section.blocks.length,
          policyBundle.locales.en[kind].sections[index]?.blocks.length,
          "no omitted content",
        );
        section.blocks.forEach((block) => {
          assert(block.text.length > 0, "translated paragraph");
        });
      });
    }
  }
  assertEqual(policyBundle.contentVersion, "2026-08-14", "original factual date retained");
  assert(
    policyBundle.locales.en.deletion.sections[0].blocks[0].text.includes(
      "does not submit or delete",
    ),
    "no invented self-service deletion",
  );
  const source = readFileSync("miniprogram/pages/privacy/index.ts", "utf8");
  assert(
    !/wx\.(?:request|login)|sessionStore|authClient|web-view/.test(source),
    "public native content needs no Auth or network",
  );
});

test("public native page supports OFF/expired sessions, language, document switch and return", async () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previous = { Page: globals.Page, getApp: globals.getApp, wx: globals.wx };
  type Data = { kind: "privacy" | "deletion"; document: { title: string }; localeIndex: number };
  interface Definition {
    data: Data;
    setData(value: Partial<Data>): void;
    onLoad(options: Record<string, string>): void;
    onShow(): void;
    chooseLocale(event: { detail: { value: string } }): void;
    showOtherDocument(): void;
    goBack(): void;
  }
  let definition: Definition | undefined;
  let title = "";
  let scrollTop = -1;
  let returned = false;
  const app = {
    locale: "zh-Hans" as LocaleKey,
    featureReady: false,
    get sessionStore(): never {
      throw new Error("Privacy must not inspect the session");
    },
    setLocale(value: LocaleKey) {
      this.locale = value;
    },
  };
  globals.getApp = () => app;
  globals.Page = (value: Definition) => {
    definition = value;
  };
  globals.wx = {
    setNavigationBarTitle(value: { title: string }) {
      title = value.title;
    },
    pageScrollTo(value: { scrollTop: number }) {
      scrollTop = value.scrollTop;
    },
    navigateBack() {
      returned = true;
    },
  };
  try {
    await import("../miniprogram/pages/privacy/index.js");
    assert(definition !== undefined, "native page registered");
    const page: Definition = {
      ...definition,
      data: { ...definition.data },
      setData(value) {
        Object.assign(this.data, value);
      },
    };
    for (const enabled of [false, true]) {
      app.featureReady = enabled;
      page.onLoad({});
      page.onShow();
      assertEqual(page.data.kind, "privacy", "session cannot gate public content");
      for (const [index, locale] of (["zh-Hans", "en", "es", "it"] as const).entries()) {
        page.chooseLocale({ detail: { value: String(index) } });
        assertEqual(
          title,
          policyBundle.locales[locale].privacy.title,
          "title follows selected language",
        );
        page.showOtherDocument();
        assertEqual(
          page.data.document.title,
          policyBundle.locales[locale].deletion.title,
          "full deletion document available",
        );
        assertEqual(scrollTop, 0, "new document opens at top");
        page.showOtherDocument();
      }
      page.goBack();
      assert(returned, "native back action remains available");
    }
    page.onLoad({ kind: "untrusted-url" });
    assertEqual(page.data.kind, "privacy", "unsupported input cannot navigate to H5");
  } finally {
    Object.assign(globals, previous);
  }
});
