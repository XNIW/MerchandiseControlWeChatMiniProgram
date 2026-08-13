import test from "node:test";
import { WeChatAuthClient } from "../miniprogram/lib/auth-client";
import { AuthContractError } from "../miniprogram/lib/contracts";
import { HttpClient } from "../miniprogram/lib/http-client";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assert, assertEqual, expectReject, FakePlatform } from "./fakes";

const challenge = {
  challenge: {
    correlationId: "90000000-0000-4000-8000-000000000201",
    expiresInSeconds: 300,
    nonce: "n".repeat(43),
    state: "s".repeat(43),
  },
  ok: true,
};
const handoff = {
  accountFingerprint: "f".repeat(64),
  expiresAt: 4_600,
  expiresIn: 3_600,
  sessionToken: "a".repeat(43),
  tokenType: "bearer" as const,
  user: {
    provider: "custom:wechat" as const,
  },
};

test("wx.login code is exchanged once by the canonical backend and not logged", async () => {
  const platform = new FakePlatform();
  platform.queuedResponses.push(
    { data: challenge, statusCode: 200 },
    { data: handoff, statusCode: 200 },
  );
  const sessions = new SessionStore(platform, () => 1_000);
  const client = new WeChatAuthClient(
    new HttpClient("https://staging.example.com", platform),
    platform,
    sessions,
  );

  assertEqual(await client.signIn(), handoff, "handoff should be returned");
  assertEqual(platform.requests.length, 2, "only challenge and exchange are sent");
  const exchange = platform.requests[1];
  assert(exchange !== undefined, "exchange request should exist");
  assert(exchange.url.endsWith("/api/auth/wechat/exchange"), "exchange must use backend");
  assertEqual((exchange.data as { code: string }).code, "temporary-code", "temporary code sent");
  assert(
    sessions.load()?.sessionToken === handoff.sessionToken,
    "bounded opaque session should be stored",
  );
});

test("cancel and missing code fail closed before exchange", async () => {
  const cancelledPlatform = new FakePlatform();
  cancelledPlatform.loginFails = true;
  cancelledPlatform.queuedResponses.push({ data: challenge, statusCode: 200 });
  const cancelled = new WeChatAuthClient(
    new HttpClient("https://staging.example.com", cancelledPlatform),
    cancelledPlatform,
    new SessionStore(cancelledPlatform, () => 1_000),
  );
  await expectReject(
    () => cancelled.signIn(),
    (error) => error instanceof AuthContractError && error.code === "user_cancelled",
  );
  assertEqual(cancelledPlatform.requests.length, 1, "cancel should not exchange code");

  const missingPlatform = new FakePlatform();
  missingPlatform.loginCode = "";
  missingPlatform.queuedResponses.push({ data: challenge, statusCode: 200 });
  const missing = new WeChatAuthClient(
    new HttpClient("https://staging.example.com", missingPlatform),
    missingPlatform,
    new SessionStore(missingPlatform, () => 1_000),
  );
  await expectReject(
    () => missing.signIn(),
    (error) => error instanceof AuthContractError && error.code === "code_missing",
  );
});

test("invalid challenge and provider confusion are rejected", async () => {
  const platform = new FakePlatform();
  platform.queuedResponses.push({
    data: { ...challenge, challenge: { ...challenge.challenge, state: "short" } },
    statusCode: 200,
  });
  const client = new WeChatAuthClient(
    new HttpClient("https://staging.example.com", platform),
    platform,
    new SessionStore(platform, () => 1_000),
  );
  await expectReject(
    () => client.signIn(),
    (error) => error instanceof AuthContractError && error.code === "state_invalid",
  );

  const confusedPlatform = new FakePlatform();
  confusedPlatform.queuedResponses.push(
    { data: challenge, statusCode: 200 },
    {
      data: { ...handoff, user: { ...handoff.user, provider: "google" } },
      statusCode: 200,
    },
  );
  const confused = new WeChatAuthClient(
    new HttpClient("https://staging.example.com", confusedPlatform),
    confusedPlatform,
    new SessionStore(confusedPlatform, () => 1_000),
  );
  await expectReject(
    () => confused.signIn(),
    (error) => error instanceof AuthContractError && error.code === "backend_temporary",
  );
});
