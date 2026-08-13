export interface RefreshScheduler {
  clear(timer: number): void;
  schedule(callback: () => void, delayMilliseconds: number): number;
}

const defaultScheduler: RefreshScheduler = {
  clear: (timer) => clearTimeout(timer),
  schedule: (callback, delay) => setTimeout(callback, delay),
};

export class AdaptiveRefreshController {
  readonly #baseDelay: number;
  readonly #maximumDelay: number;
  readonly #refresh: () => Promise<void>;
  readonly #scheduler: RefreshScheduler;
  #currentDelay: number;
  #generation = 0;
  #running = false;
  #timer: number | null = null;

  constructor(input: {
    baseDelayMilliseconds: number;
    maximumDelayMilliseconds: number;
    refresh: () => Promise<void>;
    scheduler?: RefreshScheduler;
  }) {
    if (
      input.baseDelayMilliseconds < 3_000 ||
      input.maximumDelayMilliseconds < input.baseDelayMilliseconds
    ) {
      throw new Error("invalid_refresh_bounds");
    }
    this.#baseDelay = input.baseDelayMilliseconds;
    this.#maximumDelay = input.maximumDelayMilliseconds;
    this.#currentDelay = input.baseDelayMilliseconds;
    this.#refresh = input.refresh;
    this.#scheduler = input.scheduler ?? defaultScheduler;
  }

  start(): void {
    if (this.#running) return;
    this.#running = true;
    this.#generation += 1;
    this.#schedule(this.#generation);
  }

  stop(): void {
    this.#running = false;
    this.#generation += 1;
    if (this.#timer !== null) this.#scheduler.clear(this.#timer);
    this.#timer = null;
    this.#currentDelay = this.#baseDelay;
  }

  #schedule(generation: number): void {
    if (!this.#running || generation !== this.#generation) return;
    this.#timer = this.#scheduler.schedule(() => {
      if (!this.#running || generation !== this.#generation) return;
      this.#timer = null;
      void this.#refresh()
        .then(() => {
          if (!this.#running || generation !== this.#generation) return;
          this.#currentDelay = this.#baseDelay;
        })
        .catch(() => {
          if (!this.#running || generation !== this.#generation) return;
          this.#currentDelay = Math.min(this.#currentDelay * 2, this.#maximumDelay);
        })
        .finally(() => this.#schedule(generation));
    }, this.#currentDelay);
  }
}
