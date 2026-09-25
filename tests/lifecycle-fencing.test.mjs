import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
function fixture() {
  let definition;
  let calls = 0;
  const a = {
    locale: "en",
    activeShop: {
      shop_id: "shop-a",
      can_restore_products: true,
      can_write_products: true,
      can_read_catalog: true,
    },
    sessionStore: { generation: 1 },
    sensitiveCaches: { invalidate() {} },
    salesClient: { catalogLifecycle: async () => [] },
    createCatalogMutationAttempt: () => {
      calls++;
      return { state: { lifecycle: "idle" }, start: async () => {} };
    },
  };
  globalThis.getApp = () => a;
  globalThis.Page = (p) => (definition = p);
  globalThis.wx = { setNavigationBarTitle() {} };
  const path = require.resolve("../dist-test/miniprogram/pages/catalog-lifecycle/index.js");
  delete require.cache[path];
  require(path);
  const p = { ...definition, data: structuredClone(definition.data) };
  p.setData = (v) => Object.assign(p.data, v);
  p.onLoad({ type: "product" });
  p.data.canRestore = true;
  p.data.items = [{ entity_id: "product-a", updated_at: "2026-09-25T12:00:00Z" }];
  return { a, p, calls: () => calls };
}
test("lifecycle restoration cannot cross account/shop while confirmation is open", async () => {
  const { a, p, calls } = fixture();
  let confirm;
  globalThis.wx.showModal = () => new Promise((r) => (confirm = r));
  const pending = p.restore({ currentTarget: { dataset: { id: "product-a" } } });
  a.sessionStore.generation++;
  a.activeShop = { ...a.activeShop, shop_id: "shop-b" };
  confirm({ confirm: true });
  await pending;
  assert.equal(calls(), 0);
});
test("lifecycle ignores late reads after unload and distinguishes denied reads", async () => {
  const { a, p } = fixture();
  let finish;
  a.salesClient.catalogLifecycle = () => new Promise((r) => (finish = r));
  const loading = p.load(true);
  p.onUnload();
  finish([{ entity_id: "late", state: "archived" }]);
  await loading;
  assert.equal(p.data.items.length, 0);
  const f = fixture();
  const { AuthContractError } = require("../dist-test/miniprogram/lib/contracts.js");
  f.a.salesClient.catalogLifecycle = async () => {
    throw new AuthContractError("membership_missing");
  };
  await f.p.load(true);
  assert.equal(f.p.data.errorMessage, f.p.data.text.membershipRemoved);
});
