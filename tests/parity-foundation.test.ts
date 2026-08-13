import test from "node:test";
import {
  AdaptiveRefreshController,
  type RefreshScheduler,
} from "../miniprogram/lib/adaptive-refresh";
import { BoundedCache } from "../miniprogram/lib/bounded-cache";
import { resolveSalesRange, shiftDate } from "../miniprogram/lib/date-ranges";
import { HttpClient } from "../miniprogram/lib/http-client";
import { SalesApiClient } from "../miniprogram/lib/sales-api-client";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assert, assertEqual, FakePlatform } from "./fakes";

const deviceId = "00000000-0000-4000-8000-000000000901";

function activeApi(platform: FakePlatform): SalesApiClient {
  const sessions = new SessionStore(platform, () => 1_000);
  sessions.save(
    {
      accountFingerprint: "f".repeat(64),
      expiresAt: 4_600,
      expiresIn: 3_600,
      sessionToken: "a".repeat(43),
      tokenType: "bearer",
      user: { provider: "custom:wechat" },
    },
    deviceId,
  );
  return new SalesApiClient(new HttpClient("https://staging.example.com", platform), sessions);
}

test("date ranges are UTC-stable and bounded", () => {
  assertEqual(shiftDate("2024-03-01", -1), "2024-02-29", "leap day navigation");
  assertEqual(resolveSalesRange("2026-08-12", "last_7").from, "2026-08-06", "seven-day start");
  assertEqual(resolveSalesRange("2026-08-12", "month").from, "2026-08-01", "month start");
});

test("bounded cache evicts least recently used entry", () => {
  const cache = new BoundedCache<number>(2);
  cache.set("a", 1);
  cache.set("b", 2);
  assertEqual(cache.get("a"), 1, "a is refreshed");
  cache.set("c", 3);
  assertEqual(cache.get("b"), undefined, "least recent entry evicted");
  assertEqual(cache.get("c"), 3, "latest entry retained");
});

test("adaptive refresh stops and applies bounded exponential backoff", async () => {
  const callbacks: Array<() => void> = [];
  const delays: number[] = [];
  const scheduler: RefreshScheduler = {
    clear: () => undefined,
    schedule: (callback, delay) => {
      callbacks.push(callback);
      delays.push(delay);
      return callbacks.length;
    },
  };
  let attempts = 0;
  const controller = new AdaptiveRefreshController({
    baseDelayMilliseconds: 3_000,
    maximumDelayMilliseconds: 12_000,
    refresh: async () => {
      attempts += 1;
      if (attempts < 3) throw new Error("offline");
    },
    scheduler,
  });
  controller.start();
  assertEqual(delays[0], 3_000, "base delay");
  callbacks.shift()?.();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assertEqual(delays[1], 6_000, "first backoff");
  callbacks.shift()?.();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assertEqual(delays[2], 12_000, "bounded backoff");
  callbacks.shift()?.();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assertEqual(delays[3], 3_000, "success resets delay");
  controller.stop();
});

test("adaptive refresh cannot restart after stop during an in-flight refresh", async () => {
  const callbacks: Array<() => void> = [];
  const delays: number[] = [];
  const scheduler: RefreshScheduler = {
    clear: () => undefined,
    schedule: (callback, delay) => {
      callbacks.push(callback);
      delays.push(delay);
      return callbacks.length;
    },
  };
  let releaseRefresh: (() => void) | undefined;
  const controller = new AdaptiveRefreshController({
    baseDelayMilliseconds: 3_000,
    maximumDelayMilliseconds: 12_000,
    refresh: () =>
      new Promise<void>((resolve) => {
        releaseRefresh = resolve;
      }),
    scheduler,
  });

  controller.start();
  callbacks.shift()?.();
  controller.stop();
  releaseRefresh?.();
  await Promise.resolve();
  await Promise.resolve();

  assertEqual(delays.length, 1, "stopped in-flight generation must not schedule again");
  controller.start();
  assertEqual(delays.length, 2, "a later explicit start creates a fresh generation");
  controller.stop();
});

test("parity APIs stay bounded and send bearer only to HTTPS gateway", async () => {
  const platform = new FakePlatform();
  const api = activeApi(platform);
  platform.queuedResponses.push(
    { data: { days: [], ok: true }, statusCode: 200 },
    { data: { ok: true, products: [] }, statusCode: 200 },
    { data: { items: [], ok: true }, statusCode: 200 },
    { data: { events: [], ok: true }, statusCode: 200 },
    { data: { account: [], ok: true }, statusCode: 200 },
  );
  const shop = "10000000-0000-4000-8000-000000000201";
  await api.periodSummary(shop, "2026-08-01", "2026-08-12");
  await api.catalogPage(shop, { hasImage: true, limit: 50, search: "tea" });
  await api.productImages(shop, []);
  await api.syncHistory(shop);
  await api.account();
  assert(platform.requests[0]?.url.includes("from=2026-08-01"), "range start encoded");
  assert(platform.requests[1]?.url.includes("has_image=true"), "boolean filter encoded");
  assertEqual(platform.requests[2]?.method, "POST", "image references are batched");
  assertEqual(
    platform.requests[2]?.url,
    "https://staging.example.com/api/mini-program/v1/product-images/read-urls",
    "images use the membership-only Mini boundary",
  );
  assertEqual(
    platform.requests[2]?.headers?.Authorization,
    `Bearer ${"a".repeat(43)}`,
    "image auth bearer",
  );
  assert(
    platform.requests.every((request) => request.url.startsWith("https://")),
    "HTTPS-only requests",
  );
});

test("sales facets and operational filters stay server-authorized", async () => {
  const platform = new FakePlatform();
  const api = activeApi(platform);
  platform.queuedResponses.push(
    {
      data: {
        filters: {
          can_filter_operational_metadata: true,
          devices: [],
          payment_methods: ["cash"],
          staff: [],
        },
        ok: true,
      },
      statusCode: 200,
    },
    { data: { ok: true, sales: [] }, statusCode: 200 },
  );
  const shop = "10000000-0000-4000-8000-000000000201";
  const actor = "20000000-0000-4000-8000-000000000201";
  const device = "30000000-0000-4000-8000-000000000201";
  await api.salesFilterOptions(shop, "2026-08-01", "2026-08-12");
  await api.salesPage(shop, {
    deviceId: device,
    from: "2026-08-01",
    kind: "refund",
    paymentMethod: "cash",
    staffId: actor,
    status: "accepted",
    to: "2026-08-12",
  });
  assert(platform.requests[0]?.url.includes("/sales/filters?"), "facets use bounded endpoint");
  assert(platform.requests[1]?.url.includes(`staff_id=${actor}`), "staff filter is encoded");
  assert(platform.requests[1]?.url.includes(`device_id=${device}`), "device filter is encoded");
  assert(platform.requests[1]?.url.includes("payment_method=cash"), "payment filter is encoded");
});
