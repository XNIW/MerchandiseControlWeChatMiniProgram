import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import { AdaptiveRefreshController } from "../../lib/adaptive-refresh";
import { AuthContractError, type AuthorizedShop } from "../../lib/contracts";
import { HomeSalesReader } from "../../lib/home-sales-reader";
import { translationsFor } from "../../locales/index";

type ViewState =
  | "disabled"
  | "signed_out"
  | "loading"
  | "ready"
  | "empty"
  | "offline"
  | "error"
  | "link_required"
  | "enrollment_required"
  | "unauthorized"
  | "session_expired";
const app = getApp<MerchandiseControlApp>();
const homeReader = new HomeSalesReader();
app.sensitiveCaches.register(homeReader, ["sales"]);
interface HomeRuntime {
  visible?: boolean;
  generation?: number;
  loginAttempt?: number;
}
function runtime(page: unknown): HomeRuntime {
  return page as HomeRuntime;
}

function money(currency: string, value: number): string {
  return `${currency} ${value.toLocaleString("zh-CN")}`;
}

Page({
  data: {
    averageSale: "—",
    comparison: "—",
    currentShop: null as AuthorizedShop | null,
    errorMessage: "",
    featureReady: app.featureReady,
    grossRevenue: "—",
    lastUpdated: "—",
    latestSale: "—",
    netRevenue: "—",
    refunds: "—",
    saleCount: 0,
    shops: [] as readonly AuthorizedShop[],
    text: translationsFor(app.locale),
    voidCount: 0,
    viewState: (app.featureReady ? "signed_out" : "disabled") as ViewState,
  },

  onHide() {
    runtime(this).visible = false;
    runtime(this).generation = (runtime(this).generation ?? 0) + 1;
    this.stopAutomaticRefresh();
  },
  onPullDownRefresh() {
    void this.refresh(true)
      .catch(() => undefined)
      .finally(() => wx.stopPullDownRefresh());
  },
  onShow() {
    runtime(this).visible = true;
    runtime(this).generation = (runtime(this).generation ?? 0) + 1;
    this.stopAutomaticRefresh();
    this.setData({ text: translationsFor(app.locale) });
    if (!app.featureReady) return;
    if (app.sessionStore.load() !== null) {
      void this.bootstrap();
    } else {
      this.clearSignedOutView();
    }
  },
  onUnload() {
    this.onHide();
    homeReader.clear();
    this.stopAutomaticRefresh();
  },

  async signIn() {
    if (!app.authClient || !app.salesClient) return;
    const attempt = (runtime(this).loginAttempt ?? 0) + 1;
    runtime(this).loginAttempt = attempt;
    const generation = runtime(this).generation;
    let sessionGeneration = app.sessionStore.generation;
    const isCurrent = () =>
      runtime(this).visible === true &&
      runtime(this).generation === generation &&
      runtime(this).loginAttempt === attempt;
    this.setData({ errorMessage: "", viewState: "loading" as ViewState });
    try {
      const handoff = await app.authClient.signIn();
      if (!isCurrent() || app.sessionStore.load()?.sessionToken !== handoff.sessionToken) return;
      sessionGeneration = app.sessionStore.generation;
      await this.bootstrap();
    } catch (error) {
      if (isCurrent() && app.sessionStore.generation === sessionGeneration) this.applyError(error);
    }
  },
  async signOut() {
    runtime(this).loginAttempt = (runtime(this).loginAttempt ?? 0) + 1;
    this.stopAutomaticRefresh();
    await app.requestSignOut();
    this.clearSignedOutView();
  },
  clearSignedOutView() {
    this.stopAutomaticRefresh();
    runtime(this).generation = (runtime(this).generation ?? 0) + 1;
    homeReader.clear();
    this.setData({
      averageSale: "—",
      comparison: "—",
      currentShop: null,
      errorMessage: "",
      grossRevenue: "—",
      lastUpdated: "—",
      latestSale: "—",
      netRevenue: "—",
      refunds: "—",
      saleCount: 0,
      shops: [],
      voidCount: 0,
      viewState: "signed_out" as ViewState,
    });
  },
  async bootstrap() {
    if (!app.salesClient) return;
    const generation = runtime(this).generation;
    const sessionGeneration = app.sessionStore.generation;
    this.setData({ viewState: "loading" as ViewState });
    try {
      const shops = await app.salesClient.authorizedShops();
      if (
        !runtime(this).visible ||
        runtime(this).generation !== generation ||
        app.sessionStore.generation !== sessionGeneration
      )
        return;
      const currentShop =
        shops.find((shop) => shop.shop_id === app.activeShop?.shop_id) ?? shops[0] ?? null;
      if (!currentShop) {
        this.setData({
          errorMessage: this.data.text.unauthorized,
          shops,
          viewState: "unauthorized" as ViewState,
        });
        return;
      }
      app.selectShop(currentShop);
      this.setData({ currentShop, shops });
      await this.refresh();
      this.startAutomaticRefresh();
    } catch (error) {
      if (
        runtime(this).visible === true &&
        runtime(this).generation === generation &&
        app.sessionStore.generation === sessionGeneration
      )
        this.applyError(error);
    }
  },
  async chooseShop(event: WechatMiniprogram.PickerChange) {
    const shop = this.data.shops[Number(event.detail.value)];
    if (!shop) return;
    app.selectShop(shop);
    this.setData({ currentShop: shop });
    await this.refresh();
  },
  async refresh(force = false) {
    const shop = this.data.currentShop;
    if (!app.featureReady || !shop || !app.salesClient || !runtime(this).visible) return;
    const generation = runtime(this).generation;
    const sessionGeneration = app.sessionStore.generation;
    const isCurrent = () =>
      runtime(this).visible === true &&
      runtime(this).generation === generation &&
      app.sessionStore.generation === sessionGeneration &&
      app.activeShop?.shop_id === shop.shop_id;

    try {
      const { summary, previous, sales } = await homeReader.read(
        app.salesClient,
        shop.shop_id,
        String(sessionGeneration),
        Date.now(),
        force,
        isCurrent,
      );
      if (!isCurrent()) return;
      const average =
        summary.sale_count > 0 ? Math.round(summary.net_revenue_clp / summary.sale_count) : 0;
      const difference =
        previous && previous.net_revenue_clp !== 0
          ? `${(((summary.net_revenue_clp - previous.net_revenue_clp) / Math.abs(previous.net_revenue_clp)) * 100).toFixed(1)}%`
          : "—";
      this.setData({
        averageSale: money(shop.currency_code, average),
        comparison: difference,
        grossRevenue: money(shop.currency_code, summary.gross_sales_clp),
        lastUpdated: `${summary.server_time} · ${shop.time_zone}`,
        latestSale: sales[0]?.occurred_at ?? "—",
        netRevenue: money(shop.currency_code, summary.net_revenue_clp),
        refunds: money(shop.currency_code, summary.refunds_clp),
        saleCount: summary.sale_count,
        voidCount: summary.void_count,
        viewState: (summary.transaction_count === 0 ? "empty" : "ready") as ViewState,
      });
    } catch (error) {
      if (
        runtime(this).visible &&
        runtime(this).generation === generation &&
        app.sessionStore.load() === null
      )
        this.clearSignedOutView();
      else if (isCurrent()) this.applyError(error);
      throw error;
    }
  },
  openSales() {
    wx.switchTab({ url: "/pages/sales/index" });
  },
  openDatabase() {
    wx.switchTab({ url: "/pages/database/index" });
  },
  openPairing() {
    wx.navigateTo({ url: "/pages/pairing/index" });
  },
  startAutomaticRefresh() {
    this.stopAutomaticRefresh();
    if (!runtime(this).visible || !app.activeShop || app.sessionStore.load() === null) return;
    const controller = new AdaptiveRefreshController({
      baseDelayMilliseconds: runtimeConfig.autoRefreshMilliseconds,
      maximumDelayMilliseconds: runtimeConfig.autoRefreshMaximumMilliseconds,
      refresh: () => this.refresh(),
    });
    (this as unknown as { refreshController?: AdaptiveRefreshController }).refreshController =
      controller;
    controller.start();
  },
  stopAutomaticRefresh() {
    const holder = this as unknown as { refreshController?: AdaptiveRefreshController };
    holder.refreshController?.stop();
    delete holder.refreshController;
  },
  applyError(error: unknown) {
    const code =
      error instanceof AuthContractError ? error.code : error instanceof Error ? error.message : "";
    if (code === "enrollment_required") {
      this.setData({
        errorMessage: this.data.text.enrollmentRequired,
        viewState: "enrollment_required" as ViewState,
      });
      return;
    }
    if (code === "offline") {
      this.setData({ errorMessage: this.data.text.offline, viewState: "offline" as ViewState });
      return;
    }
    if (code === "session_expired") {
      app.clearSessionContext();
      this.setData({
        errorMessage: this.data.text.sessionExpired,
        viewState: "session_expired" as ViewState,
      });
      return;
    }
    if (code === "identity_conflict" || code === "identity_already_linked") {
      this.setData({
        errorMessage: this.data.text.linkRequired,
        viewState: "link_required" as ViewState,
      });
      return;
    }
    if (code === "membership_missing" || code === "account_suspended") {
      if (code === "account_suspended") app.clearSessionContext();
      else app.clearShopContext();
      this.setData({
        errorMessage: this.data.text.unauthorized,
        viewState: "unauthorized" as ViewState,
      });
      return;
    }
    this.setData({ errorMessage: this.data.text.error, viewState: "error" as ViewState });
  },
});
