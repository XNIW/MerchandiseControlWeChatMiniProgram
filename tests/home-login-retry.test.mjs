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
    sensitiveCaches: { register() {} },
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
