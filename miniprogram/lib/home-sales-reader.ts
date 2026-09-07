import { AuthContractError, type DailySale, type DailySalesSummary } from "./contracts";
import { shiftDate } from "./date-ranges";
import type { SalesApiClient } from "./sales-api-client";

interface HomeSnapshot {
  readonly previous: DailySalesSummary | null;
  readonly sales: readonly DailySale[];
  readonly summary: DailySalesSummary;
}

/** One visible Home context. Secondary reads refresh on changes or within 30s. */
export class HomeSalesReader {
  #cached: { key: string; at: number; snapshot: HomeSnapshot } | null = null;
  #inFlight: Promise<HomeSnapshot> | null = null;
  #key = "";
  #generation = 0;

  clear(): void {
    this.#generation += 1;
    this.#cached = null;
    this.#key = "";
    this.#inFlight = null;
  }

  read(
    client: Pick<SalesApiClient, "dailySummary" | "dailySalesPage">,
    shopId: string,
    contextKey: string,
    now = Date.now(),
    force = false,
    isCurrent: () => boolean = () => true,
  ): Promise<HomeSnapshot> {
    const key = `${contextKey}:${shopId}`;
    if (this.#key === key && this.#inFlight) return this.#inFlight;
    this.#key = key;
    const generation = ++this.#generation;
    const task = (async () => {
      const summary = await client.dailySummary(shopId);
      if (!isCurrent()) throw new AuthContractError("session_expired");
      if (!summary) throw new AuthContractError("membership_missing");
      // Server time alone changes every poll; compare the actual financial fields.
      const { server_time: _time, ...state } = summary;
      const previousState = this.#cached?.snapshot.summary;
      const signature = (value: DailySalesSummary | undefined) => {
        if (!value) return "";
        const { server_time: _previousTime, ...fields } = value;
        return JSON.stringify(fields);
      };
      if (
        !force &&
        this.#cached?.key === key &&
        now - this.#cached.at < 30_000 &&
        JSON.stringify(state) === signature(previousState)
      ) {
        return { ...this.#cached.snapshot, summary };
      }
      const [previous, sales] = await Promise.all([
        client.dailySummary(shopId, shiftDate(summary.business_date, -1)),
        client.dailySalesPage(shopId, { date: summary.business_date, limit: 1 }),
      ]);
      const snapshot = { previous, sales, summary };
      if (this.#key === key && this.#generation === generation)
        this.#cached = { at: now, key, snapshot };
      return snapshot;
    })().finally(() => {
      if (this.#inFlight === task) this.#inFlight = null;
    });
    this.#inFlight = task;
    return task;
  }
}
