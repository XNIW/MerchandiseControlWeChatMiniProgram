import test from "node:test";
import { WeChatAuthClient } from "../miniprogram/lib/auth-client";
import { HttpClient } from "../miniprogram/lib/http-client";
import { base64Url, MiniPairingClient, miniDirectProtocol } from "../miniprogram/lib/mini-direct";
import { isMiniSessionHandoff, SessionStore } from "../miniprogram/lib/session-store";
import { assertEqual, assert as check, expectReject, FakePlatform } from "./fakes";

const assert = {
  equal: (actual: unknown, expected: unknown) => assertEqual(actual, expected, "direct contract"),
  match: (actual: string, pattern: RegExp) => check(pattern.test(actual), "direct shape"),
  rejects: (operation: () => Promise<unknown>) => expectReject(operation, () => true),
};

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
function setup() {
  const platform = new FakePlatform();
  const http = new HttpClient("https://staging.example.com", platform);
  const store = new SessionStore(platform, () => 1000);
  return {
    platform,
    http,
    store,
    client: new WeChatAuthClient(http, platform, store, miniDirectProtocol),
  };
}
test("direct login binds a secure verifier, uses its selected protocol and stores only an opaque in-memory receipt", async () => {
  const { platform, client, store } = setup();
  platform.queuedResponses.push(
    { data: challenge, statusCode: 200 },
    { data: handoff, statusCode: 200 },
  );
  await client.signIn();
  assert.equal(store.load()?.sessionToken, handoff.sessionToken);
  assert.equal(
    platform.requests[0]?.url,
    "https://staging.example.com/api/auth/wechat/mini/challenge",
  );
  const body = platform.requests[0]?.data as Record<string, unknown>;
  const exchange = platform.requests[1]?.data as Record<string, unknown>;
  assert.match(String(body.verifier), /^[A-Za-z0-9_-]{43}$/);
  assert.equal(exchange.verifier, body.verifier);
  assert.equal(exchange.challengeId, challenge.challengeId);
  assert.equal(exchange.protocol, miniDirectProtocol);
  assert.equal(exchange.nonce, undefined);
  assert.equal(
    JSON.stringify([...platform.storage.values()]).includes(handoff.sessionToken),
    false,
  );
});
test("direct session discriminators reject mixed OIDC claims and oversized direct lifetime", () => {
  assert.equal(isMiniSessionHandoff(handoff), true);
  for (const delta of [
    { protocol: undefined },
    { protocol: "mini-id-token-nonce-v1" },
    { user: { provider: "custom:wechat" } },
    { expiresIn: 901 },
  ])
    assert.equal(isMiniSessionHandoff({ ...handoff, ...delta }), false);
  for (const [bytes, expected] of [
    [[], ""],
    [[0], "AA"],
    [[0, 7], "AAc"],
    [[0, 7, 14], "AAcO"],
    [[255, 254, 253], "__79"],
  ] as const) {
    assert.equal(base64Url(Uint8Array.from(bytes)), expected);
  }
});
test("wrong protocol and backend errors never fall back to OIDC", async () => {
  for (const response of [
    { data: { ...challenge, protocol: "mini-id-token-nonce-v1" }, statusCode: 200 },
    { data: { code: "provider_not_configured" }, statusCode: 503 },
  ]) {
    const { platform, client, store } = setup();
    platform.queuedResponses.push(response);
    await assert.rejects(() => client.signIn());
    assert.equal(store.load(), null);
    assert.equal(platform.requests.length, 1);
  }
});
test("logout during direct wx.login prevents exchange and late session installation", async () => {
  const { platform, client, store } = setup();
  let release = () => {};
  let entered = () => {};
  const entry = new Promise<void>((r) => {
    entered = r;
  });
  const held = new Promise<void>((r) => {
    release = r;
  });
  platform.login = async () => {
    entered();
    await held;
    return "fresh_code";
  };
  platform.queuedResponses.push({ data: challenge, statusCode: 200 });
  const pending = client.signIn();
  await entry;
  client.signOut();
  release();
  await assert.rejects(() => pending);
  assert.equal(store.load(), null);
  assert.equal(platform.requests.length, 1);
});
test("pairing uses two distinct login proofs bound to the transfer and fixed pairing, with no business session", async () => {
  const { platform, http, store } = setup();
  const pairing = new MiniPairingClient(http, platform);
  const pairingId = "80000000-0000-4000-8000-000000001001";
  const context = {
    ok: true,
    protocol: miniDirectProtocol,
    pairingId,
    miniCapability: "c".repeat(43),
    comparison: "12345678",
    accountName: "Isolated owner",
    expiresAt: new Date(Date.now() + 240_000).toISOString(),
  };
  platform.queuedResponses.push(
    { data: challenge, statusCode: 200 },
    { data: context, statusCode: 200 },
    {
      data: { ...challenge, challengeId: "90000000-0000-4000-8000-000000001002" },
      statusCode: 200,
    },
    { data: { ok: true, state: "linked" }, statusCode: 200 },
  );
  await pairing.claim("t".repeat(43));
  await pairing.confirm();
  const claimBody = platform.requests[0]?.data as Record<string, unknown>;
  const confirmBody = platform.requests[2]?.data as Record<string, unknown>;
  assert.equal(claimBody.transferCode, "t".repeat(43));
  assert.equal(claimBody.purpose, "pair_claim");
  assert.equal(confirmBody.pairingId, pairingId);
  assert.equal(confirmBody.purpose, "pair_confirm");
  assert.equal((platform.requests[3]?.data as Record<string, unknown> | undefined)?.consent, true);
  assert.equal(store.load(), null);
  assert.equal(
    JSON.stringify([...platform.storage.values()]).includes(context.miniCapability),
    false,
  );
  await assert.rejects(() => pairing.confirm());
});
test("cancelled or malformed pairing cannot confirm", async () => {
  const { platform, http } = setup();
  const pairing = new MiniPairingClient(http, platform);
  platform.queuedResponses.push(
    { data: challenge, statusCode: 200 },
    { data: { ok: true }, statusCode: 200 },
  );
  await assert.rejects(() => pairing.claim("t".repeat(43)));
  pairing.cancel();
  await assert.rejects(() => pairing.confirm());
});

test("server enrollment_required survives HTTP parsing into a recoverable Home state", async () => {
  const { platform, client, store } = setup();
  platform.queuedResponses.push(
    { data: challenge, statusCode: 200 },
    { data: { ok: false, code: "enrollment_required" }, statusCode: 403 },
  );
  const globals = globalThis as unknown as Record<string, unknown>;
  const previous = { Page: globals.Page, getApp: globals.getApp, wx: globals.wx };
  interface HomePage {
    data: Record<string, unknown>;
    setData(value: Record<string, unknown>): void;
    onShow(): void;
    signIn(): Promise<void>;
    openPairing(): void;
  }
  let definition: HomePage | undefined;
  let destination = "";
  globals.getApp = () => ({
    featureReady: true,
    locale: "en",
    authClient: client,
    salesClient: {},
    sessionStore: store,
    sensitiveCaches: { register() {} },
    clearSessionContext() {},
  });
  globals.Page = (page: HomePage) => {
    definition = page;
  };
  globals.wx = {
    navigateTo(options: { url: string }) {
      destination = options.url;
    },
  };
  try {
    await import("../miniprogram/pages/index/index.js");
    check(definition, "Home registered");
    const page: HomePage = {
      ...definition,
      data: { ...definition.data },
      setData(update) {
        Object.assign(this.data, update);
      },
    };
    page.onShow();
    await page.signIn();
    assert.equal(page.data.viewState, "enrollment_required");
    check(String(page.data.errorMessage).length > 20, "actionable enrollment explanation");
    page.openPairing();
    assert.equal(destination, "/pages/pairing/index");
    assert.equal(store.load(), null);
  } finally {
    Object.assign(globals, previous);
  }
});
