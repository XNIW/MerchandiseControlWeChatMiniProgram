import test from "node:test";
import { WeChatAuthClient } from "../miniprogram/lib/auth-client";
import { AuthContractError } from "../miniprogram/lib/contracts";
import { HttpClient } from "../miniprogram/lib/http-client";
import type { PlatformRequest, PlatformResponse } from "../miniprogram/lib/platform";
import { SalesApiClient } from "../miniprogram/lib/sales-api-client";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assert, assertEqual, expectReject, FakePlatform } from "./fakes";

const deviceId = "00000000-0000-4000-8000-000000000901";
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
  user: { provider: "custom:wechat" as const },
};

function deferred() {
  let complete = () => {};
  const promise = new Promise<void>((resolve) => {
    complete = resolve;
  });
  return { complete, promise };
}

type Boundary = "device" | "challenge" | "login" | "exchange";
class HeldPlatform extends FakePlatform {
  readonly entered = deferred();
  readonly release = deferred();
  readonly boundary: Boundary;
  #held = false;

  constructor(boundary: Boundary) {
    super();
    this.boundary = boundary;
  }

  async hold(boundary: Boundary) {
    if (boundary !== this.boundary || this.#held) return;
    this.#held = true;
    this.entered.complete();
    await this.release.promise;
  }

  override async randomBytes(length: number): Promise<Uint8Array> {
    await this.hold("device");
    return super.randomBytes(length);
  }

  override async login(timeout: number): Promise<string> {
    await this.hold("login");
    return super.login(timeout);
  }

  override async request<T>(request: PlatformRequest): Promise<PlatformResponse<T>> {
    await this.hold(request.url.endsWith("/challenge") ? "challenge" : "exchange");
    return super.request<T>(request);
  }
}

test("malformed challenge and session handoffs reject with sanitized contract errors", async () => {
  const invalidHandoffs: unknown[] = [
    null,
    {},
    { ...handoff, user: null },
    { ...handoff, user: {} },
    ...[undefined, "4600", null, Number.NaN, Infinity, 4_600.5, 1_000, 87_401].map((expiresAt) => ({
      ...handoff,
      expiresAt,
    })),
    ...[undefined, "3600", 0, 86_401, Number.NaN].map((expiresIn) => ({
      ...handoff,
      expiresIn,
    })),
  ];
  for (const data of invalidHandoffs) {
    const platform = new FakePlatform();
    platform.queuedResponses.push({ data: challenge, statusCode: 200 }, { data, statusCode: 200 });
    const sessions = new SessionStore(platform, () => 1_000);
    const client = new WeChatAuthClient(
      new HttpClient("https://staging.example.com", platform),
      platform,
      sessions,
    );
    await expectReject(
      () => client.signIn(),
      (error) => error instanceof AuthContractError && error.code === "backend_temporary",
    );
    assertEqual(sessions.load(), null, "invalid handoff never creates a session");
    assert(![...platform.storage.values()].includes(handoff.sessionToken), "no token persisted");
  }
  for (const data of [null, {}, { ok: true, challenge: null }, { ...challenge, ok: "true" }]) {
    const platform = new FakePlatform();
    platform.queuedResponses.push({ data, statusCode: 200 });
    const client = new WeChatAuthClient(
      new HttpClient("https://staging.example.com", platform),
      platform,
      new SessionStore(platform, () => 1_000),
    );
    await expectReject(
      () => client.signIn(),
      (error) => error instanceof AuthContractError && error.code === "state_invalid",
    );
    assertEqual(platform.requests.length, 1, "invalid challenge cannot exchange");
  }
});

test("session store independently rejects non-finite and fractional expiry", () => {
  const store = new SessionStore(new FakePlatform(), () => 1_000);
  for (const expiresAt of [Number.NaN, Infinity, 4_600.5, 1_000, 87_401]) {
    let rejected = false;
    try {
      store.save({ ...handoff, expiresAt }, deviceId);
    } catch (error) {
      rejected = error instanceof AuthContractError && error.code === "backend_temporary";
    }
    assert(rejected, "expiry contract must be enforced by the store too");
    assertEqual(store.load(), null, "invalid session is absent");
  }
});

for (const boundary of ["device", "challenge", "login", "exchange"] as const) {
  test(`logout during ${boundary} cannot restore a session`, async () => {
    const platform = new HeldPlatform(boundary);
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
    const pending = client.signIn();
    await platform.entered.promise;
    client.signOut();
    platform.release.complete();
    await expectReject(
      () => pending,
      (error) => error instanceof AuthContractError && error.code === "user_cancelled",
    );
    assertEqual(sessions.load(), null, "logout remains authoritative");
    if (boundary === "exchange") {
      const cleanup = platform.requests.at(-1);
      assert(cleanup?.url.endsWith("/logout"), "abandoned receipt is revoked");
      assertEqual(
        cleanup?.headers?.Authorization,
        `Bearer ${handoff.sessionToken}`,
        "cleanup uses old receipt",
      );
    }
    assertEqual(
      platform.requests.length,
      boundary === "device" ? 0 : boundary === "exchange" ? 3 : 1,
      "only an already issued receipt needs a cleanup request",
    );
  });
}

test("late login cannot replace the account from the newest successful login", async () => {
  const platform = new HeldPlatform("exchange");
  const latest = { ...handoff, accountFingerprint: "b".repeat(64), sessionToken: "b".repeat(43) };
  platform.queuedResponses.push(
    { data: challenge, statusCode: 200 },
    { data: challenge, statusCode: 200 },
    { data: latest, statusCode: 200 },
    { data: handoff, statusCode: 200 },
  );
  const sessions = new SessionStore(platform, () => 1_000);
  const client = new WeChatAuthClient(
    new HttpClient("https://staging.example.com", platform),
    platform,
    sessions,
  );
  const first = client.signIn();
  await platform.entered.promise;
  await client.signIn();
  platform.release.complete();
  await expectReject(
    () => first,
    (error) => error instanceof AuthContractError && error.code === "user_cancelled",
  );
  assertEqual(sessions.load()?.accountFingerprint, latest.accountFingerprint, "new account kept");
  const cleanup = platform.requests.at(-1);
  assert(cleanup?.url.endsWith("/logout"), "old login receipt is revoked");
  assertEqual(
    cleanup?.headers?.Authorization,
    `Bearer ${handoff.sessionToken}`,
    "new session is never revoked",
  );
});

test("obsolete exchange errors cannot invalidate the newest session", async () => {
  const platform = new HeldPlatform("exchange");
  platform.queuedResponses.push(
    { data: challenge, statusCode: 200 },
    { data: challenge, statusCode: 200 },
    { data: handoff, statusCode: 200 },
    { data: { code: "account_suspended" }, statusCode: 403 },
  );
  const sessions = new SessionStore(platform, () => 1_000);
  const client = new WeChatAuthClient(
    new HttpClient("https://staging.example.com", platform),
    platform,
    sessions,
  );
  const first = client.signIn();
  await platform.entered.promise;
  await client.signIn();
  platform.release.complete();
  await expectReject(
    () => first,
    (error) => error instanceof AuthContractError && error.code === "user_cancelled",
  );
  assertEqual(sessions.load()?.sessionToken, handoff.sessionToken, "new session remains active");
});

test("gateway requests refuse redirects for challenge, exchange and authenticated reads", async () => {
  for (const statusCode of [301, 302, 303, 307, 308]) {
    const platform = new FakePlatform();
    const http = new HttpClient("https://staging.example.com", platform);
    const operations = [
      () => http.post("/api/auth/wechat/challenge", { surface: "mini_program" }),
      () => http.post("/api/auth/wechat/exchange", { code: "test-only-code" }),
      () => http.get("/api/wechat/shops", {}, { deviceId, sessionToken: handoff.sessionToken }),
    ];
    for (const operation of operations) {
      platform.queuedResponses.push({ data: {}, statusCode });
      await expectReject(
        operation,
        (error) => error instanceof AuthContractError && error.code === "backend_temporary",
      );
    }
    assertEqual(platform.requests.length, 3, "no redirect request is issued");
    assert(
      platform.requests.every((request) => request.redirect === "manual"),
      "manual only",
    );
  }
});

test("Home clears prior account and sales when another tab logs out or the session expires", async () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previous = { Page: globals.Page, getApp: globals.getApp };
  interface PageInstance {
    data: Record<string, unknown>;
    onHide(): void;
    onShow(): void;
    refresh(): Promise<void>;
    signIn(): Promise<void>;
    bootstrap(): Promise<void>;
    setData(value: Record<string, unknown>): void;
  }
  let definition: PageInstance | undefined;
  let now = 1_000;
  const sessions = new SessionStore(new FakePlatform(), () => now);
  globals.Page = (value: PageInstance) => {
    definition = value;
  };
  const app = {
    activeShop: null as { shop_id: string } | null,
    authClient: null as WeChatAuthClient | null,
    clearSessionContext() {
      sessions.clear();
    },
    featureReady: true,
    locale: "en",
    salesClient: new SalesApiClient(
      new HttpClient("https://staging.example.com", new FakePlatform()),
      sessions,
    ),
    sensitiveCaches: { register() {} },
    sessionStore: sessions,
  };
  globals.getApp = () => app;
  try {
    await import("../miniprogram/pages/index/index.js");
    assert(definition !== undefined, "Home registered");
    const page: PageInstance = {
      ...definition,
      data: { ...definition.data },
      setData(value) {
        Object.assign(this.data, value);
      },
    };
    for (const reason of ["logout", "expiry"]) {
      now = 1_000;
      sessions.save(handoff, deviceId);
      Object.assign(page.data, {
        currentShop: { shop_id: "previous-shop" },
        errorMessage: "old error",
        netRevenue: "CLP 12345",
        saleCount: 20,
        shops: [{ shop_id: "previous-shop" }],
        viewState: "ready",
      });
      if (reason === "logout") sessions.clear();
      else now = 4_600;
      page.onShow();
      assertEqual(page.data.viewState, "signed_out", "login control is restored");
      assertEqual(page.data.currentShop, null, "prior shop removed");
      assertEqual(page.data.netRevenue, "—", "prior sales removed");
      assertEqual(page.data.saleCount, 0, "prior count removed");
      assertEqual(page.data.errorMessage, "", "prior error removed");
      assertEqual((page.data.shops as unknown[]).length, 0, "prior shop list removed");
    }

    // The page can remain visible past expiry, without another onShow event.
    now = 1_000;
    sessions.save(handoff, deviceId);
    app.activeShop = { shop_id: "10000000-0000-4000-8000-000000000201" };
    Object.assign(page.data, {
      currentShop: app.activeShop,
      netRevenue: "CLP 12345",
      viewState: "ready",
    });
    now = 4_600;
    await expectReject(
      () => page.refresh(),
      (error) => error instanceof Error && error.message === "session_expired",
    );
    assertEqual(page.data.viewState, "signed_out", "visible expiry restores login control");
    assertEqual(page.data.netRevenue, "—", "visible expiry removes sales");

    // Exercise real Auth promises through Home, including a late error after logout.
    now = 1_000;
    const cancelled = new HeldPlatform("challenge");
    cancelled.queuedResponses.push({ data: challenge, statusCode: 200 });
    app.authClient = new WeChatAuthClient(
      new HttpClient("https://staging.example.com", cancelled),
      cancelled,
      sessions,
    );
    const pending = page.signIn();
    await cancelled.entered.promise;
    page.onHide();
    app.authClient.signOut();
    page.onShow();
    cancelled.release.complete();
    await pending;
    assertEqual(page.data.viewState, "signed_out", "cancelled login cannot replace signed-out UI");

    const overlapping = new HeldPlatform("exchange");
    overlapping.queuedResponses.push(
      { data: challenge, statusCode: 200 },
      { data: challenge, statusCode: 200 },
      { data: handoff, statusCode: 200 },
      { data: { code: "account_suspended" }, statusCode: 403 },
    );
    app.authClient = new WeChatAuthClient(
      new HttpClient("https://staging.example.com", overlapping),
      overlapping,
      sessions,
    );
    page.bootstrap = async () => {
      page.setData({ viewState: "ready" });
    };
    const older = page.signIn();
    await overlapping.entered.promise;
    await page.signIn();
    overlapping.release.complete();
    await older;
    assertEqual(page.data.viewState, "ready", "obsolete login error cannot replace the new UI");
    assertEqual(
      sessions.load()?.sessionToken,
      handoff.sessionToken,
      "obsolete error cannot log new account out",
    );

    const oldReadPlatform = new HeldPlatform("exchange");
    oldReadPlatform.queuedResponses.push({ data: { code: "session_expired" }, statusCode: 401 });
    app.salesClient = new SalesApiClient(
      new HttpClient("https://staging.example.com", oldReadPlatform),
      sessions,
    );
    app.activeShop = { shop_id: "10000000-0000-4000-8000-000000000201" };
    page.setData({ currentShop: app.activeShop });
    const oldRead = page.refresh();
    await oldReadPlatform.entered.promise;
    page.onHide();
    app.authClient.signOut();
    page.onShow();
    const nextLogin = new HeldPlatform("challenge");
    nextLogin.queuedResponses.push(
      { data: challenge, statusCode: 200 },
      { data: handoff, statusCode: 200 },
    );
    app.authClient = new WeChatAuthClient(
      new HttpClient("https://staging.example.com", nextLogin),
      nextLogin,
      sessions,
    );
    let bootstrapCalls = 0;
    page.bootstrap = async () => {
      bootstrapCalls += 1;
      page.setData({ viewState: "ready" });
    };
    const loginPending = page.signIn();
    await nextLogin.entered.promise;
    oldReadPlatform.release.complete();
    await expectReject(
      () => oldRead,
      (error) => error instanceof Error && error.message === "session_expired",
    );
    assertEqual(page.data.viewState, "loading", "old lifecycle cannot interrupt the next login");
    nextLogin.release.complete();
    await loginPending;
    assertEqual(bootstrapCalls, 1, "new login still bootstraps");
    assertEqual(page.data.viewState, "ready", "new login reaches the active UI");
  } finally {
    globals.Page = previous.Page;
    globals.getApp = previous.getApp;
  }
});
