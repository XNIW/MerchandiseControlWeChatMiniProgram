import test from "node:test";
import { AuthContractError } from "../miniprogram/lib/contracts";
import { HttpClient } from "../miniprogram/lib/http-client";
import type { PlatformResponse } from "../miniprogram/lib/platform";
import { SensitiveCacheCoordinator } from "../miniprogram/lib/sensitive-cache";
import { SessionStore } from "../miniprogram/lib/session-store";
import {
  MiniSyncCoordinator,
  type MiniSyncNotification,
  miniSyncEntityIds,
  nextMiniSyncPollDelay,
} from "../miniprogram/lib/sync-coordinator";
import { assert, assertEqual, expectReject, FakePlatform } from "./fakes";

const ORIGIN = "https://admin.example.test";
const SHOP_ID = "10000000-0000-4000-8000-000000000005";
const PRODUCT_ID = "20000000-0000-4000-8000-000000000005";
const DEVICE_ID = "00000000-0000-4000-8000-000000000905";
const FINGERPRINT = "c".repeat(64);
const TOKEN = "C".repeat(43);
const SCOPE = "d".repeat(64);

function setup() {
  const platform = new FakePlatform();
  const sessions = new SessionStore(platform, () => 1_000);
  sessions.save(
    {
      accountFingerprint: FINGERPRINT,
      expiresAt: 4_600,
      expiresIn: 3_600,
      sessionToken: TOKEN,
      tokenType: "bearer",
      user: { provider: "custom:wechat" },
    },
    DEVICE_ID,
  );
  const caches = new SensitiveCacheCoordinator();
  const cleared = { catalog: 0, prices: 0, sales: 0 };
  caches.register({ clear: () => (cleared.catalog += 1) }, ["catalog"]);
  caches.register({ clear: () => (cleared.prices += 1) }, ["prices"]);
  caches.register({ clear: () => (cleared.sales += 1) }, ["sales"]);
  const coordinator = new MiniSyncCoordinator(
    new HttpClient(ORIGIN, platform),
    sessions,
    platform,
    caches,
  );
  return { caches, cleared, coordinator, platform, sessions };
}

function checkpoint(eventMaxId: string, requiresReconcile: boolean) {
  return {
    data: {
      checkpoint: {
        eventMaxId,
        requiresReconcile,
        scopeKey: SCOPE,
        shopId: SHOP_ID,
        status: requiresReconcile ? "reconcile" : "ready",
      },
      ok: true,
    },
    statusCode: 200,
  };
}

test("checkpoint reconciliation, bounded delta, and no-change cycle advance safely", async () => {
  const { cleared, coordinator, platform } = setup();
  const notifications: MiniSyncNotification[] = [];
  coordinator.subscribe((notification) => {
    notifications.push(notification);
  });
  platform.queuedResponses.push(checkpoint("10", true));
  await coordinator.syncNow(SHOP_ID);
  assertEqual(notifications[0]?.kind, "reconcile", "bootstrap requires canonical reconcile");
  assertEqual(cleared.catalog, 1, "reconcile clears catalog cache");
  assertEqual(cleared.sales, 1, "reconcile clears all sensitive caches");

  platform.queuedResponses.push(
    checkpoint("12", false),
    {
      data: {
        delta: {
          asOfEventMaxId: "12",
          hasMore: false,
          nextAfterId: "12",
          rows: [
            {
              changed_count: 1,
              created_at: "2026-08-13T12:00:00Z",
              domain: "catalog",
              entity_ids: { product_ids: ["20000000-0000-4000-8000-000000000005"] },
              event_type: "catalog_changed",
              id: "11",
              requires_full_recovery: false,
              source: "wechat_mini_program",
            },
            {
              changed_count: 1,
              created_at: "2026-08-13T12:00:01Z",
              domain: "prices",
              entity_ids: { price_ids: ["30000000-0000-4000-8000-000000000005"] },
              event_type: "prices_changed",
              id: "12",
              requires_full_recovery: false,
              source: "wechat_mini_program",
            },
          ],
          shopId: SHOP_ID,
        },
        ok: true,
      },
      statusCode: 200,
    },
    checkpoint("12", false),
  );
  await coordinator.syncNow(SHOP_ID);
  assertEqual(notifications[1]?.kind, "delta", "delta published after validation");
  assertEqual(cleared.catalog, 2, "catalog domain invalidated once");
  assertEqual(cleared.prices, 2, "price domain invalidated once");
  assertEqual(cleared.sales, 1, "unrelated sales cache is retained");
  const requestCount = platform.requests.length;
  await coordinator.syncNow(SHOP_ID);
  assertEqual(platform.requests.length, requestCount + 1, "no-change cycle uses checkpoint only");
  const stored = [...platform.storage.entries()].find(([key]) => key.includes("syncWatermark"));
  assert(stored !== undefined, "watermark persisted");
  assertEqual(JSON.parse(String(stored[1])).afterId, "12", "watermark advances after listeners");
  for (const request of platform.requests) {
    assertEqual(request.headers?.Authorization, `Bearer ${TOKEN}`, "opaque bearer is used");
    assertEqual(request.headers?.["X-WeChat-Device-ID"], DEVICE_ID, "device binding is used");
  }
});

test("malformed cursor and session replacement fail closed before watermark publication", async () => {
  const { coordinator, platform, sessions } = setup();
  platform.queuedResponses.push(checkpoint("2", true));
  await coordinator.syncNow(SHOP_ID);
  const storageBefore = JSON.stringify([...platform.storage.entries()]);
  platform.queuedResponses.push(checkpoint("4", false), {
    data: {
      delta: {
        asOfEventMaxId: "4",
        hasMore: true,
        nextAfterId: "2",
        rows: [],
        shopId: SHOP_ID,
      },
      ok: true,
    },
    statusCode: 200,
  });
  await expectReject(
    () => coordinator.syncNow(SHOP_ID),
    (error) => error instanceof AuthContractError && error.code === "backend_temporary",
  );
  assertEqual(
    JSON.stringify([...platform.storage.entries()]),
    storageBefore,
    "bad cursor cannot advance",
  );

  let resolveCheckpoint: ((value: ReturnType<typeof checkpoint>) => void) | undefined;
  const held = new Promise<ReturnType<typeof checkpoint>>((resolve) => {
    resolveCheckpoint = resolve;
  });
  platform.request = async <T>(request: Parameters<FakePlatform["request"]>[0]) => {
    platform.requests.push(request);
    return (await held) as PlatformResponse<T>;
  };
  const stale = coordinator.syncNow(SHOP_ID);
  await Promise.resolve();
  sessions.clear();
  assert(resolveCheckpoint !== undefined, "checkpoint resolver exists");
  resolveCheckpoint(checkpoint("4", false));
  await expectReject(
    () => stale,
    (error) => error instanceof AuthContractError && error.code === "session_expired",
  );
  assertEqual(
    JSON.stringify([...platform.storage.entries()]),
    storageBefore,
    "stale session cannot publish",
  );
});

test("active polling starts at three seconds, backs off to thirty, and burst entities deduplicate", () => {
  let delay = 3_000;
  delay = nextMiniSyncPollDelay(delay, false);
  assertEqual(delay, 6_000, "first idle cycle doubles delay");
  delay = nextMiniSyncPollDelay(delay, false);
  delay = nextMiniSyncPollDelay(delay, false);
  delay = nextMiniSyncPollDelay(delay, false);
  assertEqual(delay, 30_000, "idle delay is capped at thirty seconds");
  assertEqual(nextMiniSyncPollDelay(delay, true), 3_000, "a change restores active cadence");

  const notification: MiniSyncNotification = {
    events: [
      {
        changedCount: 2,
        createdAt: "2026-08-13T12:00:00Z",
        domain: "catalog",
        entityIds: { product_ids: [PRODUCT_ID, PRODUCT_ID] },
        eventType: "catalog_changed",
        id: "21",
        requiresFullRecovery: false,
        source: "android",
      },
      {
        changedCount: 1,
        createdAt: "2026-08-13T12:00:01Z",
        domain: "prices",
        entityIds: { product_ids: [PRODUCT_ID] },
        eventType: "prices_changed",
        id: "22",
        requiresFullRecovery: false,
        source: "ios",
      },
    ],
    kind: "delta",
    shopId: SHOP_ID,
  };
  assertEqual(
    JSON.stringify(miniSyncEntityIds(notification, "product_ids")),
    JSON.stringify([PRODUCT_ID]),
    "one targeted product reload represents a burst",
  );
});
