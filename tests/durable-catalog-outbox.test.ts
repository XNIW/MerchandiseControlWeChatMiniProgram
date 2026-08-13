import test from "node:test";
import { CatalogMutationClient } from "../miniprogram/lib/catalog-mutation-client";
import type { CatalogMutationInput } from "../miniprogram/lib/contracts";
import { DurableCatalogOutbox } from "../miniprogram/lib/durable-catalog-outbox";
import { HttpClient } from "../miniprogram/lib/http-client";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assertEqual, FakePlatform } from "./fakes";

const ORIGIN = "https://admin.example.test";
const SHOP_ID = "10000000-0000-4000-8000-000000000004";
const PRODUCT_ID = "20000000-0000-4000-8000-000000000004";
const CATEGORY_ID = "30000000-0000-4000-8000-000000000004";
const DEVICE_ID = "00000000-0000-4000-8000-000000000904";
const FINGERPRINT_A = "a".repeat(64);
const FINGERPRINT_B = "b".repeat(64);
const TOKEN_A = "A".repeat(43);
const TOKEN_B = "B".repeat(43);
const IDS = [
  {
    correlationId: "10000000-0000-4000-8000-000000000101",
    idempotencyKey: "10000000-0000-4000-8000-000000000102",
  },
  {
    correlationId: "20000000-0000-4000-8000-000000000101",
    idempotencyKey: "20000000-0000-4000-8000-000000000102",
  },
  {
    correlationId: "30000000-0000-4000-8000-000000000101",
    idempotencyKey: "30000000-0000-4000-8000-000000000102",
  },
  {
    correlationId: "40000000-0000-4000-8000-000000000101",
    idempotencyKey: "40000000-0000-4000-8000-000000000102",
  },
] as const;

function saveSession(sessions: SessionStore, fingerprint: string, token: string) {
  sessions.save(
    {
      accountFingerprint: fingerprint,
      expiresAt: 4_600,
      expiresIn: 3_600,
      sessionToken: token,
      tokenType: "bearer",
      user: { provider: "custom:wechat" },
    },
    DEVICE_ID,
  );
}

function updateInput(): CatalogMutationInput {
  return {
    expectedUpdatedAt: "2026-08-13T10:00:00Z",
    operation: "product_update",
    payload: { barcode: "CaseSensitive-1", productName: "Queued product" },
    shopId: SHOP_ID,
    targetId: PRODUCT_ID,
  };
}

function archiveInput(): CatalogMutationInput {
  return {
    expectedUpdatedAt: "2026-08-13T10:01:00Z",
    operation: "product_archive",
    payload: { reason: "queued archive" },
    shopId: SHOP_ID,
    targetId: PRODUCT_ID,
  };
}

function categoryInput(): CatalogMutationInput {
  return {
    expectedUpdatedAt: "2026-08-13T10:00:00Z",
    operation: "category_update",
    payload: { name: "Independent category" },
    shopId: SHOP_ID,
    targetId: CATEGORY_ID,
  };
}

function success(targetId: string, correlationId: string, updatedAt: string) {
  return {
    data: {
      mutation: {
        code: "success",
        correlationId,
        replayed: false,
        shopId: SHOP_ID,
        targetId,
        updatedAt,
      },
      ok: true,
    },
    statusCode: 200,
  };
}

test("durable outbox survives restart, preserves per-entity FIFO, and isolates independent work", async () => {
  const platform = new FakePlatform();
  const sessions = new SessionStore(platform, () => 1_000);
  saveSession(sessions, FINGERPRINT_A, TOKEN_A);
  let now = 10_000;
  const first = new DurableCatalogOutbox(platform, sessions, () => now);
  first.enqueue(updateInput(), IDS[0]);
  first.enqueue(archiveInput(), IDS[1]);
  first.enqueue(categoryInput(), IDS[2]);
  const stored = [...platform.storage.values()].filter((value) => typeof value === "string");
  assertEqual(
    stored.some((value) => value.includes(TOKEN_A)),
    false,
    "storage excludes bearer",
  );

  const client = new CatalogMutationClient(new HttpClient(ORIGIN, platform), sessions);
  platform.queuedResponses.push(
    new Error("offline"),
    success(CATEGORY_ID, IDS[2].correlationId, "2026-08-13T10:02:00Z"),
  );
  const firstResults = await first.flush(client, SHOP_ID);
  assertEqual(firstResults.length, 1, "independent entity succeeds despite product failure");
  assertEqual(
    (platform.requests[0]?.data as { operation?: string } | undefined)?.operation,
    "product_update",
    "first product action executes first",
  );
  assertEqual(
    (platform.requests[1]?.data as { operation?: string } | undefined)?.operation,
    "category_update",
    "independent category is not blocked",
  );
  assertEqual(first.pendingForCurrentShop(SHOP_ID).length, 2, "product queue remains durable");

  now = 20_000;
  const restarted = new DurableCatalogOutbox(platform, sessions, () => now);
  platform.queuedResponses.push(
    success(PRODUCT_ID, IDS[0].correlationId, "2026-08-13T10:03:00Z"),
    success(PRODUCT_ID, IDS[1].correlationId, "2026-08-13T10:04:00Z"),
  );
  const restartedResults = await restarted.flush(client, SHOP_ID);
  assertEqual(restartedResults.length, 2, "restart drains both ordered product actions");
  assertEqual(
    (platform.requests[2]?.data as { operation?: string } | undefined)?.operation,
    "product_update",
    "retry preserves create/update/archive-style FIFO",
  );
  assertEqual(
    (platform.requests[3]?.data as { operation?: string } | undefined)?.operation,
    "product_archive",
    "archive follows update",
  );
  assertEqual(
    platform.requests[0]?.headers?.["Idempotency-Key"],
    platform.requests[2]?.headers?.["Idempotency-Key"],
    "ambiguous retry preserves idempotency identity",
  );
  assertEqual(
    restarted.pendingForCurrentShop(SHOP_ID).length,
    0,
    "successful drain clears journal",
  );
});

test("terminal permission state is scoped to one entity and account journals never cross", async () => {
  const platform = new FakePlatform();
  const sessions = new SessionStore(platform, () => 1_000);
  saveSession(sessions, FINGERPRINT_A, TOKEN_A);
  const outbox = new DurableCatalogOutbox(platform, sessions, () => 10_000);
  outbox.enqueue(updateInput(), IDS[0]);
  outbox.enqueue(categoryInput(), IDS[2]);
  platform.queuedResponses.push(
    { data: { code: "permission_denied" }, statusCode: 403 },
    success(CATEGORY_ID, IDS[2].correlationId, "2026-08-13T10:02:00Z"),
  );
  const client = new CatalogMutationClient(new HttpClient(ORIGIN, platform), sessions);
  await outbox.flush(client, SHOP_ID);
  const pendingA = outbox.pendingForCurrentShop(SHOP_ID);
  assertEqual(pendingA.length, 1, "only terminal product remains for explicit review");
  assertEqual(pendingA[0]?.state, "permission_revoked", "permission loss is terminal and visible");

  sessions.clear();
  saveSession(sessions, FINGERPRINT_B, TOKEN_B);
  assertEqual(
    outbox.pendingForCurrentShop(SHOP_ID).length,
    0,
    "account B cannot see account A journal",
  );
  sessions.clear();
  saveSession(sessions, FINGERPRINT_A, TOKEN_A);
  assertEqual(outbox.pendingForCurrentShop(SHOP_ID).length, 1, "account A retains its review item");
  outbox.discard(FINGERPRINT_A, SHOP_ID);
  assertEqual(
    outbox.pendingForCurrentShop(SHOP_ID).length,
    0,
    "explicit discard removes the scope",
  );
});

test("client-generated create identity persists the complete create-update-archive dependency chain", async () => {
  const platform = new FakePlatform();
  const sessions = new SessionStore(platform, () => 1_000);
  saveSession(sessions, FINGERPRINT_A, TOKEN_A);
  const outbox = new DurableCatalogOutbox(platform, sessions, () => 10_000);
  const temporaryId = IDS[0].idempotencyKey;
  outbox.enqueue(
    {
      operation: "product_create",
      payload: { barcode: "Offline-1", productName: "Offline product" },
      shopId: SHOP_ID,
    },
    IDS[0],
  );
  outbox.enqueue(
    {
      expectedUpdatedAt: "2026-08-13T11:00:00Z",
      operation: "product_update",
      payload: { barcode: "Offline-1", productName: "Offline product updated" },
      shopId: SHOP_ID,
      targetId: temporaryId,
    },
    IDS[1],
  );
  outbox.enqueue(
    {
      expectedUpdatedAt: "2026-08-13T11:01:00Z",
      operation: "product_archive",
      payload: { reason: "Offline lifecycle" },
      shopId: SHOP_ID,
      targetId: temporaryId,
    },
    IDS[3],
  );

  const stored = outbox.pendingForCurrentShop(SHOP_ID);
  assertEqual(stored[0]?.temporaryId, temporaryId, "create stores only its stable temporary UUID");
  assertEqual(stored[0]?.canonicalUserFingerprint, FINGERPRINT_A, "entry binds canonical account");
  assertEqual(stored[0]?.shopId, SHOP_ID, "entry binds shop");
  assertEqual(
    stored[1]?.dependencyOperationIds[0],
    IDS[0].correlationId,
    "update depends on create",
  );
  assertEqual(
    stored[2]?.dependencyOperationIds.length,
    2,
    "archive depends on all prior entity work",
  );
  assertEqual(
    JSON.stringify([...platform.storage.values()]).includes(TOKEN_A),
    false,
    "journal has no bearer",
  );

  const client = new CatalogMutationClient(new HttpClient(ORIGIN, platform), sessions);
  platform.queuedResponses.push(
    success(temporaryId, IDS[0].correlationId, "2026-08-13T11:00:00Z"),
    success(temporaryId, IDS[1].correlationId, "2026-08-13T11:01:00Z"),
    success(temporaryId, IDS[3].correlationId, "2026-08-13T11:02:00Z"),
  );
  const results = await outbox.flush(client, SHOP_ID);
  assertEqual(results.length, 3, "all dependent operations drain once");
  assertEqual(
    JSON.stringify(
      platform.requests.map((request) => (request.data as { operation: string }).operation),
    ),
    JSON.stringify(["product_create", "product_update", "product_archive"]),
    "dependency chain is FIFO",
  );
  assertEqual(outbox.pendingForCurrentShop(SHOP_ID).length, 0, "applied journal is cleaned");
});

test("expired authentication pauses durable work until the same account explicitly resumes", async () => {
  const platform = new FakePlatform();
  const sessions = new SessionStore(platform, () => 1_000);
  saveSession(sessions, FINGERPRINT_A, TOKEN_A);
  const outbox = new DurableCatalogOutbox(platform, sessions, () => 10_000);
  outbox.enqueue(updateInput(), IDS[0]);
  const client = new CatalogMutationClient(new HttpClient(ORIGIN, platform), sessions);
  platform.queuedResponses.push({ data: { code: "session_expired" }, statusCode: 401 });
  await outbox.flush(client, SHOP_ID);
  assertEqual(outbox.pendingForCurrentShop(SHOP_ID)[0]?.state, "auth_required", "401 pauses queue");

  sessions.clear();
  saveSession(sessions, FINGERPRINT_A, TOKEN_B);
  outbox.resumeAuthRequired(SHOP_ID);
  assertEqual(
    outbox.pendingForCurrentShop(SHOP_ID)[0]?.state,
    "pending",
    "same account resumes after login",
  );
  platform.queuedResponses.push(success(PRODUCT_ID, IDS[0].correlationId, "2026-08-13T10:03:00Z"));
  await outbox.flush(client, SHOP_ID);
  assertEqual(outbox.pendingForCurrentShop(SHOP_ID).length, 0, "resumed queue applies once");
});
