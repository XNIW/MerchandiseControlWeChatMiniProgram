import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
test("F01 period rows and sale list format CLP without changing canonical amounts", () => {
  let definition;
  globalThis.getApp = () => ({
    locale: "es",
    featureReady: true,
    sessionStore: { subscribe() {} },
    sensitiveCaches: { register() {} },
    activeShop: { time_zone: "America/Santiago" },
  });
  globalThis.Page = (p) => (definition = p);
  require("../dist-test/miniprogram/pages/sales/index.js");
  const p = { ...definition, data: structuredClone(definition.data) };
  p.setData = (d) => Object.assign(p.data, d);
  p.applyResult(
    [{ gross_sales_clp: 47100, net_revenue_clp: 46000, refunds_clp: 1100, sale_count: 1 }],
    [{ net_amount_clp: 46000 }],
    "CLP",
  );
  assert.equal(p.data.days[0].grossText, "47.100");
  assert.equal(p.data.days[0].refundsText, "1.100");
  assert.equal(p.data.sales[0].netText, "46.000");
  assert.equal(p.data.days[0].gross_sales_clp, 47100);
});
