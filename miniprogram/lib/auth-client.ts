import { AuthContractError, type MiniSessionHandoff, type WeChatChallenge } from "./contracts";
import { DeviceIdentifierStore } from "./device-identifier";
import type { HttpClient } from "./http-client";
import type { MiniProgramPlatform } from "./platform";
import type { SessionStore } from "./session-store";

const base64UrlPattern = /^[A-Za-z0-9_-]{43,128}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class WeChatAuthClient {
  readonly #deviceIdentifiers: DeviceIdentifierStore;
  readonly #http: HttpClient;
  readonly #platform: MiniProgramPlatform;
  readonly #sessions: SessionStore;

  constructor(http: HttpClient, platform: MiniProgramPlatform, sessions: SessionStore) {
    this.#http = http;
    this.#platform = platform;
    this.#sessions = sessions;
    this.#deviceIdentifiers = new DeviceIdentifierStore(platform);
  }

  async signIn(): Promise<MiniSessionHandoff> {
    const deviceId = await this.#deviceIdentifiers.getOrCreate();
    const challengeResponse = await this.#http.post<{
      readonly challenge?: WeChatChallenge;
      readonly ok: boolean;
    }>("/api/auth/wechat/challenge", {
      deviceId,
      mode: "login",
      surface: "mini_program",
    });
    const challenge = challengeResponse.challenge;
    if (
      !challengeResponse.ok ||
      challenge === undefined ||
      !uuidPattern.test(challenge.correlationId) ||
      !base64UrlPattern.test(challenge.state) ||
      !base64UrlPattern.test(challenge.nonce) ||
      !Number.isInteger(challenge.expiresInSeconds) ||
      challenge.expiresInSeconds < 60 ||
      challenge.expiresInSeconds > 600
    ) {
      throw new AuthContractError("state_invalid");
    }

    let code: string;
    try {
      code = await this.#platform.login(8_000);
    } catch {
      throw new AuthContractError("user_cancelled");
    }
    if (!/^[A-Za-z0-9_-]{1,512}$/.test(code)) {
      throw new AuthContractError("code_missing");
    }

    const handoff = await this.#http.post<MiniSessionHandoff>(
      "/api/auth/wechat/exchange",
      {
        code,
        correlationId: challenge.correlationId,
        deviceId,
        mode: "login",
        nonce: challenge.nonce,
        state: challenge.state,
        surface: "mini_program",
      },
      undefined,
      { deviceId },
    );
    if (
      handoff.user.provider !== "custom:wechat" ||
      !/^[A-Za-z0-9_-]{43}$/.test(handoff.sessionToken) ||
      !/^[0-9a-f]{64}$/.test(handoff.accountFingerprint)
    ) {
      throw new AuthContractError("backend_temporary");
    }
    this.#sessions.save(handoff, deviceId);
    return handoff;
  }

  signOut(): void {
    const session = this.#sessions.load();
    this.#sessions.clear();
    if (session) {
      void this.#http
        .post<{ readonly ok: true }>("/api/auth/wechat/logout", undefined, session)
        .catch(() => undefined);
    }
  }
}
