import test from "node:test";
import type { CatalogProduct } from "../miniprogram/lib/contracts";
import { assert, assertEqual, expectReject } from "./fakes";

interface PageShape {
  data: Record<string, unknown>;
  [key: string]: unknown;
}
function invoke(page: PageShape, name: string, ...args: unknown[]) {
  const method = page[name];
  assert(typeof method === "function", name);
  return method.apply(page, args);
}
const shopId = "10000000-0000-4000-8000-000000000009";
function product(index: number): CatalogProduct {
  return {
    barcode: String(index),
    category_id: null,
    category_name: null,
    cursor_text: String(index),
    item_number: null,
    previous_retail_price: null,
    primary_image_version_id: null,
    product_id: `20000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    product_name: String(index),
    purchase_price: null,
    retail_price: index,
    second_product_name: null,
    stock_quantity: null,
    supplier_id: null,
    supplier_name: null,
    updated_at: "2026-09-06T12:00:00Z",
  };
}

test("catalog delta reloads all visible keyset pages, independent of event ID count; failures retain window", async () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previous = { getApp: globals.getApp, Page: globals.Page };
  let definition: PageShape | undefined;
  let calls = 0;
  let failing = false;
  let switchDuringRead = false;
  const source = Array.from({ length: 100 }, (_, index) => product(index + 1));
  const app = {
    activeShop: { shop_id: shopId },
    featureReady: true,
    locale: "en",
    pendingCatalogFilter: null,
    imageClient: null,
    sessionStore: {
      generation: 1,
      load: () => ({ accountFingerprint: "a".repeat(64) }),
      subscribe: () => () => {},
    },
    sensitiveCaches: { generation: 1, register() {} },
    salesClient: {
      async catalogPage(id: string, options: { cursorId?: string; limit: number }) {
        assertEqual(id, shopId, "shop scoped request");
        assertEqual(options.limit, 50, "bounded page");
        calls++;
        if (failing && options.cursorId) throw new Error("offline");
        if (switchDuringRead) app.activeShop = { shop_id: "other-shop" };
        return options.cursorId ? source.slice(50) : source.slice(0, 50);
      },
      async productDetail() {
        throw new Error("N+1 forbidden");
      },
    },
  };
  globals.getApp = () => app;
  globals.Page = (value: PageShape) => {
    definition = value;
  };
  try {
    await import("../miniprogram/pages/database/index.js");
    assert(definition, "registered");
    const page: PageShape = { ...definition, data: { ...definition.data, products: source } };
    page.setData = (update: Record<string, unknown>) => Object.assign(page.data, update);
    const notification = (count: number) => ({
      kind: "delta",
      shopId,
      events: [
        {
          domain: "catalog",
          entityIds: {
            product_ids: Array.from({ length: count }, (_, i) => product(i).product_id),
          },
        },
      ],
    });
    for (const count of [1, 16, 17, 250, 500]) {
      const before = calls;
      await invoke(page, "applySync", notification(count));
      assertEqual(
        calls - before,
        2,
        `${count} changed entities still require only two 50-row reads`,
      );
      assertEqual(
        JSON.stringify(page.data.products),
        JSON.stringify(source.map((p) => ({ ...p, thumbnail_url: null }))),
        "canonical order preserved",
      );
    }
    const beforeRows = JSON.stringify(page.data.products);
    failing = true;
    await expectReject(
      async () => {
        await invoke(page, "applySync", notification(500));
      },
      () => true,
    );
    assertEqual(
      JSON.stringify(page.data.products),
      beforeRows,
      "partial page never replaces window",
    );
    failing = false;
    switchDuringRead = true;
    await invoke(page, "applySync", notification(500));
    assertEqual(
      JSON.stringify(page.data.products),
      beforeRows,
      "stale shop response never publishes",
    );
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globals[key];
      else globals[key] = value;
    }
  }
});
