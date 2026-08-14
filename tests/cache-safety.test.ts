import test from "node:test";
import { BoundedCache } from "../miniprogram/lib/bounded-cache";
import { ProductImageCache } from "../miniprogram/lib/product-image-cache";
import { SensitiveCacheCoordinator, SessionBoundedCache } from "../miniprogram/lib/sensitive-cache";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assertEqual, FakePlatform } from "./fakes";

const deviceId = "00000000-0000-4000-8000-000000000901";

function sessionFixture(sessionToken: string, expiresAt: number) {
  return {
    accountFingerprint: "f".repeat(64),
    expiresAt,
    expiresIn: 3_600,
    sessionToken,
    tokenType: "bearer" as const,
    user: {
      provider: "custom:wechat" as const,
    },
  };
}

test("session-bound cache never serves after expiry or session replacement", () => {
  const platform = new FakePlatform();
  let nowSeconds = 1_000;
  const sessions = new SessionStore(platform, () => nowSeconds);
  const cache = new SessionBoundedCache<string>(2, sessions);

  sessions.save(sessionFixture("a".repeat(43), 4_600), deviceId);
  assertEqual(cache.get("missing"), undefined, "active-session cache miss is safe");
  cache.set("owner-view", "sensitive-row");
  assertEqual(cache.get("owner-view"), "sensitive-row", "active session may read its cache");

  nowSeconds = 4_600;
  assertEqual(cache.get("owner-view"), undefined, "expired session cannot read cached data");

  sessions.save(sessionFixture("b".repeat(43), 8_200), deviceId);
  cache.set("viewer-view", "viewer-row");
  sessions.save(sessionFixture("c".repeat(43), 8_200), deviceId);
  assertEqual(cache.get("viewer-view"), undefined, "replacement session has a new generation");
});

test("central coordinator clears registered caches on session and shop invalidation", () => {
  const platform = new FakePlatform();
  let nowSeconds = 1_000;
  const sessions = new SessionStore(platform, () => nowSeconds);
  const coordinator = new SensitiveCacheCoordinator();
  const cache = new BoundedCache<string>(2);
  coordinator.register(cache);
  coordinator.bindSessionStore(sessions);

  cache.set("before-sign-in", "stale");
  sessions.save(sessionFixture("a".repeat(43), 4_600), deviceId);
  assertEqual(cache.get("before-sign-in"), undefined, "sign-in/account change clears cache");

  cache.set("active", "row");
  nowSeconds = 4_600;
  assertEqual(sessions.load(), null, "fixture session expires");
  assertEqual(cache.get("active"), undefined, "expiry clears cache");

  sessions.save(sessionFixture("b".repeat(43), 8_200), deviceId);
  cache.set("replacement", "row");
  sessions.clear();
  assertEqual(cache.get("replacement"), undefined, "logout clears cache");

  cache.set("shop-a", "row");
  const generation = coordinator.generation;
  coordinator.invalidate();
  assertEqual(cache.get("shop-a"), undefined, "shop invalidation clears cache");
  assertEqual(coordinator.generation, generation + 1, "invalidation advances generation");
});

test("product image cache is shop-scoped, session-bound, and expiry-aware", () => {
  const platform = new FakePlatform();
  let nowMilliseconds = Date.parse("2026-08-13T00:00:00.000Z");
  const sessions = new SessionStore(platform, () => Math.floor(nowMilliseconds / 1_000));
  sessions.save(
    sessionFixture("a".repeat(43), Math.floor(nowMilliseconds / 1_000) + 3_600),
    deviceId,
  );
  const cache = new ProductImageCache(4, sessions, () => nowMilliseconds, 30_000);
  const shopA = "10000000-0000-4000-8000-000000000201";
  const shopB = "10000000-0000-4000-8000-000000000202";
  const productId = "20000000-0000-4000-8000-000000000201";
  const versionId = "30000000-0000-4000-8000-000000000201";
  cache.set(shopA, {
    expiresAt: new Date(nowMilliseconds + 60_000).toISOString(),
    productId,
    signedUrl: "https://storage.example.com/signed-thumbnail",
    status: "ready",
    variant: "thumb",
    versionId,
  });

  assertEqual(
    cache.get({ productId, shopId: shopB, variant: "thumb", versionId }),
    undefined,
    "another shop cannot reuse the signed URL",
  );
  assertEqual(
    cache.get({ productId, shopId: shopA, variant: "thumb", versionId })?.signedUrl,
    "https://storage.example.com/signed-thumbnail",
    "owning shop may reuse a fresh signed URL",
  );

  nowMilliseconds += 31_000;
  assertEqual(
    cache.get({ productId, shopId: shopA, variant: "thumb", versionId }),
    undefined,
    "URL inside the expiry safety window is evicted",
  );

  nowMilliseconds += 1_000;
  cache.set(shopA, {
    expiresAt: new Date(nowMilliseconds + 60_000).toISOString(),
    productId,
    signedUrl: "https://storage.example.com/new-session-thumbnail",
    status: "ready",
    variant: "thumb",
    versionId,
  });
  sessions.save(
    sessionFixture("b".repeat(43), Math.floor(nowMilliseconds / 1_000) + 3_600),
    deviceId,
  );
  assertEqual(
    cache.get({ productId, shopId: shopA, variant: "thumb", versionId }),
    undefined,
    "a replacement session cannot reuse the previous signed URL",
  );
});
