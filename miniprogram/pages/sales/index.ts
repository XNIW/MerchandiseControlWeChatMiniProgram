import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import { AdaptiveRefreshController } from "../../lib/adaptive-refresh";
import type { DailySale, DailySalesSummary, SalesFilterEntity } from "../../lib/contracts";
import { resolveSalesRange, type SalesRangeKey, shiftDate } from "../../lib/date-ranges";
import { SessionBoundedCache } from "../../lib/sensitive-cache";
import { translationsFor } from "../../locales/index";

const app = getApp<MerchandiseControlApp>();
const pageCache = new SessionBoundedCache<{
  days: readonly DailySalesSummary[];
  sales: readonly DailySale[];
}>(4, app.sessionStore);
app.sensitiveCaches.register(pageCache, ["sales"]);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function total(
  days: readonly DailySalesSummary[],
  field: "gross_sales_clp" | "net_revenue_clp" | "refunds_clp",
): number {
  return days.reduce((sum, day) => sum + day[field], 0);
}

Page({
  data: {
    anchorDate: today(),
    days: [] as readonly DailySalesSummary[],
    deviceIndex: 0,
    deviceOptions: [] as readonly SalesFilterEntity[],
    errorMessage: "",
    featureReady: app.featureReady,
    from: today(),
    gross: "—",
    kindIndex: 0,
    kinds: ["", "sale", "refund", "void"],
    loading: false,
    net: "—",
    paymentIndex: 0,
    paymentMethods: [""],
    range: "day" as SalesRangeKey,
    refunds: "—",
    saleNumber: "",
    saleCount: 0,
    sales: [] as readonly DailySale[],
    staffIndex: 0,
    staffOptions: [] as readonly SalesFilterEntity[],
    statusIndex: 0,
    statuses: ["", "accepted", "duplicate", "conflict", "rejected"],
    text: translationsFor(app.locale),
    timeZone: "",
    to: today(),
  },
  onPullDownRefresh() {
    if (!app.featureReady) {
      wx.stopPullDownRefresh();
      return;
    }
    void this.refresh(true).finally(() => wx.stopPullDownRefresh());
  },
  onShow() {
    this.stopAutomaticRefresh();
    this.setData({ text: translationsFor(app.locale) });
    if (!app.featureReady) return;
    void this.refreshFilters().finally(async () => {
      await this.refresh(false);
      if (app.sessionStore.load() !== null && app.salesClient) this.startAutomaticRefresh();
    });
  },
  onHide() {
    this.stopAutomaticRefresh();
  },
  onUnload() {
    this.stopAutomaticRefresh();
  },
  chooseDate(event: WechatMiniprogram.PickerChange) {
    const date = String(event.detail.value);
    this.setData({ anchorDate: date, range: "day" as SalesRangeKey });
    void this.applyRange("day", date);
  },
  previousDay() {
    const date = shiftDate(this.data.anchorDate, -1);
    this.setData({ anchorDate: date });
    void this.applyRange("day", date);
  },
  nextDay() {
    const date = shiftDate(this.data.anchorDate, 1);
    this.setData({ anchorDate: date });
    void this.applyRange("day", date);
  },
  selectRange(event: WechatMiniprogram.BaseEvent) {
    const range = String(event.currentTarget.dataset.range) as SalesRangeKey;
    void this.applyRange(range, this.data.anchorDate);
  },
  chooseKind(event: WechatMiniprogram.PickerChange) {
    this.setData({ kindIndex: Number(event.detail.value), sales: [] });
    void this.refresh(true);
  },
  chooseStatus(event: WechatMiniprogram.PickerChange) {
    this.setData({ sales: [], statusIndex: Number(event.detail.value) });
    void this.refresh(true);
  },
  choosePayment(event: WechatMiniprogram.PickerChange) {
    this.setData({ paymentIndex: Number(event.detail.value), sales: [] });
    void this.refresh(true);
  },
  chooseStaff(event: WechatMiniprogram.PickerChange) {
    this.setData({ sales: [], staffIndex: Number(event.detail.value) });
    void this.refresh(true);
  },
  chooseDevice(event: WechatMiniprogram.PickerChange) {
    this.setData({ deviceIndex: Number(event.detail.value), sales: [] });
    void this.refresh(true);
  },
  searchSale(event: WechatMiniprogram.Input) {
    this.setData({ saleNumber: event.detail.value });
    const holder = this as unknown as { searchTimer?: number };
    if (holder.searchTimer !== undefined) clearTimeout(holder.searchTimer);
    holder.searchTimer = setTimeout(() => void this.refresh(true), 350);
  },
  async applyRange(range: SalesRangeKey, anchor: string) {
    const dates = resolveSalesRange(anchor, range);
    this.setData({ ...dates, range, sales: [] });
    await this.refreshFilters();
    await this.refresh(true);
  },
  async ensureShop() {
    if (!app.featureReady) return null;
    if (app.sessionStore.load() === null) {
      app.clearSessionContext();
      this.setData({
        days: [],
        errorMessage: this.data.text.sessionExpired,
        gross: "—",
        net: "—",
        refunds: "—",
        saleCount: 0,
        sales: [],
      });
      return null;
    }
    if (app.activeShop || !app.salesClient) return app.activeShop;
    const shops = await app.salesClient.authorizedShops();
    const shop = shops[0] ?? null;
    if (shop) app.selectShop(shop);
    return shop;
  },
  async refreshFilters() {
    const shop = await this.ensureShop();
    if (!shop || !app.salesClient) return;
    const cacheGeneration = app.sensitiveCaches.generation;
    try {
      const filters = await app.salesClient.salesFilterOptions(
        shop.shop_id,
        this.data.from,
        this.data.to,
      );
      if (
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.sessionStore.load() === null ||
        app.activeShop?.shop_id !== shop.shop_id
      ) {
        return;
      }
      this.setData({
        deviceIndex: 0,
        deviceOptions: filters?.devices.length
          ? [{ id: "", name: this.data.text.all }, ...filters.devices]
          : [],
        paymentIndex: 0,
        paymentMethods: ["", ...(filters?.payment_methods ?? [])],
        staffIndex: 0,
        staffOptions: filters?.staff.length
          ? [{ id: "", name: this.data.text.all }, ...filters.staff]
          : [],
      });
    } catch {
      if (app.sensitiveCaches.generation !== cacheGeneration) return;
      this.setData({ deviceOptions: [], paymentMethods: [""], staffOptions: [] });
    }
  },
  async refresh(force: boolean): Promise<boolean> {
    const sequence = ((this as unknown as { requestSequence?: number }).requestSequence ?? 0) + 1;
    (this as unknown as { requestSequence: number }).requestSequence = sequence;
    const shop = await this.ensureShop();
    if (
      !shop ||
      !app.salesClient ||
      (this as unknown as { requestSequence: number }).requestSequence !== sequence
    ) {
      return false;
    }
    const cacheGeneration = app.sensitiveCaches.generation;
    const cacheKey = [
      shop.shop_id,
      shop.role_key,
      this.data.from,
      this.data.to,
      this.data.kindIndex,
      this.data.statusIndex,
      this.data.paymentIndex,
      this.data.staffOptions[this.data.staffIndex]?.id ?? "",
      this.data.deviceOptions[this.data.deviceIndex]?.id ?? "",
      this.data.saleNumber,
    ].join(":");
    const cached = force ? undefined : pageCache.get(cacheKey);
    if (cached) {
      if (
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.sessionStore.load() === null ||
        app.activeShop?.shop_id !== shop.shop_id
      ) {
        return false;
      }
      this.applyResult(cached.days, cached.sales, shop.currency_code);
      return true;
    }
    this.setData({ errorMessage: "", loading: true });
    try {
      const [days, sales] = await Promise.all([
        app.salesClient.periodSummary(shop.shop_id, this.data.from, this.data.to),
        app.salesClient.salesPage(shop.shop_id, {
          from: this.data.from,
          ...(this.data.kinds[this.data.kindIndex]
            ? { kind: this.data.kinds[this.data.kindIndex] }
            : {}),
          limit: 50,
          ...(this.data.paymentMethods[this.data.paymentIndex]
            ? { paymentMethod: this.data.paymentMethods[this.data.paymentIndex] }
            : {}),
          ...(this.data.saleNumber ? { saleNumber: this.data.saleNumber } : {}),
          ...(this.data.staffOptions[this.data.staffIndex]?.id
            ? { staffId: this.data.staffOptions[this.data.staffIndex]?.id ?? "" }
            : {}),
          ...(this.data.statuses[this.data.statusIndex]
            ? { status: this.data.statuses[this.data.statusIndex] }
            : {}),
          ...(this.data.deviceOptions[this.data.deviceIndex]?.id
            ? { deviceId: this.data.deviceOptions[this.data.deviceIndex]?.id ?? "" }
            : {}),
          to: this.data.to,
        }),
      ]);
      if (
        (this as unknown as { requestSequence: number }).requestSequence !== sequence ||
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.sessionStore.load() === null ||
        app.activeShop?.shop_id !== shop.shop_id
      ) {
        return false;
      }
      pageCache.set(cacheKey, { days, sales });
      this.applyResult(days, sales, shop.currency_code);
      return true;
    } catch {
      if (
        (this as unknown as { requestSequence: number }).requestSequence !== sequence ||
        app.sensitiveCaches.generation !== cacheGeneration
      ) {
        return false;
      }
      this.setData({ errorMessage: this.data.text.offline });
      return false;
    } finally {
      if ((this as unknown as { requestSequence: number }).requestSequence === sequence) {
        this.setData({ loading: false });
      }
    }
  },
  startAutomaticRefresh() {
    this.stopAutomaticRefresh();
    const controller = new AdaptiveRefreshController({
      baseDelayMilliseconds: runtimeConfig.autoRefreshMilliseconds,
      maximumDelayMilliseconds: runtimeConfig.autoRefreshMaximumMilliseconds,
      refresh: async () => {
        if (!(await this.refresh(true))) throw new Error("sales_refresh_failed");
      },
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
  applyResult(days: readonly DailySalesSummary[], sales: readonly DailySale[], currency: string) {
    const format = (value: number) => `${currency} ${value.toLocaleString("zh-CN")}`;
    this.setData({
      days,
      gross: format(total(days, "gross_sales_clp")),
      net: format(total(days, "net_revenue_clp")),
      refunds: format(total(days, "refunds_clp")),
      saleCount: days.reduce((sum, day) => sum + day.sale_count, 0),
      sales,
      timeZone: app.activeShop?.time_zone ?? "",
    });
  },
  async loadMore() {
    const shop = app.activeShop;
    const last = this.data.sales[this.data.sales.length - 1];
    if (!shop || !last || !app.salesClient || app.sessionStore.load() === null) return;
    const cacheGeneration = app.sensitiveCaches.generation;
    const next = await app.salesClient.salesPage(shop.shop_id, {
      beforeAt: last.occurred_at,
      beforeId: last.pos_sale_id,
      from: this.data.from,
      ...(this.data.kinds[this.data.kindIndex]
        ? { kind: this.data.kinds[this.data.kindIndex] }
        : {}),
      limit: 50,
      ...(this.data.paymentMethods[this.data.paymentIndex]
        ? { paymentMethod: this.data.paymentMethods[this.data.paymentIndex] }
        : {}),
      ...(this.data.saleNumber ? { saleNumber: this.data.saleNumber } : {}),
      ...(this.data.staffOptions[this.data.staffIndex]?.id
        ? { staffId: this.data.staffOptions[this.data.staffIndex]?.id ?? "" }
        : {}),
      ...(this.data.statuses[this.data.statusIndex]
        ? { status: this.data.statuses[this.data.statusIndex] }
        : {}),
      ...(this.data.deviceOptions[this.data.deviceIndex]?.id
        ? { deviceId: this.data.deviceOptions[this.data.deviceIndex]?.id ?? "" }
        : {}),
      to: this.data.to,
    });
    if (
      app.sensitiveCaches.generation !== cacheGeneration ||
      app.sessionStore.load() === null ||
      app.activeShop?.shop_id !== shop.shop_id
    ) {
      return;
    }
    const ids = new Set(this.data.sales.map((sale) => sale.pos_sale_id));
    this.setData({
      sales: [...this.data.sales, ...next.filter((sale) => !ids.has(sale.pos_sale_id))],
    });
  },
  openDetail(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({
      url: `/pages/sale-detail/index?id=${encodeURIComponent(String(event.currentTarget.dataset.id))}`,
    });
  },
});
