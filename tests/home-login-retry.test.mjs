import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { AuthContractError } = require("../dist-test/miniprogram/lib/contracts.js");

function harness() {
  let definition;
  let session = null;
  const previous = { Page: globalThis.Page, getApp: globalThis.getApp };
  const app = {
    featureReady: true,
    locale: "en",
    sensitiveCaches: { generation: 1, register() {} },
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
