import test from "node:test";
import type {
  AccountProfile,
  AuthorizedShop,
  SyncHistoryEntry,
} from "../miniprogram/lib/contracts";
import { assert, assertEqual } from "./fakes";

interface Deferred<Value> {
  readonly promise: Promise<Value>;
  resolve(value: Value): void;
}

interface RegisteredPage {
  data: Record<string, unknown>;
  [key: string]: unknown;
}

function deferred<Value>(): Deferred<Value> {
  let resolver: ((value: Value) => void) | null = null;
  const promise = new Promise<Value>((resolve) => {
    resolver = resolve;
  });
  return {
    promise,
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
      0,
      "onShow clears previously rendered shop data",
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
    const accountCaches = { generation: 1 };
    const accountRequests: Deferred<AccountProfile | null>[] = [];
    const shopsRequests: Deferred<readonly AuthorizedShop[]>[] = [];
    const selectedShops: string[] = [];
    const accountApp = {
      activeShop: shopA,
      clearSessionContext() {},
      featureReady: true,
      locale: "en",
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
  } finally {
    if (previousGetApp === undefined) delete globals.getApp;
    else globals.getApp = previousGetApp;
    if (previousPage === undefined) delete globals.Page;
    else globals.Page = previousPage;
    if (previousWx === undefined) delete globals.wx;
    else globals.wx = previousWx;
  }
});
