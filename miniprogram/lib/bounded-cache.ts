export class BoundedCache<Value> {
  readonly #entries = new Map<string, Value>();
  readonly #maximumEntries: number;

  constructor(maximumEntries: number) {
    if (!Number.isInteger(maximumEntries) || maximumEntries < 1 || maximumEntries > 20) {
      throw new Error("invalid_cache_bound");
    }
    this.#maximumEntries = maximumEntries;
  }

  get(key: string): Value | undefined {
    const value = this.#entries.get(key);
    if (value !== undefined) {
      this.#entries.delete(key);
      this.#entries.set(key, value);
    }
    return value;
  }

  set(key: string, value: Value): void {
    this.#entries.delete(key);
    this.#entries.set(key, value);
    while (this.#entries.size > this.#maximumEntries) {
      const oldest = this.#entries.keys().next().value;
      if (oldest === undefined) break;
      this.#entries.delete(oldest);
    }
  }

  delete(key: string): void {
    this.#entries.delete(key);
  }

  clear(): void {
    this.#entries.clear();
  }
}
