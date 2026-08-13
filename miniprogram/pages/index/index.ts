import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import { AdaptiveRefreshController } from "../../lib/adaptive-refresh";
import { AuthContractError, type AuthorizedShop } from "../../lib/contracts";
import { shiftDate } from "../../lib/date-ranges";
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
  | "unauthorized"
  | "session_expired";
const app = getApp<MerchandiseControlApp>();

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
    this.stopAutomaticRefresh();
  },
  onPullDownRefresh() {
    void this.refresh().finally(() => wx.stopPullDownRefresh());
  },
  onShow() {
    this.setData({ text: translationsFor(app.locale) });
    if (!app.featureReady) return;
    if (app.sessionStore.load() !== null) void this.bootstrap();
  },
  onUnload() {
    this.stopAutomaticRefresh();
  },

  async signIn() {
    if (!app.authClient || !app.salesClient) return;
    this.setData({ errorMessage: "", viewState: "loading" as ViewState });
    try {
      await app.authClient.signIn();
      await this.bootstrap();
    } catch (error) {
      this.applyError(error);
    }
  },
  async signOut() {
    this.stopAutomaticRefresh();
    await app.requestSignOut();
    this.setData({ currentShop: null, shops: [], viewState: "signed_out" as ViewState });
  },
  async bootstrap() {
    if (!app.salesClient) return;
    this.setData({ viewState: "loading" as ViewState });
    try {
      const shops = await app.salesClient.authorizedShops();
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
  async refresh() {
    const shop = this.data.currentShop;
    if (!shop || !app.salesClient) return;
    try {
      const summary = await app.salesClient.dailySummary(shop.shop_id);
      if (!summary) {
        this.setData({
          errorMessage: this.data.text.unauthorized,
          viewState: "unauthorized" as ViewState,
        });
        return;
      }
      const previousDate = shiftDate(summary.business_date, -1);
      const [previous, sales] = await Promise.all([
        app.salesClient.dailySummary(shop.shop_id, previousDate),
        app.salesClient.dailySalesPage(shop.shop_id, { date: summary.business_date, limit: 1 }),
      ]);
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
      this.applyError(error);
      throw error;
    }
  },
  openSales() {
    wx.switchTab({ url: "/pages/sales/index" });
  },
  openDatabase() {
    wx.switchTab({ url: "/pages/database/index" });
  },
  startAutomaticRefresh() {
    this.stopAutomaticRefresh();
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
