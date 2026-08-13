import test from "node:test";
import { HttpClient } from "../miniprogram/lib/http-client";
import { SalesApiClient } from "../miniprogram/lib/sales-api-client";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assert, assertEqual, FakePlatform } from "./fakes";

const deviceId = "00000000-0000-4000-8000-000000000901";

function sessionFixture(expiresAt = 4_600) {
  return {
    accountFingerprint: "f".repeat(64),
    expiresAt,
    expiresIn: 3_600,
    sessionToken: "a".repeat(43),
    tokenType: "bearer" as const,
    user: {
      provider: "custom:wechat" as const,
    },
  };
}

test("session store expires locally and persists no bearer or refresh token", () => {
  const platform = new FakePlatform();
  let now = 1_000;
  const store = new SessionStore(platform, () => now);
  store.save(sessionFixture(), deviceId);
  assertEqual(platform.storage.size, 0, "tokens must remain in memory only");
  assertEqual(store.load()?.expiresAt, 4_600, "active session restored");

  now = 4_600;
  assertEqual(store.load(), null, "expired session is rejected");
  assertEqual(store.load(), null, "expired session remains cleared");
});

test("sales API sends bounded shop-scoped requests", async () => {
  const platform = new FakePlatform();
  const store = new SessionStore(platform, () => 1_000);
  store.save(sessionFixture(), deviceId);
  platform.queuedResponses.push(
    { data: { ok: true, shops: [] }, statusCode: 200 },
    { data: { ok: true, summary: [] }, statusCode: 200 },
    { data: { ok: true, sales: [] }, statusCode: 200 },
  );
  const api = new SalesApiClient(new HttpClient("https://staging.example.com", platform), store);
  const shopId = "10000000-0000-4000-8000-000000000201";

  assertEqual((await api.authorizedShops()).length, 0, "empty authorized shop fixture");
  assertEqual(await api.dailySummary(shopId), null, "empty summary fixture");
  assertEqual((await api.dailySalesPage(shopId, { limit: 50 })).length, 0, "empty sales fixture");
  const salesRequest = platform.requests[2];
  assert(salesRequest?.url.includes(`shop_id=${shopId}`), "shop id must be explicit");
  assert(salesRequest?.url.includes("limit=50"), "page must remain bounded");
  assertEqual(
    salesRequest?.headers?.Authorization,
    `Bearer ${"a".repeat(43)}`,
    "opaque bearer boundary",
  );
  assertEqual(salesRequest?.headers?.["X-WeChat-Device-ID"], deviceId, "device binding");
});

test("cross-shop response is accepted only from server-side authorization contract", async () => {
  const platform = new FakePlatform();
  const store = new SessionStore(platform, () => 1_000);
  store.save(sessionFixture(), deviceId);
  platform.queuedResponses.push({
    data: { code: "membership_missing", ok: false },
    statusCode: 403,
  });
  const api = new SalesApiClient(new HttpClient("https://staging.example.com", platform), store);
  await api
    .dailySummary("10000000-0000-4000-8000-000000000202")
    .then(() => {
      throw new Error("cross-shop response unexpectedly succeeded");
    })
    .catch((error: unknown) => {
      assert(error instanceof Error && error.message === "membership_missing", "denial preserved");
    });
});
