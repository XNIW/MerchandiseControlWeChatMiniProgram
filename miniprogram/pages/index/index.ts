import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import { AdaptiveRefreshController } from "../../lib/adaptive-refresh";
import { formatCatalogNumber } from "../../lib/catalog-numbers";
import { AuthContractError, type AuthorizedShop } from "../../lib/contracts";
import { HomeSalesReader, HomeSalesReadObsolete } from "../../lib/home-sales-reader";
import { translationsFor } from "../../locales/index";

type ViewState =
  | "disabled"
  | "signed_out"
  | "loading"
  | "shop_retry"
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
interface ShopReadScope {
  readonly generation: number | undefined;
  readonly sessionGeneration: number;
  shopId: string | null;
}
interface HomeRuntime {
  visible?: boolean;
  generation?: number;
  loginAttempt?: number;
  shopRead?: { readonly scope: ShopReadScope; readonly task: Promise<void> };
  shopRecovery?: AdaptiveRefreshController;
}
function runtime(page: unknown): HomeRuntime {
  return page as HomeRuntime;
}

function money(currency: string, value: number): string {
  return `${currency} ${formatCatalogNumber(value)}`;
}

function isAuthoritativeDenial(error: unknown): boolean {
  const code =
    error instanceof AuthContractError ? error.code : error instanceof Error ? error.message : "";
  return [
    "session_expired",
    "account_suspended",
    "membership_missing",
    "shop_suspended",
    "permission_denied",
  ].includes(code);
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
    this.stopShopRecovery();
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
    this.stopShopRecovery();
    this.setData({ text: translationsFor(app.locale) });
    wx.setNavigationBarTitle({ title: this.data.text.home });
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
    this.stopShopRecovery();
    await app.requestSignOut();
    this.clearSignedOutView();
  },
  clearSignedOutView() {
    this.stopAutomaticRefresh();
    this.stopShopRecovery();
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
  bootstrap(): Promise<void> {
    const scope: ShopReadScope = {
      generation: runtime(this).generation,
      sessionGeneration: app.sessionStore.generation,
      shopId: app.activeShop?.shop_id ?? null,
    };
    const held = runtime(this).shopRead;
    if (
      held &&
      held.scope.generation === scope.generation &&
      held.scope.sessionGeneration === scope.sessionGeneration &&
      held.scope.shopId === scope.shopId
    )
      return held.task;
    const task = this.readShops(scope).finally(() => {
      if (runtime(this).shopRead?.scope === scope) delete runtime(this).shopRead;
    });
    runtime(this).shopRead = { scope, task };
    return task;
  },
  async readShops(scope: ShopReadScope) {
    if (!app.salesClient || !runtime(this).visible || app.sessionStore.load() === null) return;
    let cacheGeneration = app.sensitiveCaches.generation;
    let membershipRead = true;
    let obsoleteSummary = false;
    const isScopeCurrent = () =>
      runtime(this).visible === true &&
      runtime(this).generation === scope.generation &&
      runtime(this).shopRead?.scope === scope &&
      app.sessionStore.generation === scope.sessionGeneration &&
      app.sessionStore.load() !== null &&
      (app.activeShop?.shop_id ?? null) === scope.shopId;
    const isCurrent = () => isScopeCurrent() && app.sensitiveCaches.generation === cacheGeneration;
    this.stopAutomaticRefresh();
    this.setData({ errorMessage: "", viewState: "loading" as ViewState });
    try {
      const shops = await app.salesClient.authorizedShops();
      if (!isCurrent()) return;
      membershipRead = false;
      const currentShop =
        shops.find((shop) => shop.shop_id === app.activeShop?.shop_id) ?? shops[0] ?? null;
      if (!currentShop) {
        this.clearSignedOutView();
        app.clearShopContext();
        this.setData({
          errorMessage: this.data.text.unauthorized,
          shops,
          viewState: "unauthorized" as ViewState,
        });
        return;
      }
      app.selectShop(currentShop);
      scope.shopId = currentShop.shop_id;
      cacheGeneration = app.sensitiveCaches.generation;
      this.setData({ currentShop, shops });
      await this.refresh();
      if (isCurrent()) this.startAutomaticRefresh();
    } catch (error) {
      if (error instanceof HomeSalesReadObsolete) obsoleteSummary = true;
      else if (isCurrent() || (membershipRead && isScopeCurrent() && isAuthoritativeDenial(error)))
        this.applyError(error);
    } finally {
      if (
        runtime(this).visible === true &&
        runtime(this).generation === scope.generation &&
        runtime(this).shopRead?.scope === scope &&
        this.data.viewState === "loading"
      ) {
        this.stopAutomaticRefresh();
        if (app.sessionStore.load() === null) this.clearSignedOutView();
        else {
          this.setData({
            errorMessage: this.data.text.error,
            viewState: "shop_retry" as ViewState,
          });
          if (
            isScopeCurrent() &&
            (obsoleteSummary || app.sensitiveCaches.generation !== cacheGeneration)
          )
            this.startShopRecovery();
        }
      }
    }
  },
  async chooseShop(event: WechatMiniprogram.PickerChange) {
    const shop = this.data.shops[Number(event.detail.value)];
    if (!shop) return;
    this.stopShopRecovery();
    app.selectShop(shop);
    this.setData({ currentShop: shop });
    await this.refresh();
  },
  async refresh(force = false) {
    const shop = this.data.currentShop;
    if (!app.featureReady || !shop || !app.salesClient || !runtime(this).visible) return;
    const generation = runtime(this).generation;
    const sessionGeneration = app.sessionStore.generation;
    const cacheGeneration = app.sensitiveCaches.generation;
    const isScopeCurrent = () =>
      runtime(this).visible === true &&
      runtime(this).generation === generation &&
      app.sessionStore.generation === sessionGeneration &&
      app.activeShop?.shop_id === shop.shop_id;
    const isCurrent = () => isScopeCurrent() && app.sensitiveCaches.generation === cacheGeneration;

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
      else if (
        !(error instanceof HomeSalesReadObsolete) &&
        (isCurrent() || (isScopeCurrent() && isAuthoritativeDenial(error)))
      )
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
  openPairing() {
    wx.navigateTo({ url: "/pages/pairing/index" });
  },
  startAutomaticRefresh() {
    this.stopAutomaticRefresh();
    if (
      !runtime(this).visible ||
      !app.activeShop ||
      app.sessionStore.load() === null ||
      this.data.viewState === "loading" ||
      this.data.viewState === "shop_retry"
    )
      return;
    this.stopShopRecovery();
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
  startShopRecovery() {
    if (runtime(this).shopRecovery || !app.activeShop) return;
    const generation = runtime(this).generation;
    const sessionGeneration = app.sessionStore.generation;
    const shopId = app.activeShop.shop_id;
    const isCurrent = () =>
      runtime(this).visible === true &&
      runtime(this).generation === generation &&
      app.sessionStore.generation === sessionGeneration &&
      app.sessionStore.load() !== null &&
      app.activeShop?.shop_id === shopId;
    if (!isCurrent()) return;
    const controller = new AdaptiveRefreshController({
      baseDelayMilliseconds: runtimeConfig.autoRefreshMilliseconds,
      maximumDelayMilliseconds: runtimeConfig.autoRefreshMaximumMilliseconds,
      refresh: async () => {
        if (runtime(this).shopRecovery !== controller) return;
        if (!isCurrent()) {
          this.stopShopRecovery();
          return;
        }
        await this.bootstrap();
        if (runtime(this).shopRecovery !== controller) return;
        if (isCurrent() && this.data.viewState === "shop_retry") throw new Error("cache_changed");
        this.stopShopRecovery();
      },
    });
    runtime(this).shopRecovery = controller;
    controller.start();
  },
  stopShopRecovery() {
    runtime(this).shopRecovery?.stop();
    delete runtime(this).shopRecovery;
  },
  applyError(error: unknown) {
    this.stopShopRecovery();
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
      const signedOut = app.sessionStore.load() === null;
      if (signedOut) this.clearSignedOutView();
      this.setData({
        errorMessage: this.data.text.offline,
        viewState: (signedOut ? "signed_out" : "offline") as ViewState,
      });
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
    if (
      code === "membership_missing" ||
      code === "account_suspended" ||
      code === "shop_suspended" ||
      code === "permission_denied"
    ) {
      if (code === "account_suspended") app.clearSessionContext();
      else app.clearShopContext();
      this.setData({
        errorMessage: this.data.text.unauthorized,
        viewState: "unauthorized" as ViewState,
      });
      return;
    }
    const signedOut = app.sessionStore.load() === null;
    if (signedOut) this.clearSignedOutView();
    this.setData({
      errorMessage: this.data.text.error,
      viewState: (signedOut ? "signed_out" : "error") as ViewState,
    });
  },
});
