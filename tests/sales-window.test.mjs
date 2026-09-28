import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
function harness() {
  let definition;
  const source = Array.from({ length: 100 }, (_, i) => ({
    pos_sale_id: String(100 - i),
    occurred_at: `2026-09-28T10:00:${String(59 - (i % 60)).padStart(2, "0")}Z`,
    net_amount_clp: 1250,
    business_kind: "sale",
  }));
  const state = { calls: [], failPage: false, switchPage: false };
  const days = [
    {
      business_date: "2026-09-28",
      gross_sales_clp: 125000,
      net_revenue_clp: 125000,
      refunds_clp: 0,
      sale_count: 100,
    },
  ];
  const app = {
    locale: "en",
    featureReady: true,
    activeShop: {
      shop_id: "shop",
      role_key: "owner",
      currency_code: "CLP",
      time_zone: "America/Santiago",
    },
    sessionStore: { generation: 1, load: () => ({}), subscribe() {} },
    sensitiveCaches: { generation: 1, register() {} },
    salesClient: {
      async dailySummary() {
        return days[0];
      },
      async periodSummary() {
        return days;
      },
      async salesPage(_shop, options) {
        state.calls.push(options);
        assert.ok([1, 50].includes(options.limit));
        if (options.beforeId && state.failPage) throw new Error("offline");
        if (options.beforeId && state.switchPage)
          app.activeShop = { ...app.activeShop, shop_id: "other" };
        const start = options.beforeId
          ? source.findIndex((s) => s.pos_sale_id === options.beforeId) + 1
          : 0;
        return source.slice(start, start + options.limit);
      },
    },
  };
  globalThis.getApp = () => app;
  globalThis.Page = (p) => {
    definition = p;
  };
  delete require.cache[require.resolve("../dist-test/miniprogram/pages/sales/index.js")];
  require("../dist-test/miniprogram/pages/sales/index.js");
  const p = { ...definition, data: structuredClone(definition.data) };
  p.setData = (d) => Object.assign(p.data, d);
  return { p, source, state, app };
}

test("sales polling preserves the loaded keyset window and incorporates new rows without duplicates", async () => {
  const { p, source, state } = harness();
  await p.refresh(true);
  await p.loadMore();
  assert.equal(p.data.sales.length, 100);
  source.unshift({ ...source[0], pos_sale_id: "new", occurred_at: "2026-09-28T11:00:00Z" });
  assert.equal(await p.refresh(true, true), true);
  assert.equal(p.data.sales.length, 100);
  assert.deepEqual(
    p.data.sales.map((s) => s.pos_sale_id),
    source.slice(0, 100).map((s) => s.pos_sale_id),
  );
  assert.equal(new Set(p.data.sales.map((s) => s.pos_sale_id)).size, 100);
  assert.equal(state.calls.length, 4);
  await p.refresh(true);
  assert.equal(p.data.sales.length, 50, "explicit filter refresh resets the window");
});

test("sales stops pagination after an empty final page", async () => {
  const { p, state } = harness();
  await p.refresh(true);
  await p.loadMore();
  await p.loadMore();
  assert.equal(p.data.hasMore, false);
  const calls = state.calls.length;
  await p.loadMore();
  assert.equal(state.calls.length, calls);
});

test("a failed second refresh page keeps the previous window and reports failure", async () => {
  const { p, state } = harness();
  await p.refresh(true);
  await p.loadMore();
  const before = structuredClone(p.data.sales);
  state.failPage = true;
  assert.equal(await p.refresh(true, true), false);
  assert.deepEqual(p.data.sales, before);
  assert.ok(p.data.errorMessage);
});

test("a context switch during the second page cannot commit the new window", async () => {
  const { p, state } = harness();
  await p.refresh(true);
  await p.loadMore();
  const before = structuredClone(p.data.sales);
  state.switchPage = true;
  assert.equal(await p.refresh(true, true), false);
  assert.deepEqual(p.data.sales, before);
});

test("authorization denial clears a preserved window instead of retaining sensitive rows", async () => {
  const { p, app } = harness();
  await p.refresh(true);
  await p.loadMore();
  app.salesClient.salesPage = async () => {
    throw { code: "membership_missing" };
  };
  assert.equal(await p.refresh(true, true), false);
  assert.equal(p.data.sales.length, 0);
  assert.equal(p.data.hasMore, false);
  assert.equal(p.data.errorMessage, p.data.text.membershipRemoved);
  assert.equal(p.data.saleCount, 0);
  assert.equal(p.data.timeZone, "");
});

test("sales filter labels are localized while on-wire values and unknown payment names are preserved", async () => {
  const { salesCodeLabel } = require("../dist-test/miniprogram/pages/sales-labels.js");
  const { translationsFor } = require("../dist-test/miniprogram/locales/index.js");
  for (const locale of ["zh-Hans", "en", "es", "it"]) {
    const text = translationsFor(locale);
    for (const domain of ["kind", "status", "payment"])
      assert.equal(salesCodeLabel("", domain, text), text.all);
    assert.equal(salesCodeLabel("refund", "kind", text), text.saleKindRefund);
    assert.equal(salesCodeLabel("accepted", "status", text), text.saleStatusAccepted);
    assert.equal(salesCodeLabel("transfer", "payment", text), text.paymentTransfer);
    for (const code of ["Custom payment", "constructor", "toString", "__proto__"])
      assert.equal(salesCodeLabel(code, "payment", text), code);
    const { p, state } = harness();
    p.data.text = text;
    p.data.kindIndex = 2;
    p.data.statusIndex = 1;
    p.data.paymentMethods = ["", "cash"];
    p.data.paymentIndex = 1;
    await p.refresh(true);
    assert.equal(state.calls[0].kind, "refund");
    assert.equal(state.calls[0].status, "accepted");
    assert.equal(state.calls[0].paymentMethod, "cash");
    assert.equal(p.data.sales[0].kindLabel, text.saleKindSale);
  }
});

function deferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

test("scope changes clear the previous window even when the new summary fails", async () => {
  const { p, app } = harness();
  await p.refresh(true);
  await p.loadMore();
  app.activeShop = { ...app.activeShop, shop_id: "other" };
  app.sensitiveCaches.generation++;
  app.salesClient.dailySummary = async () => {
    throw { code: "offline" };
  };
  await p.refresh(true, true);
  assert.equal(p.data.sales.length, 0);
  assert.equal(p.data.days.length, 0);
});

test("hide during loadMore releases loading and permits a fresh return", async () => {
  const { p, app, state } = harness();
  await p.refresh(true);
  const gate = deferred();
  const read = app.salesClient.salesPage;
  app.salesClient.salesPage = async (...args) => {
    await gate.promise;
    return read(...args);
  };
  const pending = p.loadMore();
  p.onHide();
  gate.resolve();
  await pending;
  assert.equal(p.data.loading, false);
  const before = state.calls.length;
  await p.refresh(true, true);
  assert.ok(state.calls.length > before);
  assert.equal(p.data.loading, false);
});

test("the refresh lock includes business-date resolution and prevents concurrent loadMore", async () => {
  const { p, app, state } = harness();
  await p.refresh(true);
  await p.loadMore();
  const gate = deferred();
  const summary = app.salesClient.dailySummary;
  app.salesClient.dailySummary = async () => {
    await gate.promise;
    return summary();
  };
  const pending = p.refresh(true, true);
  await Promise.resolve();
  await Promise.resolve();
  const before = state.calls.length;
  await p.loadMore();
  assert.equal(state.calls.length, before);
  gate.resolve();
  await pending;
  assert.equal(p.data.sales.length, 100);
});

test("typing a search invalidates the old window before debounce and never mixes keyset queries", async () => {
  const { p, app, state } = harness();
  await p.refresh(true);
  await p.loadMore();
  const gate = deferred();
  const entered = deferred();
  const read = app.salesClient.salesPage;
  app.salesClient.salesPage = async (...args) => {
    entered.resolve();
    await gate.promise;
    return read(...args);
  };
  const pending = p.refresh(true, true);
  await entered.promise;
  p.searchSale({ detail: { value: "NEW" } });
  gate.resolve();
  assert.equal(await pending, false);
  p.onHide();
  assert.equal(p.data.sales.length, 0);
  assert.equal(state.calls.at(-1).saleNumber, undefined);
});

test("onShow clears every old-scope value before waiting for filter discovery", async () => {
  const { p, app } = harness();
  await p.refresh(true);
  app.activeShop = { ...app.activeShop, shop_id: "other" };
  app.sensitiveCaches.generation++;
  const gate = deferred();
  app.salesClient.dailySummary = async () => {
    await gate.promise;
    throw { code: "offline" };
  };
  globalThis.wx = { setNavigationBarTitle() {} };
  p.onShow();
  assert.equal(p.data.sales.length, 0);
  assert.equal(p.data.saleCount, 0);
  assert.equal(p.data.timeZone, "");
  p.onHide();
  gate.resolve();
});

test("known sales EOF survives polling and is reopened only when another row exists", async () => {
  const { p, source, state } = harness();
  await p.refresh(true);
  await p.loadMore();
  await p.loadMore();
  assert.equal(p.data.hasMore, false);
  await p.refresh(true, true);
  assert.equal(p.data.sales.length, 100);
  assert.equal(p.data.hasMore, false);
  assert.equal(state.calls.at(-1).limit, 1);
  source.unshift({ ...source[0], pos_sale_id: "new", occurred_at: "2026-09-28T11:00:00Z" });
  await p.refresh(true, true);
  assert.equal(p.data.hasMore, true);
  await p.loadMore();
  assert.equal(p.data.sales.length, 101);
  assert.equal(new Set(p.data.sales.map((s) => s.pos_sale_id)).size, 101);
  assert.equal(p.data.hasMore, false);
});

test("returning to sales does not resurrect a cached load-more control after EOF", async () => {
  const { p, source, state } = harness();
  source.splice(50);
  await p.refresh(true);
  await p.loadMore();
  assert.equal(p.data.hasMore, false);
  await p.refresh(false, true);
  assert.equal(p.data.hasMore, false);
  assert.equal(state.calls.at(-1).limit, 1);
});
