import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const shopId = "10000000-0000-4000-8000-000000000001";

for (const name of ["database", "categories", "suppliers"]) {
  test(`${name} sends the visible bounded search after paste, replacement and clearing`, async () => {
    const previous = { getApp: globalThis.getApp, Page: globalThis.Page };
    const calls = [];
    let definition;
    const read = async (id, search) => {
      assert.equal(id, shopId);
      assert.ok(search === undefined || search.length <= 80, "Admin request limit");
      assert.ok(search === undefined || search.isWellFormed(), "no split Unicode character");
      calls.push(search);
      return [];
    };
    globalThis.getApp = () => ({
      activeShop: { shop_id: shopId },
      featureReady: true,
      locale: "en",
      sessionStore: { generation: 1, load: () => ({ accountFingerprint: "a".repeat(64) }) },
      sensitiveCaches: { generation: 1, register() {} },
      salesClient: {
        catalogPage: (id, options) => read(id, options.search),
        categories: read,
        suppliers: read,
      },
    });
    globalThis.Page = (value) => {
      definition = value;
    };
    let page;
    try {
      const file = require.resolve(`../dist-test/miniprogram/pages/${name}/index.js`);
      delete require.cache[file];
      require(file);
      page = { ...definition, data: structuredClone(definition.data) };
      page.setData = (values) => Object.assign(page.data, values);
      const refresh = () => (name === "database" ? page.refresh(true) : page.load());
      await refresh();
      calls.length = 0;
      for (const [input, expected] of [
        ["x".repeat(90), "x".repeat(80)],
        ["中".repeat(79) + "😀suffix", "中".repeat(79)],
        ["😀".repeat(41), "😀".repeat(40)],
        ["caffè 茶", "caffè 茶"],
        ["", undefined],
      ]) {
        page.search({ detail: { value: input } });
        clearTimeout(page.timer);
        assert.equal(page.data.search, expected ?? "");
        await refresh();
        assert.equal(calls.at(-1), expected);
        assert.equal(page.data.errorMessage, "");
      }
      assert.equal(calls.length, 5);
      const markup = readFileSync(
        new URL(`../miniprogram/pages/${name}/index.wxml`, import.meta.url),
        "utf8",
      );
      assert.match(
        markup,
        /<input[^>]*maxlength="80"[^>]*value="\{\{search\}\}"[^>]*bindinput="search"/,
      );
    } finally {
      clearTimeout(page?.timer);
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
    }
  });
}
