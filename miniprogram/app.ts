import {
  isProductImageRuntimeConfigReady,
  isRuntimeConfigReady,
  runtimeConfig,
} from "./config/runtime-config";
import { WeChatAuthClient } from "./lib/auth-client";
import {
  CatalogMutationAttemptController,
  CatalogMutationClient,
} from "./lib/catalog-mutation-client";
import type { AuthorizedShop } from "./lib/contracts";
import { DurableCatalogOutbox } from "./lib/durable-catalog-outbox";
import { HttpClient } from "./lib/http-client";
import { OutboxDrain } from "./lib/outbox-drain";
import { createWeChatPlatform } from "./lib/platform";
import { ProductImageMutationClient } from "./lib/product-image-mutation-client";
import { SalesApiClient } from "./lib/sales-api-client";
import { SensitiveCacheCoordinator } from "./lib/sensitive-cache";
import { SessionStore } from "./lib/session-store";
import { MiniSyncCoordinator } from "./lib/sync-coordinator";
import type { LocaleKey } from "./locales/index";
import { translationsFor } from "./locales/index";

function applyTabLocale(locale: LocaleKey): void {
  const text = translationsFor(locale);
  [text.home, text.sales, text.database, text.history, text.account].forEach((label, index) => {
    wx.setTabBarItem({ index, text: label });
  });
}

export interface MerchandiseControlApp {
  activeShop: AuthorizedShop | null;
  authClient: WeChatAuthClient | null;
  catalogClient: CatalogMutationClient | null;
  createCatalogMutationAttempt(): CatalogMutationAttemptController | null;
  featureReady: boolean;
  locale: LocaleKey;
  imageClient: ProductImageMutationClient | null;
  outbox: DurableCatalogOutbox;
  pendingCatalogFilter: { categoryId?: string; supplierId?: string } | null;
  requestSignOut(): Promise<void>;
  salesClient: SalesApiClient | null;
  sensitiveCaches: SensitiveCacheCoordinator;
  clearSessionContext(): void;
  clearShopContext(): void;
  selectShop(shop: AuthorizedShop): void;
  setLocale(locale: LocaleKey): void;
  sessionStore: SessionStore;
  syncCoordinator: MiniSyncCoordinator | null;
}

let appVisible = false;
const platform = createWeChatPlatform();
const sensitiveCaches = new SensitiveCacheCoordinator();
const sessionStore = new SessionStore(platform);
sensitiveCaches.bindSessionStore(sessionStore);
const featureReady = isRuntimeConfigReady(runtimeConfig);
const http = featureReady ? new HttpClient(runtimeConfig.gatewayBaseUrl, platform) : null;
const catalogClient = http ? new CatalogMutationClient(http, sessionStore) : null;
const outbox = new DurableCatalogOutbox(platform, sessionStore);
const syncCoordinator = http
  ? new MiniSyncCoordinator(http, sessionStore, platform, sensitiveCaches)
  : null;
const imageClient =
  http && isProductImageRuntimeConfigReady(runtimeConfig)
    ? new ProductImageMutationClient(http, sessionStore, platform, {
        adminBaseUrl: runtimeConfig.gatewayBaseUrl,
        supabaseStorageBaseUrl: runtimeConfig.supabaseStorageBaseUrl,
      })
    : null;

const drain = catalogClient
  ? new OutboxDrain(
      outbox,
      catalogClient,
      sessionStore,
      {
        schedule: (callback, delay) => setTimeout(callback, delay),
        clear: (timer) => clearTimeout(timer),
      },
      (shopId) => {
        sensitiveCaches.invalidate();
        void syncCoordinator?.syncNow(shopId);
      },
    )
  : null;

App<MerchandiseControlApp>({
  activeShop: null,
  authClient: http
    ? new WeChatAuthClient(http, platform, sessionStore, runtimeConfig.miniAuthProtocol)
    : null,
  catalogClient,
  clearSessionContext() {
    this.syncCoordinator?.stop();
    this.authClient?.signOut();
    this.sessionStore.clear();
    this.clearShopContext();
  },
  clearShopContext() {
    drain?.stop();
    this.syncCoordinator?.stop();
    this.activeShop = null;
    this.pendingCatalogFilter = null;
    platform.removeStorage("mc.activeShopId");
    this.sensitiveCaches.invalidate();
  },
  createCatalogMutationAttempt() {
    return this.catalogClient
      ? new CatalogMutationAttemptController(this.catalogClient, platform, this.outbox, () => {
          if (this.activeShop) {
            void this.syncCoordinator?.syncNow(this.activeShop.shop_id);
          }
        })
      : null;
  },
  featureReady,
  imageClient,
  locale: ((): LocaleKey => {
    const stored = platform.getStorage("mc.locale");
    return stored === "en" || stored === "es" || stored === "it" || stored === "zh-Hans"
      ? stored
      : "zh-Hans";
  })(),
  pendingCatalogFilter: null,
  async requestSignOut() {
    const session = this.sessionStore.load();
    const shopId = this.activeShop?.shop_id;
    if (session && shopId) {
      let scopes: readonly string[] = [shopId];
      let hasPending = true;
      try {
        scopes = [...new Set([shopId, ...this.outbox.scopesForCurrentAccount()])];
        hasPending = scopes.some(
          (id) =>
            this.outbox.pendingForCurrentShop(id).length > 0 ||
            this.imageClient?.hasDurableAttempt(session.accountFingerprint, id) === true,
        );
      } catch {
        /* A corrupt journal is retained and must never prevent logout. */
      }
      if (hasPending) {
        const text = translationsFor(this.locale);
        const retain = await new Promise<boolean>((resolve) => {
          wx.showModal({
            cancelText: text.discardPending,
            confirmText: text.retainPending,
            content: text.pendingSignOutDetail,
            fail: () => resolve(true),
            showCancel: true,
            success: (result) => resolve(result.confirm),
            title: text.pendingSignOutTitle,
          });
        });
        if (!retain) {
          for (const scope of scopes) {
            try {
              this.outbox.discard(session.accountFingerprint, scope);
              await this.imageClient?.discardDurableAttempts(session.accountFingerprint, scope);
            } catch {
              wx.showToast({ icon: "none", title: text.retainPending });
            }
          }
        }
      }
    }
    this.clearSessionContext();
  },
  onLaunch() {
    wx.onNetworkStatusChange(({ isConnected }) => drain?.networkChanged(isConnected));
    wx.getNetworkType({
      success: ({ networkType }) => drain?.networkChanged(networkType !== "none"),
    });
    applyTabLocale(this.locale);
    if (sessionStore.load() === null) this.clearShopContext();
  },
  onShow() {
    appVisible = true;
    if (this.activeShop) {
      drain?.start(this.activeShop.shop_id);
      this.syncCoordinator?.start(this.activeShop.shop_id);
    }
  },
  onHide() {
    appVisible = false;
    drain?.stop();
    this.syncCoordinator?.stop();
  },
  outbox,
  salesClient: http ? new SalesApiClient(http, sessionStore) : null,
  sensitiveCaches,
  selectShop(shop) {
    if (this.activeShop?.shop_id !== shop.shop_id || this.activeShop?.role_key !== shop.role_key) {
      this.sensitiveCaches.invalidate();
    }
    this.activeShop = shop;
    platform.setStorage("mc.activeShopId", shop.shop_id);
    try {
      this.outbox.resumeAuthRequired(shop.shop_id);
    } catch {
      /* Preserve damaged journal for explicit recovery. */
    }
    if (appVisible) drain?.start(shop.shop_id);
    if (appVisible) this.syncCoordinator?.start(shop.shop_id);
  },
  setLocale(locale) {
    this.locale = locale;
    platform.setStorage("mc.locale", locale);
    applyTabLocale(locale);
  },
  sessionStore,
  syncCoordinator,
});
