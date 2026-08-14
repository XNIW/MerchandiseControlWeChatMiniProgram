import { BoundedCache } from "./bounded-cache";
import type { SessionStore } from "./session-store";

export interface ClearableSensitiveCache {
  clear(): void;
}

export class SensitiveCacheCoordinator {
  readonly #caches = new Map<ClearableSensitiveCache, ReadonlySet<string>>();
  #generation = 0;

  get generation(): number {
    return this.#generation;
  }

  bindSessionStore(sessions: SessionStore): () => void {
    return sessions.subscribe(() => this.invalidate());
  }

  register(cache: ClearableSensitiveCache, domains: readonly string[] = ["all"]): () => void {
    this.#caches.set(cache, new Set(domains));
    return () => this.#caches.delete(cache);
  }

  invalidate(): void {
    this.#generation += 1;
    for (const cache of this.#caches.keys()) cache.clear();
  }

  invalidateDomains(domains: ReadonlySet<string>): void {
    this.#generation += 1;
    for (const [cache, registered] of this.#caches) {
      if (registered.has("all") || [...domains].some((domain) => registered.has(domain))) {
        cache.clear();
      }
    }
  }
}

interface SessionCacheEntry<Value> {
  readonly sessionGeneration: number;
  readonly value: Value;
}

export class SessionBoundedCache<Value> implements ClearableSensitiveCache {
  readonly #cache: BoundedCache<SessionCacheEntry<Value>>;
  readonly #sessions: SessionStore;

  constructor(maximumEntries: number, sessions: SessionStore) {
    this.#cache = new BoundedCache(maximumEntries);
    this.#sessions = sessions;
  }

  get(key: string): Value | undefined {
    if (this.#sessions.load() === null) {
      this.clear();
      return undefined;
    }
    const entry = this.#cache.get(key);
    if (!entry || entry.sessionGeneration !== this.#sessions.generation) {
      this.#cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: Value): void {
    if (this.#sessions.load() === null) {
      this.clear();
      return;
    }
    this.#cache.set(key, { sessionGeneration: this.#sessions.generation, value });
  }

  delete(key: string): void {
    this.#cache.delete(key);
  }

  clear(): void {
    this.#cache.clear();
  }
}
