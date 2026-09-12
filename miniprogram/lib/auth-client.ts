import { AuthContractError, type MiniSessionHandoff, type WeChatChallenge } from "./contracts";
import { DeviceIdentifierStore } from "./device-identifier";
import type { HttpClient } from "./http-client";
import { directMiniProof, miniDirectProtocol } from "./mini-direct";
import type { MiniProgramPlatform } from "./platform";
import { isMiniSessionHandoff, type SessionStore } from "./session-store";

const base64UrlPattern = /^[A-Za-z0-9_-]{43,128}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class WeChatAuthClient {
  readonly #deviceIdentifiers: DeviceIdentifierStore;
  readonly #http: HttpClient;
  readonly #platform: MiniProgramPlatform;
  readonly #sessions: SessionStore;
  #attempt = 0;

  constructor(
    http: HttpClient,
    platform: MiniProgramPlatform,
    sessions: SessionStore,
    readonly protocol = "mini-id-token-nonce-v1",
  ) {
    this.#http = http;
    this.#platform = platform;
    this.#sessions = sessions;
    this.#deviceIdentifiers = new DeviceIdentifierStore(platform);
  }

  async signIn(): Promise<MiniSessionHandoff> {
    const attempt = ++this.#attempt;
    const sessionGeneration = this.#sessions.generation;
    const assertCurrent = () => {
      if (attempt !== this.#attempt || sessionGeneration !== this.#sessions.generation) {
        throw new AuthContractError("user_cancelled");
      }
    };
    const awaitCurrent = async <T>(pending: Promise<T>): Promise<T> => {
      try {
        const value = await pending;
        assertCurrent();
        return value;
      } catch (error) {
        assertCurrent();
        throw error;
      }
    };
    const deviceId = await awaitCurrent(this.#deviceIdentifiers.getOrCreate());
    let exchangeBody: Record<string, unknown>;
    let exchangePath: string;
    if (this.protocol === miniDirectProtocol) {
      exchangeBody = await directMiniProof(
        this.#http,
        this.#platform,
        deviceId,
        "login",
        assertCurrent,
      );
      exchangePath = "/api/auth/wechat/mini/exchange";
    } else if (this.protocol === "mini-id-token-nonce-v1") {
      const challengeResponse = await awaitCurrent(
        this.#http.post<{
          readonly challenge?: WeChatChallenge;
          readonly ok: boolean;
        } | null>("/api/auth/wechat/challenge", {
          deviceId,
          mode: "login",
          surface: "mini_program",
        }),
      );
      const challenge = challengeResponse?.challenge;
      if (
        challengeResponse?.ok !== true ||
        challenge == null ||
        typeof challenge.correlationId !== "string" ||
        !uuidPattern.test(challenge.correlationId) ||
        typeof challenge.state !== "string" ||
        !base64UrlPattern.test(challenge.state) ||
        typeof challenge.nonce !== "string" ||
        !base64UrlPattern.test(challenge.nonce) ||
        !Number.isInteger(challenge.expiresInSeconds) ||
        challenge.expiresInSeconds < 60 ||
        challenge.expiresInSeconds > 600
      ) {
        throw new AuthContractError("state_invalid");
      }

      let code: string;
      try {
        code = await awaitCurrent(this.#platform.login(8_000));
      } catch {
        throw new AuthContractError("user_cancelled");
      }
      assertCurrent();
      if (!/^[A-Za-z0-9_-]{1,512}$/.test(code)) {
        throw new AuthContractError("code_missing");
      }

      exchangeBody = {
        code,
        correlationId: challenge.correlationId,
        deviceId,
        mode: "login",
        nonce: challenge.nonce,
        state: challenge.state,
        surface: "mini_program",
      };
      exchangePath = "/api/auth/wechat/exchange";
    } else {
      throw new AuthContractError("provider_not_configured");
    }

    let handoff: unknown;
    try {
      handoff = await this.#http.post<unknown>(exchangePath, exchangeBody, undefined, { deviceId });
      assertCurrent();
      if (
        !isMiniSessionHandoff(handoff) ||
        (handoff.protocol ?? "mini-id-token-nonce-v1") !== this.protocol
      ) {
        throw new AuthContractError("backend_temporary");
      }
      this.#sessions.save(handoff, deviceId);
      return handoff;
    } catch (error) {
      // A cancelled exchange may still have issued a receipt on the server.
      // Dispose of that receipt without ever installing it as the active account.
      if (isMiniSessionHandoff(handoff)) {
        const current = this.#sessions.load();
        if (current?.sessionToken !== handoff.sessionToken || current.deviceId !== deviceId) {
          void this.#http
            .post("/api/auth/wechat/logout", undefined, {
              deviceId,
              sessionToken: handoff.sessionToken,
            })
            .catch(() => undefined);
        }
      }
      assertCurrent();
      throw error;
    }
  }

  signOut(): void {
    this.#attempt += 1;
    const session = this.#sessions.load();
    this.#sessions.clear();
    if (session) {
      void this.#http
        .post<{ readonly ok: true }>("/api/auth/wechat/logout", undefined, session)
        .catch(() => undefined);
    }
  }
}
