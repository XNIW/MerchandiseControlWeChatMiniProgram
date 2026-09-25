import type { RefreshScheduler } from "./adaptive-refresh";
import type { CatalogMutationClient } from "./catalog-mutation-client";
import type { DurableCatalogOutbox } from "./durable-catalog-outbox";
import type { SessionStore } from "./session-store";

/** Foreground-only, deadline-driven drain; network events do not reset persisted backoff. */
export class OutboxDrain {
  #epoch = 0;
  #timer: number | undefined;
  #shopId: string | null = null;
  #online = true;
  #failureUntil = 0;
  #failures = 0;
  #running = new Set<number>();
  constructor(
    private readonly outbox: DurableCatalogOutbox,
    private readonly client: CatalogMutationClient,
    private readonly sessions: SessionStore,
    private readonly scheduler: RefreshScheduler,
    private readonly changed: (shopId: string) => void,
    private readonly now = () => Date.now(),
  ) {
    outbox.subscribe(() => this.arm());
    sessions.subscribe(() => this.stop());
  }
  start(shopId: string): void {
    if (this.#shopId !== shopId) {
      this.stop();
      this.#shopId = shopId;
    }
    this.outbox.setActiveContext(shopId);
    this.arm();
  }
  stop(): void {
    this.outbox.setActiveContext(null);
    this.#epoch += 1;
    this.#shopId = null;
    if (this.#timer !== undefined) this.scheduler.clear(this.#timer);
    this.#timer = undefined;
  }
  networkChanged(online: boolean): void {
    this.#online = online;
    this.arm();
  }
  private arm(): void {
    if (this.#timer !== undefined) this.scheduler.clear(this.#timer);
    this.#timer = undefined;
    if (!this.#online || !this.#shopId || this.#running.has(this.#epoch) || !this.sessions.load())
      return;
    try {
      const entries = this.outbox.pendingForCurrentShop(this.#shopId);
      const blocked = new Set(entries.map((entry) => entry.operationId));
      const due = entries
        .filter(
          (entry) =>
            ["pending", "retry_wait", "sending"].includes(entry.state) &&
            !entry.dependencyOperationIds.some((id) => blocked.has(id)),
        )
        .map((entry) => entry.nextRetryAt);
      if (due.length === 0) return;
      const epoch = this.#epoch;
      this.#timer = this.scheduler.schedule(
        () => {
          this.#timer = undefined;
          void this.drain(epoch);
        },
        Math.max(50, this.#failureUntil - this.now(), Math.min(...due) - this.now()),
      );
    } catch {
      this.changed(this.#shopId);
    }
  }
  private async drain(epoch: number): Promise<void> {
    const shopId = this.#shopId;
    if (epoch !== this.#epoch || !shopId || !this.#online) return;
    const generation = this.sessions.generation;
    this.#running.add(epoch);
    try {
      const results = await this.outbox.flush(this.client, shopId);
      this.#failures = 0;
      this.#failureUntil = 0;
      if (results.length && epoch === this.#epoch && generation === this.sessions.generation)
        this.changed(shopId);
    } catch {
      this.#failures++;
      this.#failureUntil =
        this.now() + Math.min(60_000, 5_000 * 2 ** Math.min(this.#failures - 1, 4));
      if (epoch === this.#epoch) this.changed(shopId);
    } finally {
      this.#running.delete(epoch);
      if (epoch === this.#epoch) this.arm();
    }
  }
}
