import test from "node:test";
import type { DailySalesSummary } from "../miniprogram/lib/contracts";
import { HomeSalesReader } from "../miniprogram/lib/home-sales-reader";
import { assertEqual, expectReject } from "./fakes";

const summary: DailySalesSummary = {
  business_date: "2026-09-06",
  currency_code: "CLP",
  discounts_clp: 0,
  gross_sales_clp: 100,
  latest_ledger_at: null,
  net_revenue_clp: 100,
  refund_count: 0,
  refunds_clp: 0,
  sale_count: 1,
  server_time: "2026-09-06T12:00:00Z",
  shop_id: "10000000-0000-4000-8000-000000000009",
  time_zone: "America/Santiago",
  transaction_count: 1,
  void_count: 0,
};

test("Home deterministic minute: 24 GETs instead of 60, changed ledger and day invalidate", async () => {
  let calls = 0;
  let current = summary;
  const client = {
    async dailySummary() {
      calls++;
      return { ...current, server_time: String(calls) };
    },
    async dailySalesPage() {
      calls++;
      return [];
    },
  };
  const reader = new HomeSalesReader();
  for (let time = 0; time < 60_000; time += 3_000)
    await reader.read(client, summary.shop_id, "1", time);
  assertEqual(calls, 24, "20 primary + four secondary GETs in [0,60s)");
  current = { ...current, latest_ledger_at: "2026-09-06T13:00:00Z" };
  await reader.read(client, summary.shop_id, "1", 60_000);
  assertEqual(calls, 27, "ledger change refreshes secondary fields immediately");
  current = { ...current, business_date: "2026-09-07" };
  await reader.read(client, summary.shop_id, "1", 63_000);
  assertEqual(calls, 30, "shop midnight refreshes comparison and latest sale");
  await reader.read(client, summary.shop_id, "1", 64_000, true);
  assertEqual(calls, 33, "pull refresh bypasses secondary TTL");
});

test("Home coalesces overlapping reads and isolates session/shop/cache invalidation", async () => {
  let calls = 0;
  let release: (() => void) | undefined;
  const hold = new Promise<void>((resolve) => {
    release = resolve;
  });
  const client = {
    async dailySummary() {
      calls++;
      await hold;
      return summary;
    },
    async dailySalesPage() {
      calls++;
      return [];
    },
  };
  const reader = new HomeSalesReader();
  const first = reader.read(client, summary.shop_id, "1", 0);
  const duplicate = reader.read(client, summary.shop_id, "1", 0);
  assertEqual(first, duplicate, "one in-flight primary read");
  release?.();
  await first;
  assertEqual(calls, 3, "one complete read");
  await reader.read(client, summary.shop_id, "2", 1);
  await reader.read(client, "20000000-0000-4000-8000-000000000009", "2", 2);
  reader.clear();
  await reader.read(client, summary.shop_id, "2", 3);
  assertEqual(calls, 12, "no secondary data reused across scope changes");
});

test("Home failure clears in-flight work and retry does not reuse failed secondary reads", async () => {
  const reader = new HomeSalesReader();
  let fail = true;
  let calls = 0;
  const client = {
    async dailySummary() {
      calls++;
      if (fail) throw new Error("offline");
      return summary;
    },
    async dailySalesPage() {
      calls++;
      return [];
    },
  };
  await expectReject(
    () => reader.read(client, summary.shop_id, "1"),
    () => true,
  );
  fail = false;
  await reader.read(client, summary.shop_id, "1");
  assertEqual(calls, 4, "retry performs complete read");
});

test("hidden Home does not start secondary reads after a late primary response", async () => {
  let secondary = 0;
  const reader = new HomeSalesReader();
  const client = {
    async dailySummary() {
      return summary;
    },
    async dailySalesPage() {
      secondary++;
      return [];
    },
  };
  await expectReject(
    () => reader.read(client, summary.shop_id, "1", 0, false, () => false),
    () => true,
  );
  assertEqual(secondary, 0, "hidden page cannot amplify late reads");
});
