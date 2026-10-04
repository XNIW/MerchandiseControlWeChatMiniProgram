import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { AuthContractError } = require("../dist-test/miniprogram/lib/contracts.js");
const { SensitiveCacheCoordinator } = require("../dist-test/miniprogram/lib/sensitive-cache.js");
const { HomeSalesReadObsolete } = require("../dist-test/miniprogram/lib/home-sales-reader.js");

function harness(realCaches = false) {
  let definition;
  let session = null;
  const previous = { Page: globalThis.Page, getApp: globalThis.getApp };
  const app = {
    featureReady: true,
    locale: "en",
    sensitiveCaches: realCaches
      ? new SensitiveCacheCoordinator()
      : { generation: 1, register() {} },
    sessionStore: { generation: 1, load: () => session },
    salesClient: {},
  };
  globalThis.getApp = () => app;
  globalThis.Page = (value) => {
    definition = value;
  };
  const file = require.resolve("../dist-test/miniprogram/pages/index/index.js");
  delete require.cache[file];
  require(file);
  const page = {
    ...definition,
    data: structuredClone(definition.data),
    visible: true,
    generation: 1,
  };
  page.setData = (values) => Object.assign(page.data, values);
  return {
    app,
    page,
    setSession(value) {
      session = value;
    },
    restore() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
    },
  };
}

for (const code of ["offline", "backend_temporary"]) {
  test(`failed ${code} login keeps the sign-in action usable on the same Home page`, async () => {
    const h = harness();
    try {
      let attempts = 0;
      let bootstrapCalls = 0;
      h.app.authClient = {
        async signIn() {
          attempts++;
          if (attempts === 1) throw new AuthContractError(code);
          const session = { sessionToken: "isolated-test-handoff" };
          h.setSession(session);
          h.app.sessionStore.generation++;
          return session;
        },
      };
      h.page.bootstrap = async () => {
        bootstrapCalls++;
      };
      h.page.data.currentShop = { shop_id: "old-shop" };
      h.page.data.netRevenue = "old summary";
      await h.page.signIn();
      assert.equal(h.page.data.viewState, "signed_out");
      assert.equal(
        h.page.data.errorMessage,
        h.page.data.text[code === "offline" ? "offline" : "error"],
      );
      assert.equal(h.page.data.currentShop, null);
      assert.equal(h.page.data.netRevenue, "—");
      assert.equal(bootstrapCalls, 0);
      const markup = readFileSync(
        new URL("../miniprogram/pages/index/index.wxml", import.meta.url),
        "utf8",
      );
      assert.match(markup, /viewState === 'signed_out'[^\n]+bindtap="signIn"/);
      await h.page.signIn();
      assert.equal(attempts, 2);
      assert.equal(
        bootstrapCalls,
        1,
        "new successful authentication reaches bootstrap without navigation",
      );
    } finally {
      h.restore();
    }
  });
}

test("authenticated Home read failures retain the existing read retry and shop", () => {
  const h = harness();
  try {
    h.setSession({ sessionToken: "isolated-test-session" });
    const shop = { shop_id: "current-shop" };
    h.page.data.currentShop = shop;
    for (const [code, state] of [
      ["offline", "offline"],
      ["backend_temporary", "error"],
    ]) {
      h.page.applyError(new AuthContractError(code));
      assert.equal(h.page.data.viewState, state);
      assert.equal(h.page.data.currentShop, shop);
      assert.equal(h.page.generation, 1);
    }
  } finally {
    h.restore();
  }
});

const currentShop = {
  shop_id: "10000000-0000-4000-8000-000000000009",
  shop_name: "Recovery fixture",
  currency_code: "CLP",
  time_zone: "America/Santiago",
};
const currentSummary = {
  business_date: "2026-10-04",
  currency_code: "CLP",
  discounts_clp: 0,
  gross_sales_clp: 100,
  latest_ledger_at: null,
  net_revenue_clp: 100,
  refund_count: 0,
  refunds_clp: 0,
  sale_count: 1,
  server_time: "2026-10-04T12:00:00Z",
  shop_id: currentShop.shop_id,
  time_zone: currentShop.time_zone,
  transaction_count: 1,
  void_count: 0,
};

function recoveryHarness() {
  const h = harness(true);
  h.setSession({ sessionToken: "isolated-test-session" });
  h.app.activeShop = currentShop;
  h.page.data.currentShop = currentShop;
  h.app.selectShop = (shop) => {
    h.app.activeShop = shop;
  };
  h.app.clearShopContext = () => {
    h.app.activeShop = null;
    h.app.sensitiveCaches.invalidate();
  };
  h.app.clearSessionContext = () => {
    h.setSession(null);
    h.app.sessionStore.generation++;
    h.app.clearShopContext();
  };
  const reads = [];
  h.app.salesClient.authorizedShops = () =>
    new Promise((resolve, reject) => reads.push({ resolve, reject }));
  h.app.salesClient.dailySummary = async () => currentSummary;
  h.app.salesClient.dailySalesPage = async () => [];
  return { ...h, reads };
}

async function settle() {
  for (let index = 0; index < 25; index++) await Promise.resolve();
}

test("Home automatically replaces cache-obsolete shop reads and coalesces concurrent callers", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const h = recoveryHarness();
  try {
    const original = h.page.bootstrap();
    const duplicate = h.page.bootstrap();
    assert.equal(h.reads.length, 1, "one membership RPC while a read is pending");
    h.app.sensitiveCaches.invalidate();
    const afterInvalidation = h.page.bootstrap();
    assert.equal(h.reads.length, 1, "cache invalidation joins the held read");
    h.reads[0].resolve([]);
    await Promise.all([original, duplicate, afterInvalidation]);
    assert.equal(h.app.activeShop, currentShop, "obsolete empty response cannot revoke scope");
    h.app.sensitiveCaches.invalidate();
    h.app.sensitiveCaches.invalidate();
    t.mock.timers.tick(2_999);
    await settle();
    assert.equal(h.reads.length, 1, "recovery is delayed, not an immediate RPC loop");
    t.mock.timers.tick(1);
    await settle();
    assert.equal(h.reads.length, 2, "one automatic successor without any tap");
    const manualWhileAutomatic = h.page.bootstrap();
    assert.equal(h.reads.length, 2, "manual Retry shares the automatic request");
    h.reads[1].resolve([currentShop]);
    await manualWhileAutomatic;
    await settle();
    assert.equal(h.page.data.viewState, "ready");
    assert.equal(h.page.data.netRevenue, "CLP 100");
    assert.equal(h.page.data.errorMessage, "");
    assert.equal(h.app.sessionStore.generation, 1);
  } finally {
    h.page.onHide();
    h.restore();
  }
});

test("Home bounds repeated cache recovery with the existing adaptive backoff", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const h = recoveryHarness();
  try {
    const first = h.page.bootstrap();
    h.app.sensitiveCaches.invalidate();
    h.reads[0].resolve([]);
    await first;
    for (const [index, delay] of [3_000, 6_000, 12_000, 24_000, 30_000, 30_000].entries()) {
      t.mock.timers.tick(delay - 1);
      await settle();
      assert.equal(h.reads.length, index + 1, "no early successor");
      t.mock.timers.tick(1);
      await settle();
      assert.equal(h.reads.length, index + 2, "one successor at the bounded delay");
      h.app.sensitiveCaches.invalidate();
      h.app.sensitiveCaches.invalidate();
      h.reads[index + 1].resolve([]);
      await settle();
      assert.equal(h.app.activeShop, currentShop);
      assert.equal(h.page.data.viewState, "shop_retry");
    }
    t.mock.timers.tick(30_000);
    await settle();
    h.reads.at(-1).resolve([currentShop]);
    await settle();
    assert.equal(h.page.data.viewState, "ready", "recovery remains automatic after a burst");
  } finally {
    h.page.onHide();
    h.restore();
  }
});

test("Home cancels queued cache recovery when visibility, session or authorized scope changes", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const transition of ["hidden", "session", "shop", "revoked"]) {
    const h = recoveryHarness();
    try {
      const first = h.page.bootstrap();
      h.app.sensitiveCaches.invalidate();
      h.reads[0].resolve([]);
      await first;
      if (transition === "hidden") h.page.onHide();
      if (transition === "session") h.app.sessionStore.generation++;
      if (transition === "shop") h.app.activeShop = { ...currentShop, shop_id: "other-shop" };
      if (transition === "revoked") h.app.clearShopContext();
      const scopeAfterTransition = h.app.activeShop;
      t.mock.timers.tick(60_000);
      await settle();
      assert.equal(h.reads.length, 1, `${transition} cannot start an automatic RPC`);
      assert.equal(h.app.activeShop, scopeAfterTransition, `${transition} scope is never revived`);
    } finally {
      h.page.onHide();
      h.restore();
    }
  }
});

test("Home handles temporary failure and authoritative denial separately from cache recovery", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const code of [
    "timeout",
    "offline",
    "backend_temporary",
    "membership_missing",
    "account_suspended",
    "session_expired",
    "permission_denied",
    "shop_suspended",
  ]) {
    const h = recoveryHarness();
    try {
      const first = h.page.bootstrap();
      h.app.sensitiveCaches.invalidate();
      h.reads[0].resolve([]);
      await first;
      t.mock.timers.tick(3_000);
      await settle();
      assert.equal(h.reads.length, 2);
      h.reads[1].reject(new AuthContractError(code));
      await settle();
      const denied = [
        "membership_missing",
        "account_suspended",
        "session_expired",
        "permission_denied",
        "shop_suspended",
      ].includes(code);
      assert.equal(h.app.activeShop, denied ? null : currentShop);
      assert.equal(
        h.app.sessionStore.load() === null,
        ["account_suspended", "session_expired"].includes(code),
      );
      assert.equal(
        h.page.data.viewState,
        code === "offline"
          ? "offline"
          : code === "session_expired"
            ? "session_expired"
            : denied
              ? "unauthorized"
              : "error",
      );
      t.mock.timers.tick(60_000);
      await settle();
      assert.equal(h.reads.length, 2, "a completed error is not cache-invalidated work");
    } finally {
      h.page.onHide();
      h.restore();
    }
  }
});

test("Home honors same-session authoritative denial even if the cache changed during the read", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const code of [
    "membership_missing",
    "account_suspended",
    "session_expired",
    "permission_denied",
    "shop_suspended",
  ]) {
    const h = recoveryHarness();
    try {
      const first = h.page.bootstrap();
      h.app.sensitiveCaches.invalidate();
      h.reads[0].reject(new AuthContractError(code));
      await first;
      assert.equal(h.app.activeShop, null, `${code} is authoritative for the unchanged scope`);
      t.mock.timers.tick(60_000);
      await settle();
      assert.equal(h.reads.length, 1, "denial cannot trigger a successor that revives scope");
    } finally {
      h.page.onHide();
      h.restore();
    }
  }
});

test("Home rejects cache-obsolete primary and secondary summary replies without logging out", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const phase of ["primary", "secondary"]) {
    const h = recoveryHarness();
    try {
      let release;
      h.app.salesClient.dailySummary = (_shop, date) =>
        (phase === "primary" ? date === undefined : date !== undefined)
          ? new Promise((resolve) => {
              release = resolve;
            })
          : Promise.resolve(currentSummary);
      const first = h.page.bootstrap();
      h.reads[0].resolve([currentShop]);
      await settle();
      h.app.sensitiveCaches.invalidate();
      release({ ...currentSummary, net_revenue_clp: 999 });
      await first;
      assert.equal(h.page.data.netRevenue, "—", `${phase} stale summary is not displayed`);
      assert.notEqual(h.app.sessionStore.load(), null, "local invalidation is not session expiry");
      h.app.salesClient.dailySummary = async () => currentSummary;
      t.mock.timers.tick(3_000);
      await settle();
      assert.equal(h.reads.length, 2, `${phase} also reaches the automatic successor`);
      h.reads[1].resolve([currentShop]);
      await settle();
      assert.equal(h.page.data.netRevenue, "CLP 100");
      assert.equal(h.page.data.viewState, "ready");
    } finally {
      h.page.onHide();
      h.restore();
    }
  }
});

test("Home summary denial remains authoritative across a same-scope cache change", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  for (const code of [
    "membership_missing",
    "account_suspended",
    "session_expired",
    "permission_denied",
    "shop_suspended",
  ]) {
    const h = recoveryHarness();
    try {
      let rejectSummary;
      h.app.salesClient.dailySummary = () =>
        new Promise((_resolve, reject) => {
          rejectSummary = reject;
        });
      const first = h.page.bootstrap();
      h.reads[0].resolve([currentShop]);
      await settle();
      h.app.sensitiveCaches.invalidate();
      rejectSummary(new AuthContractError(code));
      await first;
      assert.equal(h.app.activeShop, null, `${code} is a server denial, not reader cancellation`);
      t.mock.timers.tick(60_000);
      await settle();
      assert.equal(h.reads.length, 1);
    } finally {
      h.page.onHide();
      h.restore();
    }
  }
});

test("Home late recovery cannot stop or apply a successor from a newer visible lifecycle", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const h = recoveryHarness();
  try {
    const first = h.page.bootstrap();
    h.app.sensitiveCaches.invalidate();
    h.reads[0].resolve([]);
    await first;
    t.mock.timers.tick(3_000);
    await settle();
    assert.equal(h.reads.length, 2);
    h.page.onHide();
    h.page.visible = true;
    h.page.generation++;
    const newer = h.page.bootstrap();
    h.app.sensitiveCaches.invalidate();
    h.reads[2].resolve([]);
    await newer;
    const newController = h.page.shopRecovery;
    assert.ok(newController);
    h.reads[1].resolve([]);
    await settle();
    assert.equal(h.page.shopRecovery, newController, "old callback cannot cancel new recovery");
    assert.equal(h.app.activeShop, currentShop);
    t.mock.timers.tick(3_000);
    await settle();
    assert.equal(h.reads.length, 4);
    h.reads[3].resolve([currentShop]);
    await settle();
    assert.equal(h.page.data.viewState, "ready");
  } finally {
    h.page.onHide();
    h.restore();
  }
});

test("Home shared summary cancellation cannot log out any concurrent refresh caller", async () => {
  const h = recoveryHarness();
  try {
    let releaseSummary;
    let summaryReads = 0;
    h.app.salesClient.dailySummary = () => {
      summaryReads++;
      return new Promise((resolve) => {
        releaseSummary = resolve;
      });
    };
    const automatic = h.page.refresh();
    const pullDown = h.page.refresh(true);
    assert.equal(summaryReads, 1, "both real Page callers share the reader task");
    h.app.sensitiveCaches.invalidate();
    releaseSummary(currentSummary);
    const results = await Promise.allSettled([automatic, pullDown]);
    assert.ok(
      results.every(
        (result) => result.status === "rejected" && result.reason instanceof HomeSalesReadObsolete,
      ),
    );
    assert.equal(
      results[0].reason,
      results[1].reason,
      "cancellation provenance belongs to the shared task",
    );
    assert.notEqual(h.app.sessionStore.load(), null, "shared local cancellation is never logout");
    assert.equal(h.app.sessionStore.generation, 1);
    assert.equal(h.app.activeShop, currentShop);
    assert.equal(h.page.data.netRevenue, "—");
  } finally {
    h.page.onHide();
    h.restore();
  }
});

test("Home preserves adaptive recovery across repeated cache-obsolete secondary summary reads", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const h = recoveryHarness();
  try {
    const secondary = [];
    h.app.salesClient.dailySummary = (_shop, date) =>
      date === undefined
        ? Promise.resolve(currentSummary)
        : new Promise((resolve) => secondary.push(resolve));
    const first = h.page.bootstrap();
    h.reads[0].resolve([currentShop]);
    await settle();
    h.app.sensitiveCaches.invalidate();
    secondary[0](currentSummary);
    await first;
    for (const [index, delay] of [3_000, 6_000, 12_000, 24_000, 30_000, 30_000].entries()) {
      t.mock.timers.tick(delay - 1);
      await settle();
      assert.equal(h.reads.length, index + 1, "secondary cancellation cannot reset backoff");
      t.mock.timers.tick(1);
      await settle();
      assert.equal(h.reads.length, index + 2);
      h.reads[index + 1].resolve([currentShop]);
      await settle();
      assert.equal(secondary.length, index + 2, "one held secondary read per recovery");
      h.app.sensitiveCaches.invalidate();
      secondary[index + 1](currentSummary);
      await settle();
      assert.equal(h.app.sessionStore.generation, 1);
      assert.equal(h.app.activeShop, currentShop);
      assert.equal(h.page.data.netRevenue, "—");
      assert.equal(h.page.data.viewState, "shop_retry");
    }
    h.app.salesClient.dailySummary = async () => currentSummary;
    t.mock.timers.tick(30_000);
    await settle();
    h.reads.at(-1).resolve([currentShop]);
    await settle();
    assert.equal(h.page.data.viewState, "ready");
  } finally {
    h.page.onHide();
    h.restore();
  }
});

test("Home clears confirmed empty membership without logout, but ignores failed and stale reads", async () => {
  const h = harness();
  try {
    const session = { sessionToken: "isolated-test-session" };
    const shopA = { shop_id: "shop-a", shop_name: "Shop A" };
    const shopB = { shop_id: "shop-b", shop_name: "Shop B" };
    const pending = [{ shopId: shopA.shop_id, payload: "retained pending intent" }];
    const beforePending = structuredClone(pending);
    h.setSession(session);
    let cleared = 0;
    h.app.activeShop = shopA;
    h.app.outbox = { discard: () => assert.fail("membership loss cannot discard pending") };
    h.app.clearSessionContext = () => assert.fail("empty memberships cannot log out");
    h.app.clearShopContext = () => {
      cleared++;
      h.app.activeShop = null;
      h.app.sensitiveCaches.generation++;
    };
    h.page.data.currentShop = shopA;
    h.page.data.netRevenue = "old shop summary";
    h.app.salesClient.authorizedShops = async () => [];
    await h.page.bootstrap();
    assert.equal(cleared, 1, "successful empty memberships clear app scope");
    assert.equal(h.app.activeShop, null);
    assert.equal(h.page.data.currentShop, null);
    assert.equal(h.page.data.netRevenue, "—");
    assert.equal(h.page.data.viewState, "unauthorized");
    assert.equal(h.app.sessionStore.load(), session);
    assert.equal(h.app.sessionStore.generation, 1);
    assert.deepEqual(pending, beforePending);

    for (const code of ["timeout", "offline", "backend_temporary"]) {
      h.app.activeShop = shopA;
      h.page.data.currentShop = shopA;
      h.app.salesClient.authorizedShops = async () => {
        throw new AuthContractError(code);
      };
      await h.page.bootstrap();
      assert.equal(cleared, 1, `${code} cannot revoke shop context`);
      assert.equal(h.app.activeShop, shopA);
      assert.equal(h.app.sessionStore.load(), session);
    }
    for (const transition of ["hidden", "session", "shop", "cache"]) {
      h.page.visible = true;
      h.page.generation++;
      h.app.activeShop = shopA;
      let complete;
      h.app.salesClient.authorizedShops = () =>
        new Promise((resolve) => {
          complete = resolve;
        });
      const held = h.page.bootstrap();
      if (transition === "hidden") h.page.onHide();
      if (transition === "session") h.app.sessionStore.generation++;
      if (transition === "shop") h.app.activeShop = shopB;
      if (transition === "cache") h.app.sensitiveCaches.generation++;
      const activeShopAfterTransition = h.app.activeShop;
      complete([]);
      await held;
      assert.equal(cleared, 1, `${transition} invalidates the old empty membership result`);
      assert.equal(h.app.activeShop, activeShopAfterTransition);
      assert.deepEqual(pending, beforePending);
      if (transition === "cache") {
        assert.equal(
          h.page.data.viewState,
          "shop_retry",
          "same-scope cache change hands loading to a visible Retry state",
        );
        assert.equal(h.page.data.errorMessage, h.page.data.text.error);
        h.page.startAutomaticRefresh();
        assert.equal(
          h.page.refreshController,
          undefined,
          "membership Retry does not start automatic polling",
        );
      }
    }
    let rejectRead;
    h.app.salesClient.authorizedShops = () =>
      new Promise((_resolve, reject) => {
        rejectRead = reject;
      });
    const failedStaleRead = h.page.bootstrap();
    h.app.sensitiveCaches.generation++;
    rejectRead(new AuthContractError("timeout"));
    await failedStaleRead;
    assert.equal(h.page.data.viewState, "shop_retry", "stale read failure also releases loading");
    assert.equal(cleared, 1, "stale timeout does not revoke scope");
    let freshReads = 0;
    h.app.salesClient.authorizedShops = async () => {
      freshReads++;
      return [];
    };
    await h.page.bootstrap();
    assert.equal(freshReads, 1, "Retry performs one fresh authorized-shops read");
    assert.equal(cleared, 2, "fresh confirmed membership loss clears scope");
    assert.equal(h.page.data.viewState, "unauthorized", "fresh result replaces the Retry state");
    assert.equal(h.app.sessionStore.load(), session);
    assert.deepEqual(pending, beforePending);
  } finally {
    h.page.stopAutomaticRefresh();
    h.restore();
  }
});
