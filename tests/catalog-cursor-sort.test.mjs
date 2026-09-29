import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { AuthContractError } = require("../dist-test/miniprogram/lib/contracts.js");
const shop = "10000000-0000-4000-8000-000000000001";
for (const [sortIndex, sort, empty] of [
  [0, "updated_desc", false],
  [1, "name_asc", false],
  [2, "barcode_asc", false],
  [1, "name_asc", true],
]) {
  test(`catalog pagination sends only the cursor matching ${sort}${empty ? " with empty text" : ""}`, async () => {
    let definition;
    const calls = [];
    const rows = Array.from({ length: 101 }, (_, n) => ({
      product_id: `20000000-0000-4000-8000-${String(n + 1).padStart(12, "0")}`,
      barcode: String(n + 1),
      product_name: String(n + 1),
      updated_at: "2026-09-28T12:00:00.123456+00:00",
      cursor_text: sortIndex === 0 ? null : empty ? "" : String(n + 1),
      primary_image_version_id: null,
      retail_price: 1234.567,
    }));
    const previous = { getApp: globalThis.getApp, Page: globalThis.Page };
    globalThis.getApp = () => ({
      activeShop: { shop_id: shop },
      featureReady: true,
      locale: "en",
      sessionStore: { load: () => ({ accountFingerprint: "a".repeat(64) }) },
      sensitiveCaches: { generation: 1, register() {} },
      salesClient: {
        async catalogPage(id, options) {
          assert.equal(id, shop);
          calls.push(options);
          if (
            options.cursorId &&
            (sortIndex === 0
              ? !options.cursorAt || options.cursorText !== undefined
              : typeof options.cursorText !== "string" || options.cursorAt !== undefined)
          ) {
            throw new AuthContractError("validation_failed");
          }
          const start = options.cursorId
            ? rows.findIndex((r) => r.product_id === options.cursorId) + 1
            : 0;
          return rows.slice(start, start + options.limit);
        },
      },
    });
    globalThis.Page = (value) => {
      definition = value;
    };
    try {
      const file = require.resolve("../dist-test/miniprogram/pages/database/index.js");
      delete require.cache[file];
      require(file);
      const page = { ...definition, data: { ...structuredClone(definition.data), sortIndex } };
      page.setData = (values) => Object.assign(page.data, values);
      await page.refresh(true);
      await page.refresh(false);
      await page.refresh(false);
      assert.equal(page.data.errorMessage, "");
      assert.deepEqual(
        page.data.products.map((r) => r.product_id),
        rows.map((r) => r.product_id),
      );
      assert.equal(calls.length, 3);
      assert.equal(calls[1].cursorId, rows[49].product_id);
      assert.equal(calls[2].cursorId, rows[99].product_id);
      assert.equal(calls[1].sort, sort);
      if (sortIndex === 0) assert.equal(calls[1].cursorAt, rows[49].updated_at);
      else assert.equal(calls[1].cursorText, rows[49].cursor_text);
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
    }
  });
}
