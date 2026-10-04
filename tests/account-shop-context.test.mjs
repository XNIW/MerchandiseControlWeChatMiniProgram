import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { DurableCatalogOutbox } = require("../dist-test/miniprogram/lib/durable-catalog-outbox.js");
const { SessionStore } = require("../dist-test/miniprogram/lib/session-store.js");
const { FakePlatform } = require("../dist-test/tests/fakes.js");

test("shop and session clearing stop sync without deleting durable pending work", () => {
  const previous = { App: globalThis.App, wx: globalThis.wx };
  const shopId = "10000000-0000-4000-8000-000000000401";
  const storage = new Map([["mc.activeShopId", shopId]]);
  let definition;
  globalThis.App = (value) => {
    definition = value;
  };
  globalThis.wx = {
    getStorageSync: (key) => storage.get(key),
    removeStorageSync: (key) => storage.delete(key),
  };
  const file = require.resolve("../dist-test/miniprogram/app.js");
  delete require.cache[file];
  try {
    require(file);
    const platform = new FakePlatform();
    const sessionStore = new SessionStore(platform, () => 1_000);
    sessionStore.save(
      {
        accountFingerprint: "d".repeat(64),
        expiresAt: 4_600,
        expiresIn: 3_600,
        sessionToken: "D".repeat(43),
        tokenType: "bearer",
        user: { provider: "custom:wechat" },
      },
      "00000000-0000-4000-8000-000000000904",
    );
    const outbox = new DurableCatalogOutbox(platform, sessionStore, () => 1_000);
    outbox.enqueue(
      {
        expectedUpdatedAt: "2026-08-13T10:00:00Z",
        operation: "product_update",
        payload: { barcode: "Pending-401", productName: "Retained pending product" },
        shopId,
        targetId: "20000000-0000-4000-8000-000000000401",
      },
      {
        correlationId: "30000000-0000-4000-8000-000000000401",
        idempotencyKey: "40000000-0000-4000-8000-000000000401",
      },
    );
    const beforeStorage = [...platform.storage];
    const beforeSession = sessionStore.load();
    const beforeGeneration = sessionStore.generation;
    let syncStops = 0;
    let cacheInvalidations = 0;
    const app = {
      ...definition,
      activeShop: { shop_id: shopId },
      outbox,
      pendingCatalogFilter: { categoryId: "old-category" },
      sensitiveCaches: { invalidate: () => cacheInvalidations++ },
      sessionStore,
      syncCoordinator: { stop: () => syncStops++ },
    };
    app.clearShopContext();
    assert.equal(app.activeShop, null);
    assert.equal(app.pendingCatalogFilter, null);
    assert.equal(storage.has("mc.activeShopId"), false);
    assert.equal(syncStops, 1);
    assert.equal(cacheInvalidations, 1);
    assert.deepEqual(sessionStore.load(), beforeSession);
    assert.equal(sessionStore.generation, beforeGeneration);
    assert.deepEqual([...platform.storage], beforeStorage);
    assert.equal(outbox.pendingForCurrentShop(shopId).length, 1);
    app.clearSessionContext();
    assert.equal(app.activeShop, null);
    assert.equal(sessionStore.load(), null);
    assert.equal(sessionStore.generation, beforeGeneration + 1);
    assert.deepEqual([...platform.storage], beforeStorage);
    assert.equal(cacheInvalidations, 2);
    assert.ok(syncStops > 1);
  } finally {
    Object.assign(globalThis, previous);
  }
});
