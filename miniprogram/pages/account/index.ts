import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import type { AccountProfile, AuthorizedShop } from "../../lib/contracts";
import type { CatalogOutboxEntry } from "../../lib/durable-catalog-outbox";
import { type LocaleKey, translationsFor } from "../../locales/index";
import { mutationErrorTranslationKey } from "../catalog-management";

const app = getApp<MerchandiseControlApp>();
const locales: readonly LocaleKey[] = ["zh-Hans", "en", "es", "it"];

interface AccountRequestContext {
  readonly cacheGeneration: number;
  readonly requestGeneration: number;
  readonly sessionGeneration: number;
  readonly shopId: string | null;
}

let accountRequestGeneration = 0;
let unsubscribeOutbox: (() => void) | undefined;

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
    enrollmentReady: runtimeConfig.miniEnrollmentEnabled === true,
    pending: [] as readonly (CatalogOutboxEntry & { label: string; stateLabel: string })[],
    outboxError: "",
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
      pending: [],
      outboxError: "",
      account: null,
      currentShop: null,
      loading: false,
      providersText: "—",
      shops: [],
      text: translationsFor(app.locale),
    });
    if (!app.featureReady) return;
    unsubscribeOutbox?.();
    unsubscribeOutbox = app.outbox?.subscribe(() => this.refreshPending());
    this.refreshPending();
    if (!app.featureReady) return;
    void this.load();
  },
  onHide() {
    unsubscribeOutbox?.();
    unsubscribeOutbox = undefined;
  },
  onUnload() {
    this.onHide();
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
      this.refreshPending();
      this.setData({
        account,
        currentShop,
        providersText:
          (account
            ? [...account.providers, ...(account.mini_identity_linked ? ["wechat-mini"] : [])].join(
                ", ",
              )
            : "") || "—",
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
    this.refreshPending();
  },
  chooseLocale(event: WechatMiniprogram.PickerChange) {
    const locale = locales[Number(event.detail.value)] ?? "zh-Hans";
    app.setLocale(locale);
    this.setData({ localeIndex: Number(event.detail.value), text: translationsFor(locale) });
  },
  refreshPending() {
    if (!app.sessionStore.load() || !app.activeShop || !app.outbox) {
      this.setData({ pending: [], outboxError: "" });
      return;
    }
    const text = this.data.text;
    try {
      const pending = app.outbox.pendingForCurrentShop(app.activeShop.shop_id).map((e) => ({
        ...e,
        label:
          "productName" in e.payload && typeof e.payload.productName === "string"
            ? e.payload.productName
            : "name" in e.payload && typeof e.payload.name === "string"
              ? e.payload.name
              : text[e.entityType],
        stateLabel:
          e.state === "failed_terminal" && e.attempts >= 8
            ? text.retryExhausted
            : e.errorCode
              ? text[mutationErrorTranslationKey(e.errorCode)]
              : e.state === "sending"
                ? text.saving
                : text.pendingChanges,
      }));
      this.setData({
        pending,
        outboxError: app.outbox.storageUnavailableForShop(app.activeShop.shop_id)
          ? text.retryableError
          : "",
      });
    } catch {
      this.setData({ pending: [], outboxError: text.outboxDamaged });
    }
  },
  async discardPending(event: WechatMiniprogram.BaseEvent) {
    const shop = app.activeShop;
    const session = app.sessionStore.load();
    const generation = app.sessionStore.generation;
    if (!shop || !session) return;
    const confirmation = await wx.showModal({
      title: this.data.text.pendingChanges,
      content: this.data.text.discardOperationConfirm,
      confirmText: this.data.text.discardPending,
      cancelText: this.data.text.cancel,
    });
    if (
      !confirmation.confirm ||
      generation !== app.sessionStore.generation ||
      shop.shop_id !== app.activeShop?.shop_id
    )
      return;
    try {
      const id = String(event.currentTarget.dataset.id || "");
      if (id) app.outbox.discardOperation(shop.shop_id, id);
      else app.outbox.discard(session.accountFingerprint, shop.shop_id);
      this.refreshPending();
    } catch {
      this.setData({ outboxError: this.data.text.retryableError });
    }
  },
  async retryPending(event: WechatMiniprogram.BaseEvent) {
    const shop = app.activeShop,
      generation = app.sessionStore.generation;
    if (!shop) return;
    const confirmation = await wx.showModal({
      title: this.data.text.retryExhausted,
      content: this.data.text.retryableError,
      confirmText: this.data.text.retry,
      cancelText: this.data.text.cancel,
    });
    if (
      !confirmation.confirm ||
      generation !== app.sessionStore.generation ||
      shop.shop_id !== app.activeShop?.shop_id
    )
      return;
    try {
      app.outbox.retryExhausted(shop.shop_id, String(event.currentTarget.dataset.id));
      this.refreshPending();
    } catch {
      this.setData({ outboxError: this.data.text.retryableError });
    }
  },
  async recoverPending() {
    const shop = app.activeShop;
    if (!shop) return;
    const generation = app.sessionStore.generation;
    const confirmation = await wx.showModal({
      title: this.data.text.pendingChanges,
      content: this.data.text.recoverChanges,
      confirmText: this.data.text.retry,
      cancelText: this.data.text.cancel,
    });
    if (
      !confirmation.confirm ||
      generation !== app.sessionStore.generation ||
      shop.shop_id !== app.activeShop?.shop_id
    )
      return;
    try {
      app.outbox.recover(shop.shop_id);
      this.refreshPending();
    } catch {
      this.setData({ outboxError: this.data.text.outboxDamaged });
    }
  },
  openPairing() {
    wx.navigateTo({ url: "/pages/pairing/index" });
  },
  openPrivacy() {
    wx.navigateTo({ url: "/pages/privacy/index" });
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
