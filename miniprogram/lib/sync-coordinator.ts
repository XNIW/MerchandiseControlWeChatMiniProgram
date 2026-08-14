import { AuthContractError } from "./contracts";
import type { HttpClient } from "./http-client";
import type { MiniProgramPlatform } from "./platform";
import type { SensitiveCacheCoordinator } from "./sensitive-cache";
import type { SessionStore } from "./session-store";

const cursorPattern = /^(0|[1-9][0-9]{0,18})$/;
const scopePattern = /^[0-9a-f]{64}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maximumWatermarkBytes = 2_048;
const basePollDelayMilliseconds = 3_000;
const maximumPollDelayMilliseconds = 30_000;

export type MiniSyncPollOutcome = "changed" | "error" | "idle";

export function nextMiniSyncPollDelay(current: number, outcome: MiniSyncPollOutcome): number {
  return outcome === "changed"
    ? basePollDelayMilliseconds
    : Math.min(Math.max(basePollDelayMilliseconds, current) * 2, maximumPollDelayMilliseconds);
}

interface StoredWatermark {
  readonly afterId: string;
  readonly lastReconciledAt: string | null;
  readonly schemaVersion: 1;
  readonly scopeKey: string | null;
  readonly shopId: string;
}

export interface MiniSyncEvent {
  readonly changedCount: number;
  readonly createdAt: string;
  readonly domain: "catalog" | "history" | "prices" | "unsupported";
  readonly entityIds: Readonly<Record<string, readonly string[]>>;
  readonly eventType: string;
  readonly id: string;
  readonly requiresFullRecovery: boolean;
  readonly source: string;
}

export type MiniSyncNotification =
  | { readonly events: readonly MiniSyncEvent[]; readonly kind: "delta"; readonly shopId: string }
  | { readonly kind: "reconcile"; readonly shopId: string };

export function miniSyncEntityIds(
  notification: MiniSyncNotification,
  key: string,
  limit = 250,
): readonly string[] {
  if (notification.kind !== "delta" || limit < 1) return [];
  const ids = new Set<string>();
  for (const event of notification.events) {
    for (const id of event.entityIds[key] ?? []) {
      ids.add(id);
      if (ids.size >= limit) return [...ids];
    }
  }
  return [...ids];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function storageKey(fingerprint: string, shopId: string) {
  return `mc.syncWatermark.v1.${fingerprint}.${shopId}`;
}

function emptyWatermark(shopId: string): StoredWatermark {
  return {
    afterId: "0",
    lastReconciledAt: null,
    schemaVersion: 1,
    scopeKey: null,
    shopId,
  };
}

function parseWatermark(value: unknown, shopId: string): StoredWatermark {
  if (typeof value !== "string" || value.length > maximumWatermarkBytes) {
    return emptyWatermark(shopId);
  }
  try {
    const parsed = JSON.parse(value) as Partial<StoredWatermark>;
    return parsed.schemaVersion === 1 &&
      parsed.shopId === shopId &&
      typeof parsed.afterId === "string" &&
      cursorPattern.test(parsed.afterId) &&
      (parsed.scopeKey === null ||
        (typeof parsed.scopeKey === "string" && scopePattern.test(parsed.scopeKey))) &&
      (parsed.lastReconciledAt === null ||
        (typeof parsed.lastReconciledAt === "string" &&
          Number.isFinite(Date.parse(parsed.lastReconciledAt))))
      ? (parsed as StoredWatermark)
      : emptyWatermark(shopId);
  } catch {
    return emptyWatermark(shopId);
  }
}

function parseEntityIds(value: unknown): Readonly<Record<string, readonly string[]>> {
  if (!isRecord(value)) return {};
  const result: Record<string, readonly string[]> = {};
  for (const [key, ids] of Object.entries(value)) {
    if (
      !/^[a-z_]{1,40}$/.test(key) ||
      !Array.isArray(ids) ||
      ids.length > 250 ||
      ids.some((id) => typeof id !== "string" || !uuidPattern.test(id))
    ) {
      throw new AuthContractError("backend_temporary");
    }
    result[key] = ids as string[];
  }
  return result;
}

function parseEvents(value: unknown): readonly MiniSyncEvent[] {
  if (!Array.isArray(value) || value.length > 50) {
    throw new AuthContractError("backend_temporary");
  }
  return value.map((event) => {
    if (
      !isRecord(event) ||
      typeof event.id !== "string" ||
      !cursorPattern.test(event.id) ||
      (event.domain !== "catalog" &&
        event.domain !== "history" &&
        event.domain !== "prices" &&
        event.domain !== "unsupported") ||
      typeof event.event_type !== "string" ||
      event.event_type.length > 80 ||
      typeof event.source !== "string" ||
      event.source.length > 80 ||
      !Number.isSafeInteger(event.changed_count) ||
      Number(event.changed_count) < 0 ||
      typeof event.created_at !== "string" ||
      !Number.isFinite(Date.parse(event.created_at)) ||
      typeof event.requires_full_recovery !== "boolean"
    ) {
      throw new AuthContractError("backend_temporary");
    }
    return {
      changedCount: Number(event.changed_count),
      createdAt: event.created_at,
      domain: event.domain,
      entityIds: parseEntityIds(event.entity_ids),
      eventType: event.event_type,
      id: event.id,
      requiresFullRecovery: event.requires_full_recovery,
      source: event.source,
    };
  });
}

export class MiniSyncCoordinator {
  readonly #caches: SensitiveCacheCoordinator;
  readonly #http: HttpClient;
  readonly #listeners = new Set<(notification: MiniSyncNotification) => Promise<void> | void>();
  readonly #platform: MiniProgramPlatform;
  readonly #sessions: SessionStore;
  readonly #inFlight = new Map<string, Promise<void>>();
  #runGeneration = 0;
  #shopId: string | null = null;
  #pollDelayMilliseconds = basePollDelayMilliseconds;
  #timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    http: HttpClient,
    sessions: SessionStore,
    platform: MiniProgramPlatform,
    caches: SensitiveCacheCoordinator,
  ) {
    this.#http = http;
    this.#sessions = sessions;
    this.#platform = platform;
    this.#caches = caches;
  }

  subscribe(listener: (notification: MiniSyncNotification) => Promise<void> | void) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  start(shopId: string): void {
    if (!uuidPattern.test(shopId)) return;
    this.stop();
    this.#shopId = shopId;
    this.#pollDelayMilliseconds = basePollDelayMilliseconds;
    const generation = this.#runGeneration;
    void this.syncNow(shopId)
      .catch(() => undefined)
      .finally(() => this.#schedule(generation));
  }

  stop(): void {
    this.#runGeneration += 1;
    this.#shopId = null;
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
    this.#pollDelayMilliseconds = basePollDelayMilliseconds;
  }

  syncNow(shopId: string): Promise<void> {
    const session = this.#sessions.load();
    if (session === null || !uuidPattern.test(shopId)) return Promise.resolve();
    const context = {
      accountFingerprint: session.accountFingerprint,
      deviceId: session.deviceId,
      runGeneration: this.#runGeneration,
      sessionGeneration: this.#sessions.generation,
      sessionToken: session.sessionToken,
      shopId,
    };
    const key = `${context.accountFingerprint}:${shopId}:${context.runGeneration}`;
    const active = this.#inFlight.get(key);
    if (active) return active;
    const task = this.#sync(context)
      .then((changed) => {
        if (this.#runGeneration === context.runGeneration) {
          this.#pollDelayMilliseconds = nextMiniSyncPollDelay(
            this.#pollDelayMilliseconds,
            changed ? "changed" : "idle",
          );
        }
      })
      .catch((error: unknown) => {
        if (this.#runGeneration === context.runGeneration) {
          this.#pollDelayMilliseconds = nextMiniSyncPollDelay(this.#pollDelayMilliseconds, "error");
        }
        throw error;
      })
      .finally(() => {
        if (this.#inFlight.get(key) === task) this.#inFlight.delete(key);
      });
    this.#inFlight.set(key, task);
    return task;
  }

  clearCurrentWatermark(shopId: string): void {
    const session = this.#sessions.load();
    if (session && uuidPattern.test(shopId)) {
      this.#platform.removeStorage(storageKey(session.accountFingerprint, shopId));
    }
  }

  async #sync(context: {
    readonly accountFingerprint: string;
    readonly deviceId: string;
    readonly runGeneration: number;
    readonly sessionGeneration: number;
    readonly sessionToken: string;
    readonly shopId: string;
  }): Promise<boolean> {
    const { shopId } = context;
    const session = this.#assertContext(context);
    let watermark = parseWatermark(
      this.#platform.getStorage(storageKey(session.accountFingerprint, shopId)),
      shopId,
    );
    let changed = false;
    const checkpointResponse = await this.#http.get<{
      readonly checkpoint: {
        readonly eventMaxId: string;
        readonly requiresReconcile: boolean;
        readonly scopeKey: string;
        readonly shopId: string;
        readonly status: string;
      };
      readonly ok: true;
    }>(
      "/api/mini-program/v1/sync/checkpoint",
      {
        after_id: watermark.afterId,
        last_reconciled_at: watermark.lastReconciledAt ?? undefined,
        scope_key: watermark.scopeKey ?? undefined,
        shop_id: shopId,
      },
      session,
    );
    this.#assertContext(context);
    const checkpoint = checkpointResponse.checkpoint;
    if (
      checkpoint.shopId !== shopId ||
      !cursorPattern.test(checkpoint.eventMaxId) ||
      !scopePattern.test(checkpoint.scopeKey)
    ) {
      throw new AuthContractError("backend_temporary");
    }
    if (checkpoint.requiresReconcile) {
      await this.#notify({ kind: "reconcile", shopId });
      this.#assertContext(context);
      this.#caches.invalidate();
      watermark = {
        afterId: checkpoint.eventMaxId,
        lastReconciledAt: new Date().toISOString(),
        schemaVersion: 1,
        scopeKey: checkpoint.scopeKey,
        shopId,
      };
      this.#save(session.accountFingerprint, watermark);
      return true;
    }

    let afterId = watermark.afterId;
    while (afterId !== checkpoint.eventMaxId) {
      const deltaResponse = await this.#http.get<{
        readonly delta: {
          readonly asOfEventMaxId: string;
          readonly hasMore: boolean;
          readonly nextAfterId: string | null;
          readonly rows: unknown;
          readonly shopId: string;
        };
        readonly ok: true;
      }>(
        "/api/mini-program/v1/sync/delta",
        {
          after_id: afterId,
          event_max_id: checkpoint.eventMaxId,
          limit: 50,
          scope_key: checkpoint.scopeKey,
          shop_id: shopId,
        },
        session,
      );
      this.#assertContext(context);
      const delta = deltaResponse.delta;
      if (delta.shopId !== shopId || delta.asOfEventMaxId !== checkpoint.eventMaxId) {
        throw new AuthContractError("backend_temporary");
      }
      const events = parseEvents(delta.rows);
      let priorEventId = BigInt(afterId);
      const maximumEventId = BigInt(checkpoint.eventMaxId);
      for (const event of events) {
        const eventId = BigInt(event.id);
        if (eventId <= priorEventId || eventId > maximumEventId) {
          throw new AuthContractError("backend_temporary");
        }
        priorEventId = eventId;
      }
      if (events.some((event) => event.requiresFullRecovery)) {
        this.clearCurrentWatermark(shopId);
        await this.#notify({ kind: "reconcile", shopId });
        this.#assertContext(context);
        this.#caches.invalidate();
        return true;
      }
      if (events.length > 0) {
        changed = true;
        const domains = new Set(events.map((event) => event.domain));
        this.#caches.invalidateDomains(domains);
        await this.#notify({ events, kind: "delta", shopId });
        this.#assertContext(context);
      }
      const next = delta.nextAfterId ?? checkpoint.eventMaxId;
      if (
        !cursorPattern.test(next) ||
        BigInt(next) <= BigInt(afterId) ||
        BigInt(next) > maximumEventId ||
        (events.length > 0 && BigInt(next) < priorEventId)
      ) {
        throw new AuthContractError("backend_temporary");
      }
      afterId = next;
      watermark = { ...watermark, afterId, scopeKey: checkpoint.scopeKey };
      this.#save(session.accountFingerprint, watermark);
      if (!delta.hasMore) break;
    }
    return changed;
  }

  async #notify(notification: MiniSyncNotification) {
    for (const listener of this.#listeners) await listener(notification);
  }

  #assertContext(context: {
    readonly accountFingerprint: string;
    readonly deviceId: string;
    readonly runGeneration: number;
    readonly sessionGeneration: number;
    readonly sessionToken: string;
  }) {
    const session = this.#sessions.load();
    if (
      session === null ||
      session.accountFingerprint !== context.accountFingerprint ||
      session.deviceId !== context.deviceId ||
      session.sessionToken !== context.sessionToken ||
      this.#sessions.generation !== context.sessionGeneration ||
      this.#runGeneration !== context.runGeneration
    ) {
      throw new AuthContractError("session_expired");
    }
    return session;
  }

  #save(fingerprint: string, watermark: StoredWatermark) {
    const encoded = JSON.stringify(watermark);
    if (encoded.length > maximumWatermarkBytes) throw new Error("watermark_invalid");
    this.#platform.setStorage(storageKey(fingerprint, watermark.shopId), encoded);
  }

  #schedule(generation: number) {
    if (!this.#shopId || generation !== this.#runGeneration) return;
    this.#timer = setTimeout(() => {
      const shopId = this.#shopId;
      if (!shopId || generation !== this.#runGeneration) return;
      void this.syncNow(shopId)
        .catch(() => undefined)
        .finally(() => this.#schedule(generation));
    }, this.#pollDelayMilliseconds);
  }
}
