import type { MiniProgramPlatform } from "./platform";

const storageKey = "merchandise_control_device_id_v1";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class DeviceIdentifierStore {
  readonly #platform: MiniProgramPlatform;

  constructor(platform: MiniProgramPlatform) {
    this.#platform = platform;
  }

  async getOrCreate(): Promise<string> {
    const stored = this.#platform.getStorage(storageKey);
    if (typeof stored === "string" && uuidPattern.test(stored)) return stored;

    const bytes = await this.#platform.randomBytes(16);
    if (bytes.length !== 16) throw new Error("secure_random_failed");
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
    const identifier = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    this.#platform.setStorage(storageKey, identifier);
    return identifier;
  }
}
