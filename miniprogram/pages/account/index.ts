import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import type { AccountProfile, AuthorizedShop } from "../../lib/contracts";
import { type LocaleKey, translationsFor } from "../../locales/index";

const app = getApp<MerchandiseControlApp>();
const locales: readonly LocaleKey[] = ["zh-Hans", "en", "es", "it"];

interface AccountRequestContext {
  readonly cacheGeneration: number;
  readonly requestGeneration: number;
  readonly sessionGeneration: number;
  readonly shopId: string | null;
}

let accountRequestGeneration = 0;

function isAccountRequestCurrent(context: AccountRequestContext): boolean {
  const activeSession = app.sessionStore.load();
  return (
    activeSession !== null &&
    accountRequestGeneration === context.requestGeneration &&
    app.sessionStore.generation === context.sessionGeneration &&
    app.sensitiveCaches.generation === context.cacheGeneration &&
    (app.activeShop?.shop_id ?? null) === context.shopId
  );
}

Page({
  data: {
    account: null as AccountProfile | null,
    currentShop: null as AuthorizedShop | null,
    featureReady: app.featureReady,
    localeIndex: Math.max(0, locales.indexOf(app.locale)),
    locales,
    loading: true,
    providersText: "—",
    shops: [] as readonly AuthorizedShop[],
    text: translationsFor(app.locale),
  },
  onShow() {
    accountRequestGeneration += 1;
    this.setData({
      account: null,
      currentShop: null,
      loading: false,
      providersText: "—",
      shops: [],
      text: translationsFor(app.locale),
    });
    if (!app.featureReady) return;
    void this.load();
  },
  onUnload() {
    accountRequestGeneration += 1;
  },
  async load() {
    if (!app.featureReady) return;
    const salesClient = app.salesClient;
    const session = app.sessionStore.load();
    if (this.data.loading || !salesClient || session === null) return;
    accountRequestGeneration += 1;
    const context: AccountRequestContext = {
      cacheGeneration: app.sensitiveCaches.generation,
      requestGeneration: accountRequestGeneration,
      sessionGeneration: app.sessionStore.generation,
      shopId: app.activeShop?.shop_id ?? null,
    };
    this.setData({ loading: true });
    try {
      const [account, shops] = await Promise.all([
        salesClient.account(),
        salesClient.authorizedShops(),
      ]);
      if (!isAccountRequestCurrent(context)) return;
      const currentShop =
        shops.find((shop) => shop.shop_id === app.activeShop?.shop_id) ?? shops[0] ?? null;
      if (currentShop) app.selectShop(currentShop);
      this.setData({
        account,
        currentShop,
        providersText: account?.providers.join(", ") || "—",
        shops,
      });
    } catch {
      if (isAccountRequestCurrent(context)) {
        this.setData({ account: null, currentShop: null, providersText: "—", shops: [] });
      }
    } finally {
      if (accountRequestGeneration === context.requestGeneration) {
        this.setData({ loading: false });
      }
    }
  },
  chooseShop(event: WechatMiniprogram.PickerChange) {
    const shop = this.data.shops[Number(event.detail.value)];
    if (!shop) return;
    accountRequestGeneration += 1;
    app.selectShop(shop);
    this.setData({ currentShop: shop });
  },
  chooseLocale(event: WechatMiniprogram.PickerChange) {
    const locale = locales[Number(event.detail.value)] ?? "zh-Hans";
    app.setLocale(locale);
    this.setData({ localeIndex: Number(event.detail.value), text: translationsFor(locale) });
  },
  openPrivacy() {
    if (runtimeConfig.privacyUrl.includes("example.invalid")) {
      wx.showToast({ icon: "none", title: this.data.text.disabledTitle });
      return;
    }
    wx.navigateTo({
      url: `/pages/webview/index?url=${encodeURIComponent(runtimeConfig.privacyUrl)}`,
    });
  },
  async signOut() {
    accountRequestGeneration += 1;
    await app.requestSignOut();
    this.setData({
      account: null,
      currentShop: null,
      loading: false,
      providersText: "—",
      shops: [],
    });
    wx.switchTab({ url: "/pages/index/index" });
  },
});
