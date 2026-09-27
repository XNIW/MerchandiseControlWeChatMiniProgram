import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { translationsFor } = require("../dist-test/miniprogram/locales/index.js");

test("all native dialog labels fit WeChat's four Chinese character budget in every locale", () => {
  let checked = 0;
  const files = [new URL("../miniprogram/app.ts", import.meta.url)];
  for (const dir of readdirSync(new URL("../miniprogram/pages/", import.meta.url), {
    withFileTypes: true,
  })) {
    if (!dir.isDirectory()) continue;
    files.push(new URL(`../miniprogram/pages/${dir.name}/index.ts`, import.meta.url));
  }
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(
      /(?:confirmText|cancelText): (?:this\.data\.)?text\.(\w+)/g,
    )) {
      for (const locale of ["en", "es", "it", "zh-Hans"]) {
        const label = translationsFor(locale)[match[1]];
        const width = [...label].reduce((n, char) => n + (char.charCodeAt(0) > 127 ? 2 : 1), 0);
        assert.ok(width > 0 && width <= 8, `${file.pathname} ${locale}: ${label}`);
        checked++;
      }
    }
  }
  assert.ok(checked >= 96, "covers the native dialog inventory");
});

test("Spanish logout displays distinct valid retain/discard choices before changing the session", async () => {
  const previous = { wx: globalThis.wx, App: globalThis.App };
  let definition;
  globalThis.wx = { getStorageSync() {} };
  globalThis.App = (value) => {
    definition = value;
  };
  const file = require.resolve("../dist-test/miniprogram/app.js");
  delete require.cache[file];
  try {
    require(file);
    for (const retain of [true, false]) {
      let cleared = 0,
        discarded = 0,
        choose;
      const a = {
        ...definition,
        locale: "es",
        activeShop: { shop_id: "shop" },
        imageClient: null,
        sessionStore: { load: () => ({ accountFingerprint: "account" }) },
        outbox: {
          scopesForCurrentAccount: () => ["shop"],
          pendingForCurrentShop: () => [{}],
          discard: () => discarded++,
        },
        clearSessionContext: () => cleared++,
      };
      globalThis.wx.showModal = (options) => {
        assert.equal(options.confirmText, "Guardar");
        assert.equal(options.cancelText, "Eliminar");
        assert.notEqual(options.confirmText, options.cancelText);
        assert.equal(options.content, translationsFor("es").pendingSignOutDetail);
        choose = () => options.success({ confirm: retain, cancel: !retain });
      };
      const pending = a.requestSignOut();
      assert.equal(cleared, 0);
      assert.equal(discarded, 0);
      choose();
      await pending;
      assert.equal(cleared, 1);
      assert.equal(discarded, retain ? 0 : 1);
    }
  } finally {
    Object.assign(globalThis, previous);
  }
});
