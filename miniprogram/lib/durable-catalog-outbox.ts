import {
  type CatalogMutationAttemptIdentifiers,
  type CatalogMutationClient,
  canonicalizeCatalogMutationInput,
  validateCatalogMutationAttemptIdentifiers,
} from "./catalog-mutation-client";
import {
  CatalogMutationContractError,
  type CatalogMutationErrorCode,
  type CatalogMutationInput,
  type CatalogMutationOperation,
  type CatalogMutationResult,
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
  readonly revisionFrom?: string;
  readonly intentId?: string;
  readonly errorCode?: CatalogMutationErrorCode;
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
  return (
    code === "backend_temporary" ||
    code === "offline" ||
    code === "retryable_error" ||
    code === "rate_limited"
  );
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
    code === "account_suspended" ||
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
    const knownKeys = new Set<string>();
    const entries = parsed.entries.map((raw) => {
      if (
        !raw ||
        typeof raw !== "object" ||
        raw.canonicalUserFingerprint !== fingerprint ||
        raw.shopId !== shopId ||
        !uuidPattern.test(raw.operationId) ||
        knownOperationIds.has(raw.operationId) ||
        (raw.revisionFrom !== undefined && !knownOperationIds.has(raw.revisionFrom)) ||
        (raw.intentId !== undefined && !uuidPattern.test(raw.intentId)) ||
        !uuidPattern.test(raw.idempotencyKey) ||
        knownKeys.has(raw.idempotencyKey) ||
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
      knownKeys.add(entry.idempotencyKey);
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
  #flushing = new Map<
    string,
    { generation: number; task: Promise<readonly CatalogMutationResult[]> }
  >();
  #completedIntents = new Set<string>();
  #storageErrors = new Set<string>();
  storageUnavailableForShop(shopId: string): boolean {
    return this.#storageErrors.has(`${this.#sessions.load()?.accountFingerprint}:${shopId}`);
  }
  #managed = false;
  #activeShop: string | null = null;
  #contextVersion = 0;
  setActiveContext(shopId: string | null): void {
    if (!this.#managed || this.#activeShop !== shopId) {
      this.#contextVersion++;
      this.#managed = true;
      this.#activeShop = shopId;
    }
  }
  #outcomes = new Map<string, CatalogMutationResult>();
  #listeners = new Set<() => void>();

  constructor(platform: MiniProgramPlatform, sessions: SessionStore, now = () => Date.now()) {
    this.#platform = platform;
    this.#sessions = sessions;
    this.#now = now;
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
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
    if (existing) {
      if (
        JSON.stringify(entryInput(existing)) !== JSON.stringify(canonical) ||
        existing.operationId !== ids.correlationId
      )
        throw new CatalogMutationContractError("idempotency_conflict");
      return existing.operationId;
    }
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
        errorCode: code,
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
    this.#scopes();
    const session = this.#sessions.load();
    return session ? this.#load(session.accountFingerprint, shopId).entries : [];
  }

  scopesForCurrentAccount(): readonly string[] {
    const fingerprint = this.#sessions.load()?.accountFingerprint;
    return this.#scopes()
      .filter((s) => s.startsWith(`${fingerprint}:`))
      .map((s) => s.split(":")[1] as string);
  }

  discard(accountFingerprint: string, shopId: string): void {
    if (!fingerprintPattern.test(accountFingerprint) || !uuidPattern.test(shopId)) return;
    if (this.#flushing.has(`${accountFingerprint}:${shopId}`)) throw new Error("outbox_busy");
    const scopes = this.#scopes().filter((scope) => scope !== `${accountFingerprint}:${shopId}`);
    this.#platform.removeStorage(scopeKey(accountFingerprint, shopId));
    this.#platform.setStorage(indexKey, JSON.stringify(scopes));
  }

  flush(client: CatalogMutationClient, shopId: string): Promise<readonly CatalogMutationResult[]> {
    const session = this.#sessions.load();
    if (!session) return Promise.resolve([]);
    const key = `${session.accountFingerprint}:${shopId}`;
    const generation = this.#sessions.generation;
    const existing = this.#flushing.get(key);
    if (existing)
      return existing.generation === generation
        ? existing.task
        : existing.task.then(() => this.flush(client, shopId));
    const task = this.#flush(client, shopId).finally(() => {
      if (this.#flushing.get(key)?.task === task) this.#flushing.delete(key);
    });
    this.#flushing.set(key, { generation, task });
    return task;
  }

  /** Single durable sender shared by page attempts and automatic drain. */
  async submit(
    client: CatalogMutationClient,
    input: CatalogMutationInput,
    ids: CatalogMutationAttemptIdentifiers,
    generation: number,
  ) {
    client.assertSessionGeneration(generation);
    const fingerprint = this.#sessions.load()?.accountFingerprint;
    if (!fingerprint) throw new CatalogMutationContractError("session_expired");
    const resultKey = `${fingerprint}:${input.shopId}:${ids.correlationId}`;
    const completed = this.#outcomes.get(resultKey);
    if (completed) return completed;
    this.enqueue(input, ids);
    await this.flush(client, input.shopId);
    if (
      this.pendingForCurrentShop(input.shopId).some(
        (e) => e.operationId === ids.correlationId && e.state === "pending",
      )
    )
      await this.flush(client, input.shopId);
    client.assertSessionGeneration(generation);
    const result = this.#outcomes.get(resultKey);
    if (result) return result;
    const entry = this.#load(fingerprint, input.shopId).entries.find(
      (e) => e.operationId === ids.correlationId,
    );
    throw new CatalogMutationContractError(entry?.errorCode ?? "retryable_error");
  }

  /** Persist the entire user intention in one storage write before any network request. */
  enqueueSequence(
    inputs: readonly CatalogMutationInput[],
    identifiers: readonly CatalogMutationAttemptIdentifiers[],
  ): string {
    const session = this.#sessions.load();
    if (!session) throw new CatalogMutationContractError("session_expired");
    const first = inputs[0];
    const intent = identifiers[0]?.correlationId;
    if (!first || !intent || inputs.length !== identifiers.length || inputs.length > 3)
      throw new Error("invalid_outbox");
    const queue = this.#load(session.accountFingerprint, first.shopId);
    if (queue.entries.length + inputs.length > maximumEntries) throw new Error("outbox_full");
    const entries: CatalogOutboxEntry[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const input = canonicalizeCatalogMutationInput(inputs[i] as CatalogMutationInput);
      const ids = validateCatalogMutationAttemptIdentifiers(
        identifiers[i] as CatalogMutationAttemptIdentifiers,
      );
      const target = "targetId" in input ? input.targetId : ids.idempotencyKey;
      if (input.shopId !== first.shopId || !target) throw new Error("invalid_outbox");
      const previous = entries[i - 1];
      const now = this.#now();
      entries.push({
        attempts: 0,
        canonicalUserFingerprint: session.accountFingerprint,
        createdAt: now,
        dependencyOperationIds: previous
          ? [previous.operationId]
          : queue.entries
              .filter(
                (e) => entityKey(e) === `${input.shopId}:${entityType(input.operation)}:${target}`,
              )
              .map((e) => e.operationId),
        ...(isCreate(input.operation)
          ? { temporaryId: target }
          : { entityId: target, expectedUpdatedAt: input.expectedUpdatedAt as string }),
        ...(previous ? { revisionFrom: previous.operationId } : {}),
        intentId: intent,
        entityType: entityType(input.operation),
        idempotencyKey: ids.idempotencyKey,
        operationId: ids.correlationId,
        nextRetryAt: now,
        operation: input.operation,
        payload: input.payload,
        shopId: input.shopId,
        state: "pending",
        updatedAt: now,
      });
    }
    if (
      new Set([...queue.entries, ...entries].map((e) => e.operationId)).size !==
      queue.entries.length + entries.length
    )
      throw new Error("invalid_outbox");
    this.#save({ ...queue, entries: [...queue.entries, ...entries] });
    return intent;
  }

  async completeIntent(
    client: CatalogMutationClient,
    shopId: string,
    intentId: string,
    generation: number,
  ): Promise<void> {
    client.assertSessionGeneration(generation);
    await this.flush(client, shopId);
    if (
      this.pendingForCurrentShop(shopId).some(
        (e) => e.intentId === intentId && e.state === "pending",
      )
    )
      await this.flush(client, shopId);
    client.assertSessionGeneration(generation);
    const remaining = this.pendingForCurrentShop(shopId).find((e) => e.intentId === intentId);
    if (remaining) throw new CatalogMutationContractError(remaining.errorCode ?? "retryable_error");
    if (
      !this.#completedIntents.has(
        `${this.#sessions.load()?.accountFingerprint}:${shopId}:${intentId}`,
      )
    )
      throw new CatalogMutationContractError("invalid_state");
  }

  retryExhausted(shopId: string, operationId: string): void {
    const session = this.#sessions.load();
    if (!session) throw new Error("session_expired");
    const queue = this.#load(session.accountFingerprint, shopId);
    const entry = queue.entries.find((e) => e.operationId === operationId);
    if (
      !entry ||
      entry.state !== "failed_terminal" ||
      entry.attempts < maximumAttempts ||
      !entry.errorCode ||
      !isAmbiguous(entry.errorCode)
    )
      throw new Error("invalid_state");
    this.#save({
      ...queue,
      entries: queue.entries.map((e) =>
        e.operationId === operationId
          ? { ...e, state: "pending" as const, attempts: 0, nextRetryAt: this.#now() }
          : e,
      ),
    });
  }

  recover(shopId: string): void {
    const session = this.#sessions.load();
    if (!session) throw new Error("session_expired");
    let repairedIndex = false;
    try {
      this.#scopes();
    } catch {
      const keys = this.#platform.getStorageKeys?.();
      if (!keys) throw new Error("outbox_corrupt");
      const scopes = keys.flatMap((key) => {
        const m = /^mc\.catalogOutbox\.v2\.([0-9a-f]{64})\.([0-9a-f-]{36})$/.exec(key);
        return m && uuidPattern.test(m[2] ?? "") ? [`${m[1]}:${m[2]}`] : [];
      });
      const rawIndex = this.#platform.getStorage(indexKey);
      const backup = `${indexKey}.preserved`;
      if (
        this.#platform.getStorage(backup) !== undefined &&
        this.#platform.getStorage(backup) !== ""
      )
        throw new Error("outbox_recovery_exists");
      this.#platform.setStorage(
        backup,
        typeof rawIndex === "string" ? rawIndex : (JSON.stringify(rawIndex) ?? "null"),
      );
      this.#platform.setStorage(indexKey, JSON.stringify(scopes));
      repairedIndex = true;
    }
    const key = scopeKey(session.accountFingerprint, shopId),
      raw = this.#platform.getStorage(key);
    if (repairedIndex && parseQueue(raw, session.accountFingerprint, shopId)) {
      for (const listener of this.#listeners) listener();
      return;
    }
    if (typeof raw !== "string") throw new Error("outbox_corrupt");
    const stored = JSON.parse(raw) as Partial<StoredQueue>;
    if (
      stored.accountFingerprint !== session.accountFingerprint ||
      stored.shopId !== shopId ||
      stored.schemaVersion !== 2 ||
      !Array.isArray(stored.entries)
    )
      throw new Error("outbox_corrupt");
    let recovered: CatalogOutboxEntry[] = [];
    const invalidIntents = new Set<string>();
    let unattributedCorruption = false;
    for (const entry of stored.entries.slice(0, maximumEntries)) {
      const candidate = { ...stored, entries: [...recovered, entry] };
      if (parseQueue(JSON.stringify(candidate), session.accountFingerprint, shopId))
        recovered.push(entry);
      else if (entry?.intentId && uuidPattern.test(entry.intentId))
        invalidIntents.add(entry.intentId);
      else unattributedCorruption = true;
    }
    for (const entry of stored.entries.slice(maximumEntries))
      if (entry?.intentId) invalidIntents.add(entry.intentId);
    if (unattributedCorruption)
      for (const entry of recovered) if (entry.intentId) invalidIntents.add(entry.intentId);
    recovered = recovered.filter((entry) => !entry.intentId || !invalidIntents.has(entry.intentId));
    // Removing an incomplete intent must also quarantine dependent operations.
    let changed = true;
    while (changed) {
      const ids = new Set(recovered.map((e) => e.operationId));
      const next = recovered.filter((e) => e.dependencyOperationIds.every((id) => ids.has(id)));
      changed = next.length !== recovered.length;
      recovered = next;
    }
    if (!recovered.length) throw new Error("outbox_corrupt");
    const backup = key + ".preserved";
    if (this.#platform.getStorage(backup) !== undefined && this.#platform.getStorage(backup) !== "")
      throw new Error("outbox_recovery_exists");
    this.#platform.setStorage(backup, raw);
    this.#save({
      accountFingerprint: session.accountFingerprint,
      shopId,
      schemaVersion: 2,
      entries: recovered,
    });
  }

  discardIntent(shopId: string, intentId: string): void {
    const entries = this.pendingForCurrentShop(shopId).filter((e) => e.intentId === intentId);
    if (entries.some((e) => e.state === "sending")) throw new Error("outbox_busy");
    for (const entry of entries) this.discardOperation(shopId, entry.operationId);
  }

  discardOperation(shopId: string, operationId: string): void {
    const session = this.#sessions.load();
    if (!session) return;
    const queue = this.#load(session.accountFingerprint, shopId);
    const intentId = queue.entries.find((e) => e.operationId === operationId)?.intentId;
    const removed = new Set(
      intentId
        ? queue.entries.filter((e) => e.intentId === intentId).map((e) => e.operationId)
        : [operationId],
    );
    for (const entry of queue.entries)
      if (entry.dependencyOperationIds.some((id) => removed.has(id)))
        removed.add(entry.operationId);
    if (queue.entries.some((e) => removed.has(e.operationId) && e.state === "sending"))
      throw new Error("outbox_busy");
    this.#save({ ...queue, entries: queue.entries.filter((e) => !removed.has(e.operationId)) });
  }

  async #flush(client: CatalogMutationClient, shopId: string) {
    const session = this.#sessions.load();
    if (!session) return [];
    const fingerprint = session.accountFingerprint;
    const generation = this.#sessions.generation;
    const contextVersion = this.#contextVersion;
    const queue = this.#load(fingerprint, shopId);
    const results: CatalogMutationResult[] = [];
    const blockedEntities = new Set<string>();
    const remainingIds = new Set(queue.entries.map((entry) => entry.operationId));
    for (const candidate of queue.entries) {
      const entry = this.#load(fingerprint, shopId).entries.find(
        (e) => e.operationId === candidate.operationId,
      );
      if (!entry) continue;
      if (this.#managed && (this.#activeShop !== shopId || this.#contextVersion !== contextVersion))
        break;
      const currentSession = this.#sessions.load();
      if (
        !currentSession ||
        currentSession.accountFingerprint !== fingerprint ||
        this.#sessions.generation !== generation
      )
        break;
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
        const result = await client.mutate(
          entryInput(entry),
          {
            correlationId: entry.operationId,
            idempotencyKey: entry.idempotencyKey,
          },
          generation,
        );
        if (this.#sessions.generation !== generation) break;
        this.#recordSuccess(fingerprint, shopId, entry.operationId, result);
        this.#outcomes.set(`${fingerprint}:${shopId}:${entry.operationId}`, result);
        if (this.#outcomes.size > 100)
          this.#outcomes.delete(this.#outcomes.keys().next().value as string);
        remainingIds.delete(entry.operationId);
        results.push(result);
      } catch (error) {
        if (this.#sessions.generation !== generation) break;
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
    const raw = this.#platform.getStorage(scopeKey(accountFingerprint, shopId));
    if (raw === undefined || raw === null || raw === "")
      return { accountFingerprint, entries: [], schemaVersion: 2, shopId };
    const parsed = parseQueue(raw, accountFingerprint, shopId);
    if (!parsed) throw new Error("outbox_corrupt");
    return parsed;
  }

  #save(queue: StoredQueue): void {
    const encoded = JSON.stringify(queue);
    if (encoded.length > maximumBytes) throw new Error("outbox_full");
    // Register scope first: if this fails, no unindexed journal is created.
    const scope = `${queue.accountFingerprint}:${queue.shopId}`;
    try {
      const scopes = this.#scopes();
      if (!scopes.includes(scope)) {
        this.#platform.setStorage(indexKey, JSON.stringify([...scopes, scope]));
      }
      this.#platform.setStorage(scopeKey(queue.accountFingerprint, queue.shopId), encoded);
      this.#storageErrors.delete(scope);
    } catch (error) {
      this.#storageErrors.add(scope);
      for (const listener of this.#listeners) listener();
      throw error;
    }
    for (const listener of this.#listeners) listener();
  }

  #scopes(): string[] {
    const value = this.#platform.getStorage(indexKey);
    if (value === undefined || value === null || value === "") return [];
    if (typeof value !== "string" || value.length > 16_384) throw new Error("outbox_index_corrupt");
    try {
      const parsed = JSON.parse(value);
      if (
        !Array.isArray(parsed) ||
        !parsed.every(
          (item) => typeof item === "string" && /^[0-9a-f]{64}:[0-9a-f-]{36}$/.test(item),
        )
      )
        throw new Error("outbox_index_corrupt");
      return parsed;
    } catch {
      throw new Error("outbox_index_corrupt");
    }
  }

  #recordSending(fingerprint: string, shopId: string, operationId: string) {
    this.#updateScope(fingerprint, shopId, operationId, (entry) => ({
      ...entry,
      state: "sending",
      updatedAt: this.#now(),
    }));
  }

  #recordSuccess(
    fingerprint: string,
    shopId: string,
    operationId: string,
    result: CatalogMutationResult,
  ) {
    const queue = this.#load(fingerprint, shopId);
    const completed = queue.entries.find((e) => e.operationId === operationId);
    this.#save({
      ...queue,
      entries: queue.entries
        .filter((e) => e.operationId !== operationId)
        .map((entry) => {
          const { revisionFrom, ...rest } = entry;
          return {
            ...rest,
            ...(revisionFrom && revisionFrom !== operationId ? { revisionFrom } : {}),
            ...(revisionFrom === operationId ? { expectedUpdatedAt: result.updatedAt } : {}),
            dependencyOperationIds: entry.dependencyOperationIds.filter((id) => id !== operationId),
          };
        }),
    });
    if (
      completed?.intentId &&
      !queue.entries.some((e) => e.operationId !== operationId && e.intentId === completed.intentId)
    ) {
      this.#completedIntents.add(`${fingerprint}:${shopId}:${completed.intentId}`);
      if (this.#completedIntents.size > 100)
        this.#completedIntents.delete(this.#completedIntents.values().next().value as string);
    }
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
        errorCode: code,
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
