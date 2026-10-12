import test from "node:test";
import { WeChatAuthClient } from "../miniprogram/lib/auth-client";
import { AuthContractError, CatalogMutationContractError } from "../miniprogram/lib/contracts";
import { HttpClient } from "../miniprogram/lib/http-client";
import { miniDirectProtocol } from "../miniprogram/lib/mini-direct";
import type { PlatformRequest, PlatformResponse } from "../miniprogram/lib/platform";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assertEqual, expectReject, FakePlatform } from "./fakes";

const exchangePath = "/api/auth/wechat/mini/exchange";
const challenge = {
  ok: true,
  protocol: miniDirectProtocol,
  challengeId: "90000000-0000-4000-8000-000000001001",
  expiresIn: 299,
};
const handoff = {
  protocol: miniDirectProtocol,
  accountFingerprint: "a".repeat(64),
  sessionToken: "s".repeat(43),
  tokenType: "bearer",
  expiresAt: 1900,
  expiresIn: 900,
  user: { provider: "wechat-mini" },
};

// A transport fixture enforces the supplied deadline against simulated latency;
// no wall-clock sleep, real provider request or live authentication is involved.
class LatencyPlatform extends FakePlatform {
  entered = () => {};
  release: Promise<void> = Promise.resolve();

  constructor(
    readonly delayedPath: string,
    readonly responseAfterMilliseconds: number,
  ) {
    super();
  }

  override async request<T>(request: PlatformRequest): Promise<PlatformResponse<T>> {
    const response = await super.request<T>(request);
    if (request.url.endsWith(this.delayedPath)) {
      this.entered();
      if (this.responseAfterMilliseconds > request.timeoutMilliseconds)
        throw new Error("request_timeout");
      await this.release;
    }
    return response;
  }
}

function setup(platform: LatencyPlatform) {
  const http = new HttpClient("https://staging.example.com", platform);
  const store = new SessionStore(platform, () => 1000);
  return { http, store, client: new WeChatAuthClient(http, platform, store, miniDirectProtocol) };
}

test("direct login accepts an exchange beyond the read deadline without retrying", async () => {
  const platform = new LatencyPlatform(exchangePath, 12_000);
  const { client, store } = setup(platform);
  platform.queuedResponses.push(
    { statusCode: 200, data: challenge },
    { statusCode: 200, data: handoff },
  );
  await client.signIn();
  assertEqual(store.load()?.sessionToken, handoff.sessionToken, "late valid handoff accepted");
  assertEqual(platform.requests.length, 2, "one challenge and one exchange");
});

test("logout during the longer direct exchange rejects its late handoff", async () => {
  const platform = new LatencyPlatform(exchangePath, 12_000);
  const { client, store } = setup(platform);
  let release = () => {};
  const entered = new Promise<void>((resolve) => {
    platform.entered = resolve;
  });
  platform.release = new Promise<void>((resolve) => {
    release = resolve;
  });
  platform.queuedResponses.push(
    { statusCode: 200, data: challenge },
    { statusCode: 200, data: handoff },
    { statusCode: 200, data: { ok: true } },
  );
  const pending = client.signIn();
  await entered;
  client.signOut();
  release();
  await expectReject(
    () => pending,
    (error) => error instanceof AuthContractError && error.code === "user_cancelled",
  );
  assertEqual(store.load(), null, "late response cannot restore the session");
  assertEqual(
    platform.requests.filter((request) => request.url.endsWith(exchangePath)).length,
    1,
    "exchange is not retried after logout",
  );
  assertEqual(
    platform.requests.filter((request) => request.url.endsWith("/api/auth/wechat/logout")).length,
    1,
    "late receipt is disposed through normal logout cleanup",
  );
});

test("catalog mutation deadlines are not extended by the direct exchange budget", async () => {
  const path = "/api/mini-program/v1/catalog/products";
  const platform = new LatencyPlatform(path, 9_000);
  const { http } = setup(platform);
  platform.queuedResponses.push({ statusCode: 200, data: { ok: true } });
  await expectReject(
    () =>
      http.post(path, {}, undefined, {
        errorDomain: "catalog_mutation",
        correlationId: "90000000-0000-4000-8000-000000001001",
        idempotencyKey: "90000000-0000-4000-8000-000000001002",
      }),
    (error) => error instanceof CatalogMutationContractError && error.code === "offline",
  );
  assertEqual(platform.requests.length, 1, "uncertain mutation is not retried");
});
