import { AuthContractError } from "./contracts";
import { DeviceIdentifierStore } from "./device-identifier";
import type { HttpClient } from "./http-client";
import type { MiniProgramPlatform } from "./platform";

export const miniDirectProtocol = "wechat-mini-code2session-v1";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const capability = /^[A-Za-z0-9_-]{43}$/;

export function base64Url(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      output += alphabet[(value >>> bits) & 63];
    }
  }
  if (bits > 0) output += alphabet[(value << (6 - bits)) & 63];
  return output;
}

export async function directMiniProof(
  http: HttpClient,
  platform: MiniProgramPlatform,
  deviceId: string,
  purpose: "login" | "pair_claim" | "pair_confirm",
  assertCurrent: () => void,
  context: { transferCode?: string; pairingId?: string } = {},
) {
  const bytes = await platform.randomBytes(32);
  assertCurrent();
  if (bytes.length !== 32) throw new AuthContractError("backend_temporary");
  const verifier = base64Url(bytes);
  const challenge = await http.post<{
    ok?: boolean;
    protocol?: string;
    challengeId?: string;
    expiresIn?: number;
  } | null>("/api/auth/wechat/mini/challenge", {
    protocol: miniDirectProtocol,
    ...context,
    deviceId,
    verifier,
    purpose,
  });
  assertCurrent();
  if (
    challenge?.ok !== true ||
    challenge.protocol !== miniDirectProtocol ||
    !uuid.test(challenge.challengeId ?? "") ||
    !Number.isInteger(challenge.expiresIn) ||
    (challenge.expiresIn ?? 0) < 1 ||
    (challenge.expiresIn ?? 0) > 300
  )
    throw new AuthContractError("state_invalid");
  const code = await platform.login(8_000);
  assertCurrent();
  if (!/^[A-Za-z0-9_-]{1,512}$/.test(code)) throw new AuthContractError("code_missing");
  return {
    protocol: miniDirectProtocol,
    deviceId,
    verifier,
    challengeId: challenge.challengeId,
    code,
  };
}

export type MiniPairingContext = {
  pairingId: string;
  miniCapability: string;
  comparison: string;
  accountName: string;
  expiresAt: string;
};

export class MiniPairingClient {
  #attempt = 0;
  #context: MiniPairingContext | null = null;
  readonly #devices: DeviceIdentifierStore;
  constructor(
    readonly http: HttpClient,
    readonly platform: MiniProgramPlatform,
  ) {
    this.#devices = new DeviceIdentifierStore(platform);
  }
  cancel() {
    this.#attempt += 1;
    this.#context = null;
  }
  async claim(transferCode: string): Promise<MiniPairingContext> {
    this.cancel();
    const attempt = this.#attempt;
    const check = () => {
      if (attempt !== this.#attempt) throw new AuthContractError("user_cancelled");
    };
    if (!capability.test(transferCode)) throw new AuthContractError("validation_failed");
    const deviceId = await this.#devices.getOrCreate();
    check();
    const proof = await directMiniProof(this.http, this.platform, deviceId, "pair_claim", check, {
      transferCode,
    });
    const response = await this.http.post<
      Partial<MiniPairingContext> & { ok?: boolean; protocol?: string }
    >("/api/auth/wechat/mini/pair-claim", { ...proof, transferCode });
    check();
    if (
      response?.ok !== true ||
      response.protocol !== miniDirectProtocol ||
      !uuid.test(response.pairingId ?? "") ||
      !capability.test(response.miniCapability ?? "") ||
      !/^[0-9]{8}$/.test(response.comparison ?? "") ||
      typeof response.accountName !== "string" ||
      response.accountName.length > 256 ||
      typeof response.expiresAt !== "string" ||
      !(Date.parse(response.expiresAt) > Date.now()) ||
      Date.parse(response.expiresAt) > Date.now() + 300_000
    )
      throw new AuthContractError("state_invalid");
    const context: MiniPairingContext = {
      pairingId: response.pairingId as string,
      miniCapability: response.miniCapability as string,
      comparison: response.comparison as string,
      accountName: response.accountName,
      expiresAt: response.expiresAt,
    };
    this.#context = context;
    return context;
  }
  async confirm(): Promise<void> {
    const context = this.#context;
    const attempt = ++this.#attempt;
    const check = () => {
      if (attempt !== this.#attempt) throw new AuthContractError("user_cancelled");
    };
    if (!context || Date.parse(context.expiresAt) <= Date.now())
      throw new AuthContractError("state_expired");
    const deviceId = await this.#devices.getOrCreate();
    check();
    const proof = await directMiniProof(this.http, this.platform, deviceId, "pair_confirm", check, {
      pairingId: context.pairingId,
    });
    const response = await this.http.post<{ ok?: boolean; state?: string }>(
      "/api/auth/wechat/mini/pair-confirm",
      {
        ...proof,
        pairingId: context.pairingId,
        miniCapability: context.miniCapability,
        consent: true,
      },
    );
    check();
    if (response?.ok !== true || response.state !== "linked")
      throw new AuthContractError("state_invalid");
    this.#context = null;
  }
}
