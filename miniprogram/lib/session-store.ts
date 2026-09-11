import { AuthContractError, type MiniSessionHandoff } from "./contracts";
import type { MiniProgramPlatform } from "./platform";

const maximumRemainingLifetimeSeconds = 86_400;

export function isMiniSessionHandoff(value: unknown): value is MiniSessionHandoff {
  if (typeof value !== "object" || value === null) return false;
  const handoff = value as Partial<MiniSessionHandoff>;
  return (
    handoff.tokenType === "bearer" &&
    typeof handoff.sessionToken === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(handoff.sessionToken) &&
    typeof handoff.accountFingerprint === "string" &&
    /^[0-9a-f]{64}$/.test(handoff.accountFingerprint) &&
    typeof handoff.expiresAt === "number" &&
    Number.isSafeInteger(handoff.expiresAt) &&
    typeof handoff.expiresIn === "number" &&
    Number.isSafeInteger(handoff.expiresIn) &&
    handoff.expiresIn > 0 &&
    handoff.expiresIn <= maximumRemainingLifetimeSeconds &&
    handoff.user?.provider === "custom:wechat"
  );
}

export interface ActiveSession {
  readonly accountFingerprint: string;
  readonly deviceId: string;
  readonly expiresAt: number;
  readonly sessionToken: string;
}

export type SessionChangeListener = () => void;

export class SessionStore {
  readonly #changeListeners = new Set<SessionChangeListener>();
  readonly #nowSeconds: () => number;
  #activeSession: ActiveSession | null = null;
  #generation = 0;

  constructor(_platform: MiniProgramPlatform, nowSeconds = () => Math.floor(Date.now() / 1_000)) {
    this.#nowSeconds = nowSeconds;
  }

  save(handoff: MiniSessionHandoff, deviceId: string): void {
    const now = this.#nowSeconds();
    if (
      !isMiniSessionHandoff(handoff) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        deviceId,
      ) ||
      handoff.expiresAt <= now ||
      handoff.expiresAt - now > maximumRemainingLifetimeSeconds
    ) {
      throw new AuthContractError("backend_temporary");
    }
    // Mini Program storage is not a secure enclave. Keep the bearer in memory
    // only; refresh and durable restoration require a later reviewed server
    // rotation contract and are deliberately not emulated client-side.
    this.#activeSession = {
      accountFingerprint: handoff.accountFingerprint,
      deviceId,
      expiresAt: handoff.expiresAt,
      sessionToken: handoff.sessionToken,
    };
    this.#generation += 1;
    this.#notifyChange();
  }

  load(): ActiveSession | null {
    const candidate = this.#activeSession;
    if (
      candidate === null ||
      !Number.isSafeInteger(candidate.expiresAt) ||
      !/^[A-Za-z0-9_-]{43}$/.test(candidate.sessionToken) ||
      !/^[0-9a-f]{64}$/.test(candidate.accountFingerprint) ||
      candidate.expiresAt <= this.#nowSeconds() ||
      candidate.expiresAt - this.#nowSeconds() > maximumRemainingLifetimeSeconds
    ) {
      this.clear();
      return null;
    }
    return candidate;
  }

  clear(): void {
    if (this.#activeSession === null) return;
    this.#activeSession = null;
    this.#generation += 1;
    this.#notifyChange();
  }

  get generation(): number {
    return this.#generation;
  }

  subscribe(listener: SessionChangeListener): () => void {
    this.#changeListeners.add(listener);
    return () => this.#changeListeners.delete(listener);
  }

  #notifyChange(): void {
    for (const listener of this.#changeListeners) listener();
  }
}
