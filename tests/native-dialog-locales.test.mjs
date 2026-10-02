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

test("a late logout decision cannot discard entries or clear a changed session or shop", async () => {
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
    for (const transition of ["replacement", "expiry", "shop"]) {
      for (const retain of [true, false]) {
        let cleared = 0,
          discarded = 0,
          choose;
        let session = { accountFingerprint: "account-a" };
        const sessionStore = { generation: 1, load: () => session };
        const a = {
          ...definition,
          locale: "en",
          activeShop: { shop_id: "shop-a" },
          imageClient: null,
          sessionStore,
          outbox: {
            scopesForCurrentAccount: () => ["shop-a"],
            pendingForCurrentShop: () => [{}],
            discard: () => discarded++,
          },
          clearSessionContext: () => cleared++,
        };
        globalThis.wx.showModal = (options) => {
          choose = () => options.success({ confirm: retain, cancel: !retain });
        };
        const pending = a.requestSignOut();
        if (transition === "shop") a.activeShop = { shop_id: "shop-b" };
        else {
          session = transition === "replacement" ? { accountFingerprint: "account-b" } : null;
          sessionStore.generation += 1;
        }
        choose();
        await pending;
        assert.equal(discarded, 0, `${transition}: the old decision cannot discard`);
        assert.equal(
          cleared,
          0,
          `${transition}: the old decision cannot clear the current session`,
        );
      }
    }
  } finally {
    Object.assign(globalThis, previous);
  }
});

test("session replacement during image discard cannot clear the replacement session", async () => {
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
    let session = { accountFingerprint: "account-a" },
      finishDiscard,
      cleared = 0,
      discarded = 0;
    const sessionStore = { generation: 1, load: () => session };
    const a = {
      ...definition,
      locale: "en",
      activeShop: { shop_id: "shop" },
      sessionStore,
      imageClient: {
        discardDurableAttempts: () =>
          new Promise((resolve) => {
            finishDiscard = resolve;
          }),
      },
      outbox: {
        scopesForCurrentAccount: () => ["shop"],
        pendingForCurrentShop: () => [{}],
        discard: () => discarded++,
      },
      clearSessionContext: () => cleared++,
    };
    globalThis.wx.showModal = (options) => options.success({ confirm: false, cancel: true });
    const pending = a.requestSignOut();
    await Promise.resolve();
    assert.equal(discarded, 1, "the original scope discard started while authorized");
    assert.equal(cleared, 0);
    session = { accountFingerprint: "account-b" };
    sessionStore.generation += 1;
    finishDiscard();
    await pending;
    assert.equal(cleared, 0, "awaiting image cleanup cannot clear the newer session");
  } finally {
    Object.assign(globalThis, previous);
  }
});
