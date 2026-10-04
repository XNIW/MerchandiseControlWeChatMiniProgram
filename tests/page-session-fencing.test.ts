import test from "node:test";
import type {
  AccountProfile,
  AuthorizedShop,
  SyncHistoryEntry,
} from "../miniprogram/lib/contracts";
import { AuthContractError } from "../miniprogram/lib/contracts";
import { translationsFor } from "../miniprogram/locales/index";
import { assert, assertEqual } from "./fakes";

interface Deferred<Value> {
  readonly promise: Promise<Value>;
  reject(error: Error): void;
  resolve(value: Value): void;
}

interface RegisteredPage {
  data: Record<string, unknown>;
  [key: string]: unknown;
}

function deferred<Value>(): Deferred<Value> {
  let resolver: ((value: Value) => void) | null = null;
  let rejecter: ((error: Error) => void) | null = null;
  const promise = new Promise<Value>((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  return {
    promise,
    reject(error) {
      assert(rejecter !== null, "deferred rejecter exists");
      rejecter(error);
    },
    resolve(value) {
      assert(resolver !== null, "deferred resolver exists");
      resolver(value);
    },
  };
}

function instantiatePage(definition: RegisteredPage): RegisteredPage {
  const page: RegisteredPage = {
    ...definition,
    data: { ...definition.data },
  };
  page.setData = (update: Record<string, unknown>) => Object.assign(page.data, update);
  return page;
}

function invoke(page: RegisteredPage, methodName: string, ...args: unknown[]): unknown {
  const method = page[methodName];
  assert(typeof method === "function", `${methodName} is registered`);
  return method.apply(page, args);
}

function pageArray<Value>(page: RegisteredPage, key: string): readonly Value[] {
  const value = page.data[key];
  assert(Array.isArray(value), `${key} is an array`);
  return value as readonly Value[];
}

async function settleAsyncPageUpdate(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function shop(shopId: string, name: string): AuthorizedShop {
  return {
    can_change_prices: true,
    can_manage_images: true,
    can_read_catalog: true,
    can_read_catalog_history: true,
    can_write_categories: true,
    can_write_products: true,
    can_write_suppliers: true,
    currency_code: "CLP",
    role_key: "shop_owner",
    server_time: "2026-08-13T00:00:00Z",
    shop_code: name,
    shop_id: shopId,
    shop_name: name,
    time_zone: "America/Santiago",
  };
}

function syncEntry(eventId: number): SyncHistoryEntry {
  return {
    changed_count: 1,
    created_at: `2026-08-13T00:00:0${eventId}Z`,
    domain: "catalog",
    event_id: eventId,
    event_type: `event-${eventId}`,
    source: "test",
  };
}

function account(profileId: string, displayName: string): AccountProfile {
  return {
    display_name: displayName,
    profile_id: profileId,
    profile_status: "active",
    providers: ["wechat"],
    server_time: "2026-08-13T00:00:00Z",
    wechat_linked: true,
  };
}

test("history and account pages clear old scope and reject late session/shop/cache requests", async () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previousGetApp = globals.getApp;
  const previousPage = globals.Page;
  const previousWx = globals.wx;
  let activeApp: unknown = null;
  let registeredPage: RegisteredPage | null = null;
  globals.getApp = () => activeApp;
  globals.Page = (definition: unknown) => {
    assert(typeof definition === "object" && definition !== null, "Page definition is an object");
    registeredPage = definition as RegisteredPage;
  };
  globals.wx = {
    navigateTo() {},
    setNavigationBarTitle() {},
    showToast() {},
    stopPullDownRefresh() {},
    switchTab() {},
  };

  const takeRegisteredPage = (): RegisteredPage => {
    assert(registeredPage !== null, "Page was registered");
    const page = instantiatePage(registeredPage);
    registeredPage = null;
    return page;
  };

  try {
    const shopA = shop("10000000-0000-4000-8000-000000000301", "Shop A");
    const shopB = shop("10000000-0000-4000-8000-000000000302", "Shop B");
    const historySession = { active: true, generation: 1 };
    const historyCaches = { generation: 1 };
    const historyRequests: Deferred<readonly SyncHistoryEntry[]>[] = [];
    const historyShopIds: string[] = [];
    const historyApp = {
      activeShop: shopA,
      featureReady: true,
      locale: "en",
      salesClient: {
        syncHistory(shopId: string) {
          historyShopIds.push(shopId);
          const request = deferred<readonly SyncHistoryEntry[]>();
          historyRequests.push(request);
          return request.promise;
        },
      },
      sensitiveCaches: historyCaches,
      sessionStore: {
        get generation() {
          return historySession.generation;
        },
        load() {
          return historySession.active
            ? {
                accountFingerprint: "f".repeat(64),
                deviceId: "00000000-0000-4000-8000-000000000901",
                expiresAt: 4_600,
                sessionToken: "a".repeat(43),
              }
            : null;
        },
      },
    };
    activeApp = historyApp;
    await import("../miniprogram/pages/history/index.js");
    const historyPage = takeRegisteredPage();
    historyPage.data.viewMode = "sync";

    invoke(historyPage, "onShow");
    invoke(historyPage, "onShow");
    assertEqual(historyRequests.length, 2, "a newer onShow supersedes an active request");
    historyRequests[1]?.resolve([syncEntry(2)]);
    await settleAsyncPageUpdate();
    assertEqual(
      pageArray<SyncHistoryEntry>(historyPage, "syncItems")[0]?.event_id,
      2,
      "latest request publishes",
    );
    historyRequests[0]?.resolve([syncEntry(1)]);
    await settleAsyncPageUpdate();
    assertEqual(
      pageArray<SyncHistoryEntry>(historyPage, "syncItems")[0]?.event_id,
      2,
      "superseded request cannot overwrite the latest result",
    );

    invoke(historyPage, "onShow");
    assertEqual(
      pageArray<SyncHistoryEntry>(historyPage, "syncItems").length,
      1,
      "same-scope onShow preserves rendered rows while refreshing",
    );
    historySession.generation += 1;
    historyCaches.generation += 1;
    historyApp.activeShop = shopB;
    historyRequests[2]?.resolve([syncEntry(3)]);
    await settleAsyncPageUpdate();
    assertEqual(
      pageArray<SyncHistoryEntry>(historyPage, "syncItems").length,
      0,
      "changed session, cache, and shop scope blocks late publication",
    );
    invoke(historyPage, "onShow");
    historyRequests[3]?.resolve([syncEntry(4)]);
    await settleAsyncPageUpdate();
    assertEqual(
      pageArray<SyncHistoryEntry>(historyPage, "syncItems")[0]?.event_id,
      4,
      "new shop request publishes after the scope transition",
    );
    assertEqual(historyShopIds[2], shopA.shop_id, "stale request remains bound to shop A");
    assertEqual(historyShopIds[3], shopB.shop_id, "new request is bound to shop B");

    const accountSession = { active: true, generation: 1 };
    const accountSessionListeners = new Set<() => void>();
    const accountCaches = { generation: 1 };
    const accountRequests: Deferred<AccountProfile | null>[] = [];
    const shopsRequests: Deferred<readonly AuthorizedShop[]>[] = [];
    const selectedShops: string[] = [];
    const pendingEntries = [
      {
        attempts: 0,
        entityType: "product",
        operationId: "30000000-0000-4000-8000-000000000302",
        payload: { productName: "Pending B" },
        shopId: shopB.shop_id,
        state: "pending",
      },
    ];
    let discardedPending = 0;
    let clearedShopContexts = 0;
    const accountApp = {
      activeShop: shopA as AuthorizedShop | null,
      clearSessionContext() {
        accountSession.active = false;
        accountSession.generation += 1;
        this.clearShopContext();
        for (const listener of accountSessionListeners) listener();
      },
      clearShopContext() {
        clearedShopContexts += 1;
        this.activeShop = null;
        accountCaches.generation += 1;
      },
      featureReady: true,
      locale: "en",
      outbox: {
        discard() {
          discardedPending += 1;
        },
        pendingForCurrentShop(shopId: string) {
          return pendingEntries.filter((entry) => entry.shopId === shopId);
        },
        storageUnavailableForShop() {
          return false;
        },
        subscribe() {
          return () => {};
        },
      },
      salesClient: {
        account() {
          const request = deferred<AccountProfile | null>();
          accountRequests.push(request);
          return request.promise;
        },
        authorizedShops() {
          const request = deferred<readonly AuthorizedShop[]>();
          shopsRequests.push(request);
          return request.promise;
        },
      },
      selectShop(selected: AuthorizedShop) {
        selectedShops.push(selected.shop_id);
        if (this.activeShop?.shop_id !== selected.shop_id) accountCaches.generation += 1;
        this.activeShop = selected;
      },
      sensitiveCaches: accountCaches,
      sessionStore: {
        get generation() {
          return accountSession.generation;
        },
        load() {
          return accountSession.active
            ? {
                accountFingerprint: "e".repeat(64),
                deviceId: "00000000-0000-4000-8000-000000000902",
                expiresAt: 4_600,
                sessionToken: "b".repeat(43),
              }
            : null;
        },
        subscribe(listener: () => void) {
          accountSessionListeners.add(listener);
          return () => accountSessionListeners.delete(listener);
        },
      },
      setLocale() {},
    };
    activeApp = accountApp;
    await import("../miniprogram/pages/account/index.js");
    const accountPage = takeRegisteredPage();
    accountPage.data.account = account("20000000-0000-4000-8000-000000000399", "Stale account");
    accountPage.data.currentShop = shopA;
    accountPage.data.shops = [shopA];

    invoke(accountPage, "onShow");
    assertEqual(accountPage.data.account, null, "account onShow clears the prior profile");
    assertEqual(
      pageArray<AuthorizedShop>(accountPage, "shops").length,
      0,
      "account onShow clears prior memberships",
    );
    accountSession.generation += 1;
    accountCaches.generation += 1;
    accountApp.activeShop = shopB;
    invoke(accountPage, "onShow");
    accountRequests[1]?.resolve(account("20000000-0000-4000-8000-000000000302", "Account B"));
    shopsRequests[1]?.resolve([shopB]);
    await settleAsyncPageUpdate();
    assertEqual(
      (accountPage.data.account as AccountProfile | null)?.display_name,
      "Account B",
      "replacement session profile publishes",
    );
    accountRequests[0]?.resolve(account("20000000-0000-4000-8000-000000000301", "Account A"));
    shopsRequests[0]?.resolve([shopA]);
    await settleAsyncPageUpdate();
    assertEqual(
      (accountPage.data.account as AccountProfile | null)?.display_name,
      "Account B",
      "late prior-session profile cannot repopulate account state",
    );
    assertEqual(selectedShops.length, 1, "stale account request cannot select its old shop");
    assertEqual(selectedShops[0], shopB.shop_id, "only the replacement shop is selected");

    invoke(accountPage, "onShow");
    assertEqual(accountPage.data.signedIn, true, "logout remains available during profile loading");
    accountRequests[2]?.reject(new Error("offline"));
    shopsRequests[2]?.resolve([shopB]);
    await settleAsyncPageUpdate();
    assertEqual(
      accountPage.data.account,
      null,
      "failed profile request exposes no cached identity",
    );
    assertEqual(accountPage.data.loading, false, "offline profile loading ends");
    assertEqual(accountPage.data.signedIn, true, "offline profile failure preserves local logout");
    assertEqual(accountApp.activeShop?.shop_id, shopB.shop_id, "network failure preserves scope");
    assertEqual(clearedShopContexts, 0, "network failure is not confirmed loss of membership");

    invoke(accountPage, "onShow");
    accountSession.generation += 1;
    for (const listener of accountSessionListeners) listener();
    assertEqual(
      accountPage.data.signedIn,
      true,
      "replacement session keeps local logout available",
    );
    accountRequests[3]?.resolve(account("20000000-0000-4000-8000-000000000302", "Account B"));
    shopsRequests[3]?.resolve([shopB]);
    await settleAsyncPageUpdate();
    assertEqual(accountPage.data.account, null, "replacement rejects the old profile response");

    invoke(accountPage, "onShow");
    invoke(accountPage, "onHide");
    accountRequests[4]?.resolve(account("20000000-0000-4000-8000-000000000302", "Account B"));
    shopsRequests[4]?.resolve([]);
    await settleAsyncPageUpdate();
    assertEqual(
      accountPage.data.account,
      null,
      "hidden page rejects the outstanding profile response",
    );
    assertEqual(
      accountApp.activeShop?.shop_id,
      shopB.shop_id,
      "hidden empty list cannot clear scope",
    );

    const membershipGeneration = accountSession.generation;
    const membershipCacheGeneration = accountCaches.generation;
    invoke(accountPage, "onShow");
    accountRequests[5]?.resolve(account("20000000-0000-4000-8000-000000000302", "Account B"));
    shopsRequests[5]?.resolve([]);
    await settleAsyncPageUpdate();
    assertEqual(clearedShopContexts, 1, "confirmed empty membership list clears the active shop");
    assertEqual(accountApp.activeShop, null, "revoked shop is no longer available to other pages");
    assertEqual(accountCaches.generation, membershipCacheGeneration + 1, "shop caches invalidate");
    assertEqual(accountSession.generation, membershipGeneration, "membership loss is not logout");
    assertEqual(accountSession.active, true, "personal identity remains valid without a shop");
    assertEqual(accountPage.data.signedIn, true, "sign out remains available without memberships");
    assertEqual(accountPage.data.currentShop, null, "account displays no revoked shop");

    accountApp.activeShop = shopB;
    accountCaches.generation += 1;
    invoke(accountPage, "onShow");
    accountRequests[6]?.reject(new Error("temporary profile failure"));
    shopsRequests[6]?.resolve([]);
    await settleAsyncPageUpdate();
    assertEqual(clearedShopContexts, 2, "profile failure cannot hide a successful empty shop list");
    assertEqual(accountApp.activeShop, null, "independent membership result clears revoked scope");
    assertEqual(accountSession.active, true, "profile timeout is not a logout");

    accountApp.activeShop = shopB;
    accountCaches.generation += 1;
    invoke(accountPage, "onShow");
    accountRequests[7]?.resolve(account("20000000-0000-4000-8000-000000000302", "Account B"));
    shopsRequests[7]?.reject(new Error("temporary shops failure"));
    await settleAsyncPageUpdate();
    assertEqual(accountApp.activeShop?.shop_id, shopB.shop_id, "shop timeout preserves scope");
    assertEqual(clearedShopContexts, 2, "failed membership read is not an empty membership list");

    invoke(accountPage, "onShow");
    accountRequests[8]?.resolve(account("20000000-0000-4000-8000-000000000302", "Account B"));
    shopsRequests[8]?.resolve([shopA]);
    await settleAsyncPageUpdate();
    assertEqual(
      accountApp.activeShop?.shop_id,
      shopA.shop_id,
      "remaining authorized shop replaces scope",
    );
    assertEqual(accountPage.data.currentShop, shopA, "account displays the authorized replacement");
    assertEqual(clearedShopContexts, 2, "valid replacement uses the existing shop transition");

    invoke(accountPage, "onShow");
    accountRequests[9]?.reject(new AuthContractError("timeout"));
    shopsRequests[9]?.resolve([shopB]);
    await settleAsyncPageUpdate();
    assertEqual(
      accountApp.activeShop?.shop_id,
      shopB.shop_id,
      "profile timeout cannot retain a shop absent from the successful membership result",
    );
    assertEqual(accountPage.data.account, null, "profile timeout exposes no cached identity");
    assertEqual(accountSession.active, true, "authorized shop replacement preserves identity");
    assertEqual(
      accountPage.data.currentShop,
      shopB,
      "partial account result identifies active shop B",
    );
    assertEqual(
      pageArray<AuthorizedShop>(accountPage, "shops")[0],
      shopB,
      "partial account result preserves authorized shop choices",
    );
    assertEqual(
      accountPage.data.pendingShopName,
      shopB.shop_name,
      "pending work identifies scope B",
    );
    assertEqual(
      pageArray<{ shopId: string }>(accountPage, "pending")[0]?.shopId,
      shopB.shop_id,
      "partial result exposes only pending B",
    );
    assertEqual(
      accountPage.data.errorMessage,
      "Request timed out. Retry.",
      "profile timeout is explicit",
    );
    invoke(accountPage, "chooseShop", { detail: { value: "0" } });
    assertEqual(
      accountPage.data.currentShop,
      shopB,
      "partial result remains selectable without a profile",
    );
    const heldRefresh = accountRequests.length;
    void invoke(accountPage, "load");
    assertEqual(accountPage.data.loading, true, "Retry starts a refresh");
    invoke(accountPage, "chooseShop", { detail: { value: "0" } });
    assertEqual(accountPage.data.loading, false, "shop selection releases the cancelled refresh");
    assertEqual(
      accountPage.data.errorMessage,
      "Request timed out. Retry.",
      "cancelled partial refresh preserves the visible Retry action",
    );
    accountRequests[heldRefresh]?.resolve(
      account("20000000-0000-4000-8000-000000000302", "Late profile"),
    );
    shopsRequests[heldRefresh]?.resolve([shopA]);
    await settleAsyncPageUpdate();
    assertEqual(
      accountPage.data.currentShop,
      shopB,
      "cancelled refresh cannot replace selected shop B",
    );
    assertEqual(
      accountPage.data.pendingShopName,
      shopB.shop_name,
      "cancelled refresh preserves pending scope B",
    );
    assertEqual(accountPage.data.loading, false, "late refresh leaves the loading owner released");
    const freshRefresh = accountRequests.length;
    void invoke(accountPage, "load");
    assertEqual(
      accountRequests.length,
      freshRefresh + 1,
      "Retry remains usable after shop selection",
    );
    accountRequests[freshRefresh]?.reject(new AuthContractError("timeout"));
    shopsRequests[freshRefresh]?.resolve([shopB]);
    await settleAsyncPageUpdate();
    assertEqual(accountPage.data.loading, false, "new Retry completes normally");
    for (const [index, locale] of (["zh-Hans", "en", "es", "it"] as const).entries()) {
      invoke(accountPage, "chooseLocale", { detail: { value: String(index) } });
      const text = translationsFor(locale);
      assertEqual(
        accountPage.data.errorMessage,
        text.requestTimeout,
        "partial-result error follows locale",
      );
      assertEqual(
        accountPage.data.pendingShopName,
        shopB.shop_name,
        "locale change preserves pending scope name",
      );
    }

    for (const code of ["account_suspended", "session_expired"] as const) {
      accountSession.active = true;
      accountSession.generation += 1;
      accountApp.activeShop = shopB;
      accountCaches.generation += 1;
      const selectedBeforeDenial = selectedShops.length;
      const denialRequest = accountRequests.length;
      const sessionBeforeDenial = accountSession.generation;
      invoke(accountPage, "onShow");
      accountRequests[denialRequest]?.reject(new AuthContractError(code));
      shopsRequests[denialRequest]?.resolve([shopA]);
      await settleAsyncPageUpdate();
      assertEqual(
        selectedShops.length,
        selectedBeforeDenial,
        "confirmed denial cannot select a concurrent shop result",
      );
      assertEqual(accountApp.activeShop, null, "confirmed denial clears business scope");
      assertEqual(
        accountSession.active,
        false,
        "confirmed global denial invalidates the personal session",
      );
      assertEqual(
        accountSession.generation,
        sessionBeforeDenial + 1,
        "global denial changes session generation once",
      );
      assertEqual(accountPage.data.signedIn, false, "global denial clears signed-in presentation");
      assertEqual(
        accountPage.data.loading,
        false,
        "global denial ends loading despite session callback",
      );
      assertEqual(accountPage.data.currentShop, null, "global denial exposes no shop");
      assertEqual(pageArray(accountPage, "pending").length, 0, "global denial hides prior pending");
      assertEqual(discardedPending, 0, "global denial never discards pending work");
      assertEqual(pendingEntries.length, 1, "pending work remains retained for the original scope");
    }

    accountSession.active = true;
    accountSession.generation += 1;
    accountApp.activeShop = shopB;
    accountCaches.generation += 1;

    const revokedRequest = accountRequests.length;
    invoke(accountPage, "onShow");
    assertEqual(accountSessionListeners.size, 1, "onShow replaces the session subscription");
    accountSession.active = false;
    accountSession.generation += 1;
    for (const listener of accountSessionListeners) listener();
    assertEqual(accountPage.data.signedIn, false, "revocation hides logout immediately");
    assertEqual(accountPage.data.account, null, "revocation clears the displayed profile");
    assertEqual(
      pageArray<AuthorizedShop>(accountPage, "shops").length,
      0,
      "revocation clears shops",
    );
    accountRequests[revokedRequest]?.resolve(
      account("20000000-0000-4000-8000-000000000302", "Account B"),
    );
    shopsRequests[revokedRequest]?.resolve([shopB]);
    await settleAsyncPageUpdate();
    assertEqual(accountPage.data.account, null, "late response cannot restore revoked profile");
    assertEqual(accountPage.data.signedIn, false, "late response cannot restore revoked logout");
    invoke(accountPage, "onHide");
    assertEqual(accountSessionListeners.size, 0, "hidden page releases the session subscription");
    invoke(accountPage, "onShow");
    assertEqual(accountPage.data.signedIn, false, "signed-out onShow does not expose logout");
    invoke(accountPage, "onUnload");
    assertEqual(accountSessionListeners.size, 0, "unloaded page releases the session subscription");
  } finally {
    if (previousGetApp === undefined) delete globals.getApp;
    else globals.getApp = previousGetApp;
    if (previousPage === undefined) delete globals.Page;
    else globals.Page = previousPage;
    if (previousWx === undefined) delete globals.wx;
    else globals.wx = previousWx;
  }
});
