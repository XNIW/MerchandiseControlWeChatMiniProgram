import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { formatCatalogNumber } = require("../dist-test/miniprogram/lib/catalog-numbers.js");
const {
  validateProductForm,
  planProductSave,
} = require("../dist-test/miniprogram/pages/catalog-management.js");
const { FakePlatform } = require("../dist-test/tests/fakes.js");
const { SessionStore } = require("../dist-test/miniprogram/lib/session-store.js");
const { DurableCatalogOutbox } = require("../dist-test/miniprogram/lib/durable-catalog-outbox.js");
const {
  CatalogMutationClient,
  CatalogMutationAttemptController,
} = require("../dist-test/miniprogram/lib/catalog-mutation-client.js");
const { OutboxDrain } = require("../dist-test/miniprogram/lib/outbox-drain.js");
const { HttpClient } = require("../dist-test/miniprogram/lib/http-client.js");
const { SalesApiClient } = require("../dist-test/miniprogram/lib/sales-api-client.js");
const { AuthContractError } = require("../dist-test/miniprogram/lib/contracts.js");
const id = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const shop = {
  shop_id: id(1),
  currency_code: "CLP",
  time_zone: "America/Santiago",
  can_write_products: true,
  can_change_prices: true,
  can_write_categories: true,
  can_write_suppliers: true,
  can_read_catalog_history: true,
};
const tick = () => new Promise((resolve) => setImmediate(resolve));
function page(name, app) {
  let definition;
  globalThis.getApp = () => app;
  globalThis.Page = (d) => (definition = d);
  globalThis.wx = {
    setNavigationBarTitle() {},
    disableAlertBeforeUnload() {},
    enableAlertBeforeUnload() {},
    showToast() {},
    navigateBack() {},
    stopPullDownRefresh() {},
  };
  const path = require.resolve(`../dist-test/miniprogram/pages/${name}/index.js`);
  delete require.cache[path];
  require(path);
  const p = { ...definition, data: structuredClone(definition.data) };
  p.setData = (d) => Object.assign(p.data, d);
  return p;
}
function app(api) {
  return {
    activeShop: { ...shop },
    locale: "es",
    featureReady: true,
    sessionStore: { generation: 1, load: () => ({ accountFingerprint: "a".repeat(64) }) },
    sensitiveCaches: {
      generation: 1,
      register() {},
      invalidate() {
        this.generation++;
      },
    },
    salesClient: api,
  };
}
function session(s) {
  s.save(
    {
      accountFingerprint: "a".repeat(64),
      expiresAt: 4600,
      expiresIn: 3600,
      sessionToken: "a".repeat(43),
      tokenType: "bearer",
      user: { provider: "custom:wechat" },
    },
    id(999),
  );
}
function input(target = 2) {
  return {
    operation: "product_update",
    shopId: id(1),
    targetId: id(target),
    expectedUpdatedAt: "2026-09-25T12:00:00Z",
    payload: { barcode: `P${target}`, productName: `Product ${target}` },
  };
}
function ids(n) {
  return { correlationId: id(n), idempotencyKey: id(n + 1) };
}
function success(i = ids(100), target = 2) {
  return {
    statusCode: 200,
    data: {
      ok: true,
      mutation: {
        code: "success",
        correlationId: i.correlationId,
        shopId: id(1),
        targetId: id(target),
        updatedAt: "2026-09-25T12:01:00Z",
        replayed: false,
      },
    },
  };
}

test("F01 historical fractional values roundtrip without rounding or price mutation", () => {
  const original = { purchasePrice: 1.125, retailPrice: 999999999999.999, stockQuantity: 0.00001 };
  for (const value of [47100, 1234.567, 0, 1.125, 0.00001, 999999999999.999])
    assert.ok(formatCatalogNumber(value));
  const form = {
    barcode: "P",
    productName: "Changed name",
    itemNumber: "",
    secondProductName: "",
    categoryId: "",
    supplierId: "",
    purchasePrice: formatCatalogNumber(original.purchasePrice),
    retailPrice: formatCatalogNumber(original.retailPrice),
    stockQuantity: formatCatalogNumber(original.stockQuantity),
  };
  const result = validateProductForm(form, original);
  assert.equal(result.ok, true);
  assert.equal(result.payload.retailPrice, original.retailPrice);
  const plan = planProductSave({
    canChangePrices: true,
    mode: "edit",
    originalBasePayload: "{}",
    originalPurchasePrice: original.purchasePrice,
    originalRetailPrice: original.retailPrice,
    payload: result.payload,
  });
  assert.deepEqual(plan.stages, [{ kind: "base" }]);
});
test("F02 250 categories and suppliers are reachable with tied names and bounded pages", async () => {
  for (const kind of ["category", "supplier"]) {
    const plural = kind === "category" ? "categories" : "suppliers";
    const data = Array.from({ length: 250 }, (_, i) => ({
      [`${kind}_id`]: id(i + 1),
      [`${kind}_name`]: "Same name",
      product_count: 0,
      updated_at: "2026-09-25T12:00:00Z",
    }));
    const calls = [];
    const a = app({
      [plural]: async (_shop, _search, options = {}) => {
        calls.push(options);
        const pos = options.afterId
          ? data.findIndex((i) => i[`${kind}_id`] === options.afterId) + 1
          : 0;
        return data.slice(pos, pos + 100);
      },
    });
    const p = page(plural, a);
    await p.load();
    await p.load(true);
    await p.load(true);
    assert.equal(p.data.items.length, 250);
    assert.equal(new Set(p.data.items.map((i) => i[`${kind}_id`])).size, 250);
    assert.equal(p.data.hasMore, false);
    assert.equal(calls.length, 3);
    assert.equal(calls[1].afterName, "Same name");
  }
});
test("F02 product association outside first page stays visible and unchanged", async () => {
  const product = {
    product_id: id(2),
    barcode: "P",
    product_name: "Product",
    second_product_name: null,
    item_number: null,
    category_id: id(250),
    category_name: "Category 250",
    supplier_id: id(251),
    supplier_name: "Supplier 251",
    purchase_price: 47100,
    retail_price: 49100,
    stock_quantity: 1.25,
    updated_at: "2026-09-25T12:00:00Z",
  };
  const a = app({
    categories: async () => [],
    suppliers: async () => [],
    productDetail: async () => product,
  });
  const p = page("product-form", a);
  await p.onLoad({ mode: "edit", id: id(2) });
  assert.equal(p.data.categoryOptions[p.data.categoryIndex].label, "Category 250");
  assert.equal(p.data.supplierOptions[p.data.supplierIndex].label, "Supplier 251");
  assert.equal(p.data.purchasePrice, "47.100");
  assert.equal(p.data.stockQuantity, "1,25");
});
test("F03 more than 100 prices, identical timestamps, refresh inserts over a page without gaps", async () => {
  let count = 125;
  const calls = [];
  const a = app({
    priceHistory: async (_shop, _product, o) => {
      calls.push(o);
      const all = Array.from({ length: count }, (_, i) => ({
        price_id: id(count - i),
        effective_at: "2026-09-25T12:00:00Z",
        price: 47100,
        price_type: "RETAIL",
      }));
      const offset = o.beforeId ? all.findIndex((i) => i.price_id === o.beforeId) + 1 : 0;
      return all.slice(offset, offset + 50);
    },
  });
  const p = page("product-detail", a);
  p.productId = id(2);
  p.context = "current";
  p.data.loading = false;
  await p.loadPrices(true);
  await p.loadPrices(false);
  assert.equal(p.data.prices.length, 100);
  count = 185;
  await p.loadPrices(true);
  for (let i = 0; i < 5 && p.data.pricesMore; i++) await p.loadPrices(false);
  assert.equal(p.data.prices.length, 185);
  assert.equal(new Set(p.data.prices.map((i) => i.price_id)).size, 185);
  assert.equal(p.data.pricesMore, false);
  assert.ok(calls.every((c) => c.limit === 50));
  assert.equal(p.data.prices[0].price_text, "47.100");
});
test("F04 foreground deadline and network recovery drain exactly once without navigation", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  let now = 10000;
  const box = new DurableCatalogOutbox(platform, sessions, () => now),
    client = new CatalogMutationClient(
      new HttpClient("https://admin.example.test", platform),
      sessions,
    );
  let timer;
  const drain = new OutboxDrain(
    box,
    client,
    sessions,
    {
      schedule: (cb, delay) => {
        timer = { cb, delay };
        return 1;
      },
      clear: () => {
        timer = undefined;
      },
    },
    () => {},
    () => now,
  );
  drain.start(id(1));
  box.enqueue(input(), ids(100));
  platform.queuedResponses.push(new Error("offline"));
  {
    const fired = timer;
    timer = undefined;
    fired.cb();
  }
  await tick();
  assert.equal(platform.requests.length, 1);
  assert.equal(box.pendingForCurrentShop(id(1))[0].state, "retry_wait");
  drain.networkChanged(false);
  assert.equal(timer, undefined);
  now += 100000;
  platform.queuedResponses.push(success());
  drain.networkChanged(true);
  {
    const fired = timer;
    timer = undefined;
    fired.cb();
  }
  await tick();
  assert.equal(platform.requests.length, 2);
  assert.equal(box.pendingForCurrentShop(id(1)).length, 0);
  assert.equal(timer, undefined);
  drain.stop();
});
test("F04 storage quota never permits an unjournaled retry", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  const box = new DurableCatalogOutbox(platform, sessions),
    client = new CatalogMutationClient(
      new HttpClient("https://admin.example.test", platform),
      sessions,
    );
  platform.setStorage = () => {
    throw new Error("quota");
  };
  const attempt = new CatalogMutationAttemptController(client, platform, box);
  await assert.rejects(attempt.start(input()));
  await assert.rejects(attempt.retry());
  assert.equal(platform.requests.length, 0);
});
test("F04 hide stops subsequent dispatch; same-account session replacement serializes senders", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  const box = new DurableCatalogOutbox(platform, sessions),
    client = new CatalogMutationClient(
      new HttpClient("https://admin.example.test", platform),
      sessions,
    );
  box.enqueue(input(), ids(100));
  let finish;
  let count = 0;
  platform.request = () => {
    count++;
    return new Promise((resolve) => {
      finish = resolve;
    });
  };
  const old = box.flush(client, id(1));
  await tick();
  session(sessions);
  const fresh = box.flush(client, id(1));
  assert.equal(count, 1);
  finish(success());
  await old;
  await tick();
  assert.equal(count, 2);
  finish(success());
  await fresh;
  assert.equal(box.pendingForCurrentShop(id(1)).length, 0);
  box.setActiveContext(id(1));
  box.enqueue(input(), ids(200));
  box.enqueue(input(3), ids(300));
  const task = box.flush(client, id(1));
  await tick();
  box.setActiveContext(null);
  finish(success(ids(200)));
  await task;
  assert.equal(count, 3);
  assert.equal(box.pendingForCurrentShop(id(1)).length, 1);
});
test("F05 discarded intentions never become a successful save and partial conflicts can be discarded", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  const box = new DurableCatalogOutbox(platform, sessions),
    client = new CatalogMutationClient(
      new HttpClient("https://admin.example.test", platform),
      sessions,
    );
  const intent = box.enqueueSequence(
    [
      input(),
      {
        ...input(),
        operation: "product_price_update",
        payload: { priceType: "RETAIL", price: 47100 },
      },
    ],
    [ids(100), ids(200)],
  );
  platform.queuedResponses.push(success(), { statusCode: 409, data: { code: "conflict" } });
  await box.flush(client, id(1));
  assert.equal(box.pendingForCurrentShop(id(1)).length, 1);
  box.discardIntent(id(1), intent);
  assert.equal(box.pendingForCurrentShop(id(1)).length, 0);
  await assert.rejects(
    box.completeIntent(client, id(1), intent, sessions.generation),
    (e) => e.code === "invalid_state",
  );
});
test("F06 default sales day comes from the shop summary, never device UTC", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  platform.queuedResponses.push(
    { statusCode: 200, data: { ok: true, summary: [{ business_date: "2026-09-24" }] } },
    { statusCode: 200, data: { ok: true, sales: [] } },
  );
  const api = new SalesApiClient(new HttpClient("https://admin.example.test", platform), sessions);
  await api.dailySalesPage(id(1));
  assert.ok(platform.requests[1].url.includes("from=2026-09-24"));
  assert.ok(platform.requests[1].url.includes("to=2026-09-24"));
});
test("F06 History sends calendar dates unchanged and recovers sync notification during load", async () => {
  const requests = [];
  let release;
  let notification;
  let first = true;
  const a = app({
    catalogHistory: async (_shop, o) => {
      requests.push(o);
      if (first) {
        first = false;
        return new Promise((resolve) => (release = resolve));
      }
      return [];
    },
  });
  a.syncCoordinator = {
    subscribe: (cb) => {
      notification = cb;
      return () => true;
    },
  };
  const p = page("history", a);
  p.onShow();
  a.sensitiveCaches.generation++;
  notification({ shopId: id(1), kind: "reconcile" });
  release([]);
  await tick();
  assert.equal(requests.length, 2);
  p.data.fromDate = "2026-09-06";
  p.data.toDate = "2026-09-06";
  await p.load(true);
  assert.equal(requests.at(-1).fromDate, "2026-09-06");
  assert.equal(requests.at(-1).toDate, "2026-09-06");
  assert.equal(requests.at(-1).fromAt, undefined);
  p.onHide();
});
test("F06 authorization errors remain distinct from offline on category page", async () => {
  const a = app({
      categories: async () => {
        throw new AuthContractError("membership_missing");
      },
    }),
    p = page("categories", a);
  await p.load();
  assert.equal(p.data.errorMessage, p.data.text.membershipRemoved);
});

test("F05 recovery quarantines an incomplete save intent and preserves original bytes", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  const box = new DurableCatalogOutbox(platform, sessions),
    client = new CatalogMutationClient(
      new HttpClient("https://admin.example.test", platform),
      sessions,
    );
  const intent = box.enqueueSequence(
    [
      input(),
      {
        ...input(),
        operation: "product_price_update",
        payload: { priceType: "PURCHASE", price: 123 },
      },
      {
        ...input(),
        operation: "product_price_update",
        payload: { priceType: "RETAIL", price: 456 },
      },
    ],
    [ids(100), ids(200), ids(300)],
  );
  box.enqueue(input(3), ids(400));
  const key = [...platform.storage.keys()].find(
    (k) => k.startsWith("mc.catalogOutbox.v2.") && k.endsWith(id(1)),
  );
  const stored = JSON.parse(platform.storage.get(key));
  stored.entries[1].payload = { price: "bad", priceType: "PURCHASE" };
  const raw = JSON.stringify(stored);
  platform.storage.set(key, raw);
  box.recover(id(1));
  assert.equal(platform.storage.get(`${key}.preserved`), raw);
  assert.equal(box.pendingForCurrentShop(id(1)).length, 1);
  assert.equal(box.pendingForCurrentShop(id(1))[0].entityId, id(3));
  platform.queuedResponses.push(success(ids(400), 3));
  await box.flush(client, id(1));
  await assert.rejects(
    box.completeIntent(client, id(1), intent, sessions.generation),
    (e) => e.code === "invalid_state",
  );
});
test("F04 journal write failures back off and expose storage failure without sending", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  let now = 10000;
  const box = new DurableCatalogOutbox(platform, sessions, () => now),
    client = new CatalogMutationClient(
      new HttpClient("https://admin.example.test", platform),
      sessions,
    );
  let timer;
  const drain = new OutboxDrain(
    box,
    client,
    sessions,
    {
      schedule: (cb, delay) => {
        timer = { cb, delay };
        return 1;
      },
      clear: () => {
        timer = undefined;
      },
    },
    () => {},
    () => now,
  );
  box.enqueue(input(), ids(100));
  platform.setStorage = () => {
    throw new Error("quota");
  };
  drain.start(id(1));
  for (let i = 0; i < 3; i++) {
    const fired = timer;
    timer = undefined;
    now += fired.delay;
    fired.cb();
    await tick();
    assert.ok(timer.delay >= 5000);
    assert.equal(platform.requests.length, 0);
  }
  assert.equal(box.storageUnavailableForShop(id(1)), true);
  drain.stop();
});
test("F05 known duplicate barcode can be corrected without replaying the rejected intent", async () => {
  const a = app({ categories: async () => [], suppliers: async () => [] });
  a.catalogClient = {};
  let discarded = 0;
  a.outbox = {
    completeIntent: async () => {
      throw new (require("../dist-test/miniprogram/lib/contracts.js").CatalogMutationContractError)(
        "duplicate_barcode",
      );
    },
    discardIntent: () => discarded++,
    pendingForCurrentShop: () => [],
  };
  const p = page("product-form", a);
  await p.onLoad({ mode: "create" });
  p.data.barcode = "DUPLICATE";
  p.data.productName = "P";
  const validation = validateProductForm(p.data);
  const plan = planProductSave({
    canChangePrices: true,
    mode: "create",
    originalBasePayload: p.data.originalBasePayload,
    originalPurchasePrice: p.data.originalPurchasePrice,
    originalRetailPrice: p.data.originalRetailPrice,
    payload: validation.payload,
  });
  p.saveAction = {
    fingerprint: JSON.stringify({
      mode: "create",
      payload: validation.payload,
      stages: plan.stages,
    }),
    intentId: id(100),
  };
  await p.save();
  assert.equal(discarded, 1);
  p.changeBarcode({ detail: { value: "FIXED" } });
  assert.equal(p.data.barcode, "FIXED");
  assert.equal(p.saveAction, undefined);
});
test("F02 conflict reload shows server association outside loaded relation pages", async () => {
  const a = app({ categories: async () => [], suppliers: async () => [] });
  const p = page("product-form", a);
  await p.onLoad({ mode: "create" });
  p.applyServerProduct(
    {
      product_id: id(2),
      barcode: "P",
      product_name: "P",
      category_id: id(250),
      category_name: "Outside category",
      supplier_id: id(251),
      supplier_name: "Outside supplier",
      purchase_price: 0,
      retail_price: 0,
      stock_quantity: 0,
      updated_at: "2026-09-25T12:00:00Z",
    },
    false,
  );
  assert.equal(p.data.categoryOptions[p.data.categoryIndex].label, "Outside category");
  assert.equal(p.data.supplierOptions[p.data.supplierIndex].label, "Outside supplier");
});
test("F06 account switch during archive or image confirmation never executes old intent", async () => {
  for (const action of ["archive", "replaceImage", "removeImage"]) {
    let calls = 0;
    const a = app({});
    a.createCatalogMutationAttempt = () => {
      calls++;
      return null;
    };
    a.imageClient = { selectAndReplace: () => calls++, remove: () => calls++ };
    const p = page("product-detail", a);
    p.onLoad({ id: id(2) });
    p.data.canEdit = true;
    p.data.canManageImages = true;
    p.data.product = {
      product_id: id(2),
      updated_at: "2026-09-25T12:00:00Z",
      primary_image_version_id: id(8),
    };
    let confirm;
    globalThis.wx.showModal = () => new Promise((r) => (confirm = r));
    const pending = p[action]({ currentTarget: { dataset: { source: "camera" } } });
    a.activeShop = { ...shop, shop_id: id(9) };
    a.sessionStore.generation++;
    confirm({ confirm: true });
    await pending;
    assert.equal(calls, 0, action);
  }
  const a = app({ categories: async () => [], suppliers: async () => [] });
  let calls = 0;
  a.createCatalogMutationAttempt = () => {
    calls++;
    return null;
  };
  const p = page("catalog-entity-form", a);
  await p.onLoad({ mode: "create" });
  p.data.current = {
    id: id(2),
    name: "category",
    productCount: 0,
    updatedAt: "2026-09-25T12:00:00Z",
  };
  let confirm;
  globalThis.wx.showModal = () => new Promise((r) => (confirm = r));
  const pending = p.archive();
  a.sessionStore.generation++;
  confirm({ confirm: true });
  await pending;
  assert.equal(calls, 0);
});
test("F06 sync history refresh with over a page of new rows cannot skip the gap", async () => {
  let count = 125;
  const a = app({
    syncHistory: async (_shop, before) =>
      Array.from({ length: count }, (_, i) => ({ event_id: count - i }))
        .filter((i) => !before || i.event_id < before)
        .slice(0, 50),
  });
  const p = page("history", a);
  p.data.viewMode = "sync";
  await p.load(true);
  await p.load(false);
  count = 185;
  await p.load(true, true);
  for (let i = 0; i < 5 && p.data.hasMoreSync; i++) await p.load(false);
  assert.equal(p.data.syncItems.length, 185);
  assert.equal(new Set(p.data.syncItems.map((i) => i.event_id)).size, 185);
  assert.deepEqual(
    p.data.syncItems.map((i) => i.event_id),
    Array.from({ length: 185 }, (_, i) => 185 - i),
  );
});

test("F05 discarding a middle phase cancels the whole intent and cannot signal Saved", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  const box = new DurableCatalogOutbox(platform, sessions),
    client = new CatalogMutationClient(
      new HttpClient("https://admin.example.test", platform),
      sessions,
    );
  const intent = box.enqueueSequence(
    [
      input(),
      {
        ...input(),
        operation: "product_price_update",
        payload: { priceType: "RETAIL", price: 456 },
      },
    ],
    [ids(100), ids(200)],
  );
  box.discardOperation(id(1), ids(200).correlationId);
  assert.equal(box.pendingForCurrentShop(id(1)).length, 0);
  await assert.rejects(
    box.completeIntent(client, id(1), intent, sessions.generation),
    (e) => e.code === "invalid_state",
  );
  assert.equal(platform.requests.length, 0);
});
test("F05 unidentifiable corrupt phase cannot shrink an intent into a complete save", () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  const box = new DurableCatalogOutbox(platform, sessions);
  box.enqueueSequence(
    [
      input(),
      {
        ...input(),
        operation: "product_price_update",
        payload: { priceType: "RETAIL", price: 456 },
      },
    ],
    [ids(100), ids(200)],
  );
  const key = [...platform.storage.keys()].find((k) => k.endsWith(id(1)));
  const stored = JSON.parse(platform.storage.get(key));
  stored.entries[1] = null;
  const raw = JSON.stringify(stored);
  platform.storage.set(key, raw);
  assert.throws(() => box.recover(id(1)), /outbox_corrupt/);
  assert.equal(platform.storage.get(key), raw);
});
test("F06 automatic History refresh preserves draft filters and uses applied query", async () => {
  const calls = [];
  const a = app({
    catalogHistory: async (_shop, o) => {
      calls.push(o);
      return [
        {
          history_id: id(o.entityType === "category" ? 1 : 2),
          occurred_at: "2026-09-25T12:00:00Z",
          entity_type: o.entityType,
          operation: "updated",
          result: "success",
          surface: "mini_program",
        },
      ];
    },
  });
  const p = page("history", a);
  p.data.canReadCatalogHistory = true;
  p.data.entityOptions = [{ value: "" }, { value: "category" }, { value: "product" }];
  p.data.entityIndex = 1;
  await p.load(true);
  p.data.entityIndex = 2;
  p.data.fromDate = "2026-09-01";
  await p.load(true, true);
  assert.equal(calls[1].entityType, "category");
  assert.equal(calls[1].fromDate, undefined);
  assert.equal(p.data.entityIndex, 2);
  assert.equal(p.data.catalogItems.length, 1);
  await p.load(true);
  assert.equal(calls[2].entityType, "product");
  assert.equal(p.data.catalogItems.length, 1);
});

test("F04 explicit retry after exhaustion retains exact payload and idempotency identity", async () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  const box = new DurableCatalogOutbox(platform, sessions),
    client = new CatalogMutationClient(
      new HttpClient("https://admin.example.test", platform),
      sessions,
    );
  const op = box.enqueue(input(), ids(100));
  for (let i = 0; i < 8; i++) box.recordFailure(op, "backend_temporary");
  const before = box.pendingForCurrentShop(id(1))[0];
  assert.equal(before.state, "failed_terminal");
  box.retryExhausted(id(1), op);
  const after = box.pendingForCurrentShop(id(1))[0];
  assert.deepEqual(after.payload, before.payload);
  assert.equal(after.idempotencyKey, before.idempotencyKey);
  assert.equal(after.operationId, before.operationId);
  platform.queuedResponses.push(success());
  await box.flush(client, id(1));
  assert.equal(platform.requests.length, 1);
  assert.equal(platform.requests[0].headers["Idempotency-Key"], ids(100).idempotencyKey);
  assert.equal(box.pendingForCurrentShop(id(1)).length, 0);
});
test("F04 corrupt index recovery preserves every account/shop journal and discard fails closed", () => {
  const platform = new FakePlatform(),
    sessions = new SessionStore(platform, () => 1000);
  session(sessions);
  const box = new DurableCatalogOutbox(platform, sessions);
  box.enqueue(input(), ids(100));
  box.enqueue({ ...input(3), shopId: id(9) }, ids(200));
  const journals = new Map(
    [...platform.storage].filter(([k]) => k !== "mc.catalogOutbox.v2.scopes"),
  );
  platform.storage.set("mc.catalogOutbox.v2.scopes", "{broken");
  assert.throws(() => box.discard("a".repeat(64), id(1)));
  for (const [k, v] of journals) assert.equal(platform.storage.get(k), v);
  assert.throws(() => box.pendingForCurrentShop(id(1)));
  box.recover(id(1));
  assert.equal(platform.storage.get("mc.catalogOutbox.v2.scopes.preserved"), "{broken");
  assert.equal(box.pendingForCurrentShop(id(1)).length, 1);
  assert.equal(box.pendingForCurrentShop(id(9)).length, 1);
  for (const [k, v] of journals) assert.equal(platform.storage.get(k), v);
});
test("F02 automatic relation refresh keeps the loaded 250-row window with bounded requests", async () => {
  for (const [plural, kind] of [
    ["categories", "category"],
    ["suppliers", "supplier"],
  ]) {
    const rows = Array.from({ length: 250 }, (_, i) => ({
      [`${kind}_id`]: id(i + 1),
      [`${kind}_name`]: "Name",
      updated_at: "2026-09-25T12:00:00Z",
    }));
    let calls = 0;
    const a = app({
      [plural]: async (_shop, _search, o = {}) => {
        calls++;
        const at = o.afterId ? rows.findIndex((r) => r[`${kind}_id`] === o.afterId) + 1 : 0;
        return rows.slice(at, at + 100);
      },
    });
    const p = page(plural, a);
    await p.load();
    await p.load(true);
    await p.load(true);
    await p.applySync({ shopId: id(1), kind: "reconcile" });
    assert.equal(p.data.items.length, 250);
    assert.equal(calls, 6);
    assert.equal(p.data.hasMore, false);
  }
});
