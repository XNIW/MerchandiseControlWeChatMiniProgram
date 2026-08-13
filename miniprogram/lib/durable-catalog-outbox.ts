import {
  type CatalogMutationAttemptIdentifiers,
  type CatalogMutationClient,
  canonicalizeCatalogMutationInput,
  validateCatalogMutationAttemptIdentifiers,
} from "./catalog-mutation-client";
import type {
  CatalogMutationErrorCode,
  CatalogMutationInput,
  CatalogMutationOperation,
  CatalogMutationResult,
} from "./contracts";
import type { MiniProgramPlatform } from "./platform";
import type { SessionStore } from "./session-store";

const indexKey = "mc.catalogOutbox.v2.scopes";
const maximumEntries = 100;
const maximumBytes = 256 * 1024;
const maximumAttempts = 8;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const fingerprintPattern = /^[0-9a-f]{64}$/;

export type CatalogOutboxState =
  | "applied"
  | "auth_required"
  | "conflict"
  | "failed_terminal"
  | "pending"
  | "permission_revoked"
  | "retry_wait"
  | "sending";

export type CatalogOutboxEntityType = "category" | "product" | "supplier";

export interface CatalogOutboxEntry {
  readonly attempts: number;
  readonly canonicalUserFingerprint: string;
  readonly createdAt: number;
  readonly dependencyOperationIds: readonly string[];
  readonly entityId?: string;
  readonly entityType: CatalogOutboxEntityType;
  readonly expectedUpdatedAt?: string;
  readonly idempotencyKey: string;
  readonly nextRetryAt: number;
  readonly operation: CatalogMutationOperation;
  readonly operationId: string;
  readonly payload: CatalogMutationInput["payload"];
  readonly shopId: string;
  readonly state: CatalogOutboxState;
  readonly temporaryId?: string;
  readonly updatedAt: number;
}

interface StoredQueue {
  readonly accountFingerprint: string;
  readonly entries: readonly CatalogOutboxEntry[];
  readonly schemaVersion: 2;
  readonly shopId: string;
}

function scopeKey(accountFingerprint: string, shopId: string) {
  return `mc.catalogOutbox.v2.${accountFingerprint}.${shopId}`;
}

function isAmbiguous(code: CatalogMutationErrorCode) {
  return code === "backend_temporary" || code === "offline" || code === "retryable_error";
}

function terminalState(code: CatalogMutationErrorCode): CatalogOutboxState {
  if (code === "session_expired" || code === "unauthenticated") return "auth_required";
  if (code === "conflict" || code === "stale_version" || code === "idempotency_conflict") {
    return "conflict";
  }
  if (
    code === "membership_missing" ||
    code === "permission_denied" ||
    code === "profile_suspended" ||
    code === "shop_suspended"
  ) {
    return "permission_revoked";
  }
  return "failed_terminal";
}

function entityType(operation: CatalogMutationOperation): CatalogOutboxEntityType {
  return operation.split("_")[0] as CatalogOutboxEntityType;
}

function retryDelay(attempts: number, idempotencyKey: string) {
  const exponential = Math.min(60_000, 1_000 * 2 ** Math.min(attempts, 6));
  const jitter = Number.parseInt(idempotencyKey.slice(-3), 16) % 1_000;
  return exponential + jitter;
}

function isCreate(operation: CatalogMutationOperation) {
  return (
    operation === "product_create" ||
    operation === "category_create" ||
    operation === "supplier_create"
  );
}

function targetOf(entry: CatalogOutboxEntry) {
  return entry.entityId ?? entry.temporaryId;
}

function entityKey(
  entry: Pick<CatalogOutboxEntry, "entityId" | "entityType" | "shopId" | "temporaryId">,
) {
  return `${entry.shopId}:${entry.entityType}:${entry.entityId ?? entry.temporaryId}`;
}

function entryInput(entry: CatalogOutboxEntry): CatalogMutationInput {
  const targetId = targetOf(entry);
  if (!targetId) throw new Error("invalid_outbox");
  const input = isCreate(entry.operation)
    ? {
        operation: entry.operation,
        payload: entry.payload,
        shopId: entry.shopId,
        targetId,
      }
    : {
        expectedUpdatedAt: entry.expectedUpdatedAt,
        operation: entry.operation,
        payload: entry.payload,
        shopId: entry.shopId,
        targetId,
      };
  return canonicalizeCatalogMutationInput(input as CatalogMutationInput);
}

function parseQueue(value: unknown, fingerprint: string, shopId: string): StoredQueue | null {
  if (typeof value !== "string" || value.length > maximumBytes) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredQueue>;
    if (
      parsed.schemaVersion !== 2 ||
      parsed.accountFingerprint !== fingerprint ||
      parsed.shopId !== shopId ||
      !Array.isArray(parsed.entries) ||
      parsed.entries.length > maximumEntries
    ) {
      return null;
    }
    const knownOperationIds = new Set<string>();
    const entries = parsed.entries.map((raw) => {
      if (
        !raw ||
        typeof raw !== "object" ||
        raw.canonicalUserFingerprint !== fingerprint ||
        raw.shopId !== shopId ||
        !uuidPattern.test(raw.operationId) ||
        !uuidPattern.test(raw.idempotencyKey) ||
        !Number.isSafeInteger(raw.attempts) ||
        raw.attempts < 0 ||
        raw.attempts > maximumAttempts ||
        !Number.isSafeInteger(raw.createdAt) ||
        !Number.isSafeInteger(raw.updatedAt) ||
        !Number.isSafeInteger(raw.nextRetryAt) ||
        !Array.isArray(raw.dependencyOperationIds) ||
        raw.dependencyOperationIds.some(
          (id: unknown) =>
            typeof id !== "string" || !uuidPattern.test(id) || !knownOperationIds.has(id),
        ) ||
        ![
          "applied",
          "auth_required",
          "conflict",
          "failed_terminal",
          "pending",
          "permission_revoked",
          "retry_wait",
          "sending",
        ].includes(raw.state)
      ) {
        throw new Error("invalid_outbox");
      }
      const entry = raw as CatalogOutboxEntry;
      const input = entryInput(entry);
      if (
        entityType(input.operation) !== entry.entityType ||
        (entry.entityId !== undefined && !uuidPattern.test(entry.entityId)) ||
        (entry.temporaryId !== undefined && !uuidPattern.test(entry.temporaryId)) ||
        (isCreate(entry.operation) ? !entry.temporaryId : !entry.entityId)
      ) {
        throw new Error("invalid_outbox");
      }
      knownOperationIds.add(entry.operationId);
      return entry;
    });
    return { accountFingerprint: fingerprint, entries, schemaVersion: 2, shopId };
  } catch {
    return null;
  }
}

export class DurableCatalogOutbox {
  readonly #now: () => number;
  readonly #platform: MiniProgramPlatform;
  readonly #sessions: SessionStore;
  #flushing: Promise<readonly CatalogMutationResult[]> | null = null;

  constructor(platform: MiniProgramPlatform, sessions: SessionStore, now = () => Date.now()) {
    this.#platform = platform;
    this.#sessions = sessions;
    this.#now = now;
  }

  enqueue(input: CatalogMutationInput, identifiers: CatalogMutationAttemptIdentifiers): string {
    const session = this.#sessions.load();
    if (!session) throw new Error("session_expired");
    const ids = validateCatalogMutationAttemptIdentifiers(identifiers);
    const withStableCreateTarget =
      isCreate(input.operation) && !("targetId" in input)
        ? ({ ...input, targetId: ids.idempotencyKey } as CatalogMutationInput)
        : input;
    const canonical = canonicalizeCatalogMutationInput(withStableCreateTarget);
    const queue = this.#load(session.accountFingerprint, canonical.shopId);
    const existing = queue.entries.find((entry) => entry.idempotencyKey === ids.idempotencyKey);
    if (existing) return existing.operationId;
    if (queue.entries.length >= maximumEntries) throw new Error("outbox_full");
    const targetId = "targetId" in canonical ? canonical.targetId : undefined;
    if (!targetId) throw new Error("invalid_outbox");
    const type = entityType(canonical.operation);
    const identity = `${canonical.shopId}:${type}:${targetId}`;
    const dependencies = queue.entries
      .filter((entry) => entityKey(entry) === identity && entry.state !== "applied")
      .map((entry) => entry.operationId);
    const now = this.#now();
    const entry: CatalogOutboxEntry = {
      attempts: 0,
      canonicalUserFingerprint: session.accountFingerprint,
      createdAt: now,
      dependencyOperationIds: dependencies,
      ...(isCreate(canonical.operation) ? { temporaryId: targetId } : { entityId: targetId }),
      entityType: type,
      ...(isCreate(canonical.operation) ? {} : { expectedUpdatedAt: canonical.expectedUpdatedAt }),
      idempotencyKey: ids.idempotencyKey,
      nextRetryAt: now,
      operation: canonical.operation,
      operationId: ids.correlationId,
      payload: canonical.payload,
      shopId: canonical.shopId,
      state: "pending",
      updatedAt: now,
    };
    this.#save({ ...queue, entries: [...queue.entries, entry] });
    return entry.operationId;
  }

  recordSending(operationId: string): void {
    this.#updateCurrent(operationId, (entry) => ({
      ...entry,
      state: "sending",
      updatedAt: this.#now(),
    }));
  }

  recordSuccess(operationId: string): void {
    this.#updateCurrent(operationId, (entry) => ({
      ...entry,
      state: "applied",
      updatedAt: this.#now(),
    }));
    this.#removeCurrent(operationId);
  }

  recordFailure(operationId: string, code: CatalogMutationErrorCode): void {
    this.#updateCurrent(operationId, (entry) => {
      const attempts = Math.min(maximumAttempts, entry.attempts + 1);
      const retry = isAmbiguous(code) && attempts < maximumAttempts;
      return {
        ...entry,
        attempts,
        nextRetryAt: retry
          ? this.#now() + retryDelay(attempts, entry.idempotencyKey)
          : entry.nextRetryAt,
        state: retry ? "retry_wait" : terminalState(code),
        updatedAt: this.#now(),
      };
    });
  }

  resumeAuthRequired(shopId: string): void {
    const session = this.#sessions.load();
    if (!session) return;
    const queue = this.#load(session.accountFingerprint, shopId);
    const now = this.#now();
    this.#save({
      ...queue,
      entries: queue.entries.map((entry) =>
        entry.state === "auth_required"
          ? { ...entry, nextRetryAt: now, state: "pending", updatedAt: now }
          : entry,
      ),
    });
  }

  pendingForCurrentShop(shopId: string): readonly CatalogOutboxEntry[] {
    const session = this.#sessions.load();
    return session ? this.#load(session.accountFingerprint, shopId).entries : [];
  }

  discard(accountFingerprint: string, shopId: string): void {
    if (!fingerprintPattern.test(accountFingerprint) || !uuidPattern.test(shopId)) return;
    this.#platform.removeStorage(scopeKey(accountFingerprint, shopId));
    const scopes = this.#scopes().filter((scope) => scope !== `${accountFingerprint}:${shopId}`);
    this.#platform.setStorage(indexKey, JSON.stringify(scopes));
  }

  flush(client: CatalogMutationClient, shopId: string) {
    if (this.#flushing) return this.#flushing;
    const task = this.#flush(client, shopId).finally(() => {
      if (this.#flushing === task) this.#flushing = null;
    });
    this.#flushing = task;
    return task;
  }

  async #flush(client: CatalogMutationClient, shopId: string) {
    const session = this.#sessions.load();
    if (!session) return [];
    const fingerprint = session.accountFingerprint;
    const queue = this.#load(fingerprint, shopId);
    const results: CatalogMutationResult[] = [];
    const blockedEntities = new Set<string>();
    const remainingIds = new Set(queue.entries.map((entry) => entry.operationId));
    for (const entry of queue.entries) {
      const currentSession = this.#sessions.load();
      if (!currentSession || currentSession.accountFingerprint !== fingerprint) break;
      const key = entityKey(entry);
      if (blockedEntities.has(key)) continue;
      if (entry.dependencyOperationIds.some((id) => remainingIds.has(id))) {
        blockedEntities.add(key);
        continue;
      }
      if (
        entry.state === "auth_required" ||
        entry.state === "conflict" ||
        entry.state === "failed_terminal" ||
        entry.state === "permission_revoked"
      ) {
        blockedEntities.add(key);
        continue;
      }
      if (entry.nextRetryAt > this.#now()) {
        blockedEntities.add(key);
        continue;
      }
      this.#recordSending(fingerprint, shopId, entry.operationId);
      try {
        const result = await client.mutate(entryInput(entry), {
          correlationId: entry.operationId,
          idempotencyKey: entry.idempotencyKey,
        });
        this.#recordSuccess(fingerprint, shopId, entry.operationId);
        remainingIds.delete(entry.operationId);
        results.push(result);
      } catch (error) {
        const code =
          error && typeof error === "object" && "code" in error && typeof error.code === "string"
            ? (error.code as CatalogMutationErrorCode)
            : "backend_temporary";
        this.#recordFailure(fingerprint, shopId, entry.operationId, code);
        blockedEntities.add(key);
      }
    }
    return results;
  }

  #load(accountFingerprint: string, shopId: string): StoredQueue {
    const parsed = parseQueue(
      this.#platform.getStorage(scopeKey(accountFingerprint, shopId)),
      accountFingerprint,
      shopId,
    );
    return parsed ?? { accountFingerprint, entries: [], schemaVersion: 2, shopId };
  }

  #save(queue: StoredQueue): void {
    const encoded = JSON.stringify(queue);
    if (encoded.length > maximumBytes) throw new Error("outbox_full");
    this.#platform.setStorage(scopeKey(queue.accountFingerprint, queue.shopId), encoded);
    const scope = `${queue.accountFingerprint}:${queue.shopId}`;
    const scopes = this.#scopes();
    if (!scopes.includes(scope)) {
      this.#platform.setStorage(indexKey, JSON.stringify([...scopes, scope]));
    }
  }

  #scopes(): string[] {
    const value = this.#platform.getStorage(indexKey);
    if (typeof value !== "string" || value.length > 16_384) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter(
            (item): item is string =>
              typeof item === "string" && /^[0-9a-f]{64}:[0-9a-f-]{36}$/.test(item),
          )
        : [];
    } catch {
      return [];
    }
  }

  #recordSending(fingerprint: string, shopId: string, operationId: string) {
    this.#updateScope(fingerprint, shopId, operationId, (entry) => ({
      ...entry,
      state: "sending",
      updatedAt: this.#now(),
    }));
  }

  #recordSuccess(fingerprint: string, shopId: string, operationId: string) {
    this.#updateScope(fingerprint, shopId, operationId, (entry) => ({
      ...entry,
      state: "applied",
      updatedAt: this.#now(),
    }));
    this.#removeScope(fingerprint, shopId, operationId);
  }

  #recordFailure(
    fingerprint: string,
    shopId: string,
    operationId: string,
    code: CatalogMutationErrorCode,
  ) {
    const attempts =
      (this.#load(fingerprint, shopId).entries.find((entry) => entry.operationId === operationId)
        ?.attempts ?? 0) + 1;
    this.#updateScope(fingerprint, shopId, operationId, (entry) => {
      const boundedAttempts = Math.min(maximumAttempts, attempts);
      const retry = isAmbiguous(code) && boundedAttempts < maximumAttempts;
      return {
        ...entry,
        attempts: boundedAttempts,
        nextRetryAt: retry
          ? this.#now() + retryDelay(boundedAttempts, entry.idempotencyKey)
          : entry.nextRetryAt,
        state: retry ? "retry_wait" : terminalState(code),
        updatedAt: this.#now(),
      };
    });
  }

  #updateCurrent(operationId: string, update: (entry: CatalogOutboxEntry) => CatalogOutboxEntry) {
    const session = this.#sessions.load();
    if (!session || !uuidPattern.test(operationId)) return;
    for (const scope of this.#scopes()) {
      const [fingerprint, shopId] = scope.split(":");
      if (fingerprint !== session.accountFingerprint || !shopId) continue;
      const queue = this.#load(fingerprint, shopId);
      if (queue.entries.some((entry) => entry.operationId === operationId)) {
        this.#updateScope(fingerprint, shopId, operationId, update);
        return;
      }
    }
  }

  #removeCurrent(operationId: string) {
    const session = this.#sessions.load();
    if (!session || !uuidPattern.test(operationId)) return;
    for (const scope of this.#scopes()) {
      const [fingerprint, shopId] = scope.split(":");
      if (fingerprint !== session.accountFingerprint || !shopId) continue;
      if (
        this.#load(fingerprint, shopId).entries.some((entry) => entry.operationId === operationId)
      ) {
        this.#removeScope(fingerprint, shopId, operationId);
        return;
      }
    }
  }

  #updateScope(
    fingerprint: string,
    shopId: string,
    operationId: string,
    update: (entry: CatalogOutboxEntry) => CatalogOutboxEntry,
  ) {
    const queue = this.#load(fingerprint, shopId);
    this.#save({
      ...queue,
      entries: queue.entries.map((entry) =>
        entry.operationId === operationId ? update(entry) : entry,
      ),
    });
  }

  #removeScope(fingerprint: string, shopId: string, operationId: string) {
    const queue = this.#load(fingerprint, shopId);
    this.#save({
      ...queue,
      entries: queue.entries
        .filter((entry) => entry.operationId !== operationId)
        .map((entry) => ({
          ...entry,
          dependencyOperationIds: entry.dependencyOperationIds.filter((id) => id !== operationId),
        })),
    });
  }
}
