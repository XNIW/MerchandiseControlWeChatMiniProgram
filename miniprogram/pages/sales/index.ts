import type { MerchandiseControlApp } from "../../app";
import { runtimeConfig } from "../../config/runtime-config";
import { AdaptiveRefreshController } from "../../lib/adaptive-refresh";
import { formatCatalogNumber } from "../../lib/catalog-numbers";
import type { DailySale, DailySalesSummary, SalesFilterEntity } from "../../lib/contracts";
import { resolveSalesRange, type SalesRangeKey, shiftDate } from "../../lib/date-ranges";
import { SessionBoundedCache } from "../../lib/sensitive-cache";
import { translationsFor } from "../../locales/index";
import { readErrorTranslationKey } from "../catalog-management";
import { salesCodeLabel } from "../sales-labels";

const app = getApp<MerchandiseControlApp>();
interface SalesRuntime {
  visible?: boolean;
  lifecycle?: number;
  businessDate?: string;
  dateShop?: string;
  businessSequence?: number;
  filterSequence?: number;
  loadedScope?: string | undefined;
}
function runtime(page: unknown): SalesRuntime {
  return page as SalesRuntime;
}
function currentResultScope(): string | undefined {
  const shop = app.activeShop;
  if (!shop || app.sessionStore.load() === null) return undefined;
  return [
    app.sessionStore.generation,
    app.sensitiveCaches.generation,
    shop.shop_id,
    shop.role_key,
  ].join(":");
}
const pageCache = new SessionBoundedCache<{
  days: readonly DailySalesSummary[];
  sales: readonly DailySale[];
  hasMore: boolean;
}>(4, app.sessionStore);
app.sensitiveCaches.register(pageCache, ["sales"]);

function total(
  days: readonly DailySalesSummary[],
  field: "gross_sales_clp" | "net_revenue_clp" | "refunds_clp",
): number {
  return days.reduce((sum, day) => sum + day[field], 0);
}

Page({
  data: {
    anchorDate: "",
    days: [] as readonly (DailySalesSummary & {
      grossText: string;
      netText: string;
      refundsText: string;
    })[],
    deviceIndex: 0,
    deviceOptions: [] as readonly SalesFilterEntity[],
    errorMessage: "",
    featureReady: app.featureReady,
    from: "",
    gross: "—",
    hasMore: false,
    kindIndex: 0,
    kindLabels: ["", "sale", "refund", "void"].map((code) =>
      salesCodeLabel(code, "kind", translationsFor(app.locale)),
    ),
    kinds: ["", "sale", "refund", "void"],
    loading: false,
    net: "—",
    paymentIndex: 0,
    paymentMethods: [""],
    paymentLabels: [translationsFor(app.locale).all],
    range: "day" as SalesRangeKey,
    refunds: "—",
    saleNumber: "",
    saleCount: 0,
    sales: [] as readonly (DailySale & { netText: string; kindLabel: string })[],
    staffIndex: 0,
    staffOptions: [] as readonly SalesFilterEntity[],
    statusLabels: ["", "accepted", "duplicate", "conflict", "rejected"].map((code) =>
      salesCodeLabel(code, "status", translationsFor(app.locale)),
    ),
    statusIndex: 0,
    statuses: ["", "accepted", "duplicate", "conflict", "rejected"],
    text: translationsFor(app.locale),
    timeZone: "",
    to: "",
  },
  onPullDownRefresh() {
    if (!app.featureReady) {
      wx.stopPullDownRefresh();
      return;
    }
    void this.refresh(true).finally(() => wx.stopPullDownRefresh());
  },
  onShow() {
    this.clearStaleResultScope();
    runtime(this).visible = true;
    const lifecycle = (runtime(this).lifecycle ?? 0) + 1;
    runtime(this).lifecycle = lifecycle;
    this.stopAutomaticRefresh();
    const text = translationsFor(app.locale);
    this.setData({
      text,
      kindLabels: this.data.kinds.map((code) => salesCodeLabel(code, "kind", text)),
      statusLabels: this.data.statuses.map((code) => salesCodeLabel(code, "status", text)),
      paymentLabels: this.data.paymentMethods.map((code) => salesCodeLabel(code, "payment", text)),
    });
    wx.setNavigationBarTitle({ title: this.data.text.sales });
    if (!app.featureReady) return;
    void this.refreshFilters().finally(async () => {
      if (!runtime(this).visible || runtime(this).lifecycle !== lifecycle) return;
      await this.refresh(false, true);
      if (app.sessionStore.load() !== null && app.salesClient) this.startAutomaticRefresh();
    });
  },
  onHide() {
    runtime(this).visible = false;
    const holder = this as unknown as { requestSequence?: number; searchTimer?: number };
    holder.requestSequence = (holder.requestSequence ?? 0) + 1;
    runtime(this).businessSequence = (runtime(this).businessSequence ?? 0) + 1;
    runtime(this).filterSequence = (runtime(this).filterSequence ?? 0) + 1;
    if (holder.searchTimer !== undefined) clearTimeout(holder.searchTimer);
    runtime(this).lifecycle = (runtime(this).lifecycle ?? 0) + 1;
    this.stopAutomaticRefresh();
    this.setData({ loading: false });
  },
  onUnload() {
    this.onHide();
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
    const holder = this as unknown as { requestSequence?: number; searchTimer?: number };
    holder.requestSequence = (holder.requestSequence ?? 0) + 1;
    this.setData({ saleNumber: event.detail.value, sales: [], hasMore: false, loading: false });
    if (holder.searchTimer !== undefined) clearTimeout(holder.searchTimer);
    holder.searchTimer = setTimeout(() => void this.refresh(true), 350);
  },
  async applyRange(range: SalesRangeKey, anchor: string) {
    const holder = this as unknown as { requestSequence?: number };
    holder.requestSequence = (holder.requestSequence ?? 0) + 1;
    this.setData({ loading: false, hasMore: false });
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
        hasMore: false,
        errorMessage: this.data.text.sessionExpired,
        gross: "—",
        net: "—",
        refunds: "—",
        saleCount: 0,
        timeZone: "",
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
  async resolveBusinessDate() {
    const shop = app.activeShop,
      api = app.salesClient;
    if (!shop || !api) return;
    const generation = app.sessionStore.generation;
    const sequence = (runtime(this).businessSequence ?? 0) + 1;
    runtime(this).businessSequence = sequence;
    const anchor = this.data.anchorDate;
    const summary = await api.dailySummary(shop.shop_id);
    if (
      app.activeShop?.shop_id !== shop.shop_id ||
      generation !== app.sessionStore.generation ||
      runtime(this).businessSequence !== sequence
    )
      return;
    if (!summary) throw new Error("missing_business_day");
    const holder = runtime(this);
    if (
      !this.data.anchorDate ||
      holder.dateShop !== shop.shop_id ||
      (this.data.anchorDate === anchor && this.data.anchorDate === holder.businessDate)
    ) {
      this.setData({
        anchorDate: summary.business_date,
        ...resolveSalesRange(summary.business_date, this.data.range),
      });
    }
    holder.businessDate = summary.business_date;
    holder.dateShop = shop.shop_id;
  },
  async refreshFilters() {
    this.clearStaleResultScope();
    const sequence = (runtime(this).filterSequence ?? 0) + 1;
    runtime(this).filterSequence = sequence;
    const shop = await this.ensureShop();
    if (!shop || !app.salesClient) return;
    const cacheGeneration = app.sensitiveCaches.generation;
    try {
      await this.resolveBusinessDate();
      if (
        runtime(this).filterSequence !== sequence ||
        app.activeShop?.shop_id !== shop.shop_id ||
        app.sensitiveCaches.generation !== cacheGeneration
      )
        return;
      const filters = await app.salesClient.salesFilterOptions(
        shop.shop_id,
        this.data.from,
        this.data.to,
      );
      if (
        runtime(this).filterSequence !== sequence ||
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
        paymentLabels: ["", ...(filters?.payment_methods ?? [])].map((code) =>
          salesCodeLabel(code, "payment", this.data.text),
        ),
        staffIndex: 0,
        staffOptions: filters?.staff.length
          ? [{ id: "", name: this.data.text.all }, ...filters.staff]
          : [],
      });
    } catch {
      if (
        app.sensitiveCaches.generation !== cacheGeneration ||
        runtime(this).filterSequence !== sequence ||
        app.activeShop?.shop_id !== shop.shop_id
      )
        return;
      this.setData({
        deviceOptions: [],
        paymentMethods: [""],
        paymentLabels: [this.data.text.all],
        staffOptions: [],
      });
    }
  },
  clearStaleResultScope(): boolean {
    if (runtime(this).loadedScope === currentResultScope()) return false;
    const holder = this as unknown as { requestSequence?: number };
    holder.requestSequence = (holder.requestSequence ?? 0) + 1;
    this.setData({
      loading: false,
      sales: [],
      days: [],
      hasMore: false,
      gross: "—",
      net: "—",
      refunds: "—",
      saleCount: 0,
      timeZone: "",
    });
    delete runtime(this).loadedScope;
    return true;
  },
  async refresh(force: boolean, preserveWindow = false): Promise<boolean> {
    const holder = this as unknown as { requestSequence?: number };
    if (this.clearStaleResultScope()) preserveWindow = false;
    if (preserveWindow && this.data.loading) return true;
    const sequence = (holder.requestSequence ?? 0) + 1;
    holder.requestSequence = sequence;
    this.setData({ loading: true });
    try {
      return await this.refreshWindow(force, preserveWindow, sequence);
    } finally {
      if (holder.requestSequence === sequence) this.setData({ loading: false });
    }
  },
  async refreshWindow(force: boolean, preserveWindow: boolean, sequence: number): Promise<boolean> {
    const windowSize = preserveWindow ? Math.max(50, this.data.sales.length) : 50;
    const verifyKnownEnd = preserveWindow && this.data.sales.length > 0 && !this.data.hasMore;
    const shop = await this.ensureShop();
    if (
      !shop ||
      !app.salesClient ||
      (this as unknown as { requestSequence: number }).requestSequence !== sequence
    ) {
      return false;
    }
    const cacheGeneration = app.sensitiveCaches.generation;
    try {
      await this.resolveBusinessDate();
    } catch (error) {
      if (
        app.activeShop?.shop_id !== shop.shop_id ||
        app.sensitiveCaches.generation !== cacheGeneration ||
        (this as unknown as { requestSequence: number }).requestSequence !== sequence
      )
        return false;
      const key = readErrorTranslationKey(error);
      const retain =
        preserveWindow &&
        runtime(this).loadedScope === currentResultScope() &&
        ["offline", "requestTimeout", "retryableError", "rateLimited"].includes(key);
      this.setData({
        errorMessage: this.data.text[key],
        ...(!retain
          ? {
              gross: "—",
              net: "—",
              refunds: "—",
              days: [],
              sales: [],
              hasMore: false,
              saleCount: 0,
              timeZone: "",
            }
          : {}),
      });
      return false;
    }
    if (
      (this as unknown as { requestSequence: number }).requestSequence !== sequence ||
      app.activeShop?.shop_id !== shop.shop_id ||
      app.sensitiveCaches.generation !== cacheGeneration
    )
      return false;
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
      windowSize,
    ].join(":");
    const cached = force ? undefined : pageCache.get(cacheKey);
    if (cached && !(verifyKnownEnd && cached.hasMore)) {
      if (
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.sessionStore.load() === null ||
        app.activeShop?.shop_id !== shop.shop_id
      ) {
        return false;
      }
      this.applyResult(cached.days, cached.sales, shop.currency_code);
      runtime(this).loadedScope = currentResultScope();
      this.setData({ errorMessage: "", hasMore: cached.hasMore });
      return true;
    }
    this.setData({ errorMessage: "", loading: true });
    try {
      const contextCurrent = () =>
        (this as unknown as { requestSequence: number }).requestSequence === sequence &&
        app.sensitiveCaches.generation === cacheGeneration &&
        app.sessionStore.load() !== null &&
        app.activeShop?.shop_id === shop.shop_id;
      const sales: DailySale[] = [];
      let hasMore = false;
      const query = {
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
      };
      const readWindow = async () => {
        let last: DailySale | undefined;
        for (let offset = 0; offset < windowSize; offset += 50) {
          if (!contextCurrent() || !app.salesClient) return;
          const batch = await app.salesClient.salesPage(shop.shop_id, {
            ...query,
            ...(last ? { beforeAt: last.occurred_at, beforeId: last.pos_sale_id } : {}),
          });
          if (!contextCurrent()) return;
          const ids = new Set(sales.map((sale) => sale.pos_sale_id));
          sales.push(...batch.filter((sale) => !ids.has(sale.pos_sale_id)));
          hasMore = batch.length === 50;
          if (!hasMore) break;
          const next = batch[batch.length - 1];
          if (!next || next.pos_sale_id === last?.pos_sale_id)
            throw new Error("sales_cursor_invalid");
          last = next;
        }
        if (verifyKnownEnd && hasMore && last && contextCurrent() && app.salesClient) {
          const tail = await app.salesClient.salesPage(shop.shop_id, {
            ...query,
            beforeAt: last.occurred_at,
            beforeId: last.pos_sale_id,
            limit: 1,
          });
          if (!contextCurrent()) return;
          hasMore = tail.length > 0;
        }
      };
      const [days] = await Promise.all([
        app.salesClient.periodSummary(shop.shop_id, this.data.from, this.data.to),
        readWindow(),
      ]);
      if (
        (this as unknown as { requestSequence: number }).requestSequence !== sequence ||
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.sessionStore.load() === null ||
        app.activeShop?.shop_id !== shop.shop_id
      ) {
        return false;
      }
      pageCache.set(cacheKey, { days, sales, hasMore });
      this.setData({ hasMore });
      this.applyResult(days, sales, shop.currency_code);
      runtime(this).loadedScope = currentResultScope();
      return true;
    } catch (error) {
      if (
        (this as unknown as { requestSequence: number }).requestSequence !== sequence ||
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.activeShop?.shop_id !== shop.shop_id ||
        app.sessionStore.load() === null
      ) {
        return false;
      }
      const key = readErrorTranslationKey(error);
      const retain =
        preserveWindow &&
        runtime(this).loadedScope === currentResultScope() &&
        ["offline", "requestTimeout", "retryableError", "rateLimited"].includes(key);
      this.setData({
        errorMessage: this.data.text[key],
        ...(!retain
          ? {
              gross: "—",
              net: "—",
              refunds: "—",
              days: [],
              sales: [],
              hasMore: false,
              saleCount: 0,
              timeZone: "",
            }
          : {}),
      });
      return false;
    } finally {
      if ((this as unknown as { requestSequence: number }).requestSequence === sequence) {
        this.setData({ loading: false });
      }
    }
  },
  startAutomaticRefresh() {
    this.stopAutomaticRefresh();
    if (!runtime(this).visible) return;
    const controller = new AdaptiveRefreshController({
      baseDelayMilliseconds: runtimeConfig.autoRefreshMilliseconds,
      maximumDelayMilliseconds: runtimeConfig.autoRefreshMaximumMilliseconds,
      refresh: async () => {
        if (!(await this.refresh(true, true))) throw new Error("sales_refresh_failed");
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
    if (days.length === 0) {
      this.setData({
        errorMessage: this.data.text.retryableError,
        gross: "—",
        net: "—",
        refunds: "—",
        sales: [],
        days: [],
        hasMore: false,
        saleCount: 0,
        timeZone: "",
      });
      return;
    }
    const format = (value: number) => `${currency} ${formatCatalogNumber(value)}`;
    this.setData({
      days: days.map((day) => ({
        ...day,
        grossText: formatCatalogNumber(day.gross_sales_clp),
        netText: formatCatalogNumber(day.net_revenue_clp),
        refundsText: formatCatalogNumber(day.refunds_clp),
      })),
      gross: format(total(days, "gross_sales_clp")),
      net: format(total(days, "net_revenue_clp")),
      refunds: format(total(days, "refunds_clp")),
      saleCount: days.reduce((sum, day) => sum + day.sale_count, 0),
      sales: sales.map((sale) => ({
        ...sale,
        netText: formatCatalogNumber(sale.net_amount_clp),
        kindLabel: salesCodeLabel(sale.business_kind, "kind", this.data.text),
      })),
      timeZone: app.activeShop?.time_zone ?? "",
    });
  },
  async loadMore() {
    const shop = app.activeShop;
    const last = this.data.sales[this.data.sales.length - 1];
    if (
      !shop ||
      !last ||
      !this.data.hasMore ||
      !app.salesClient ||
      app.sessionStore.load() === null
    )
      return;
    const cacheGeneration = app.sensitiveCaches.generation;
    const sequence = (this as unknown as { requestSequence?: number }).requestSequence;
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
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
      if ((this as unknown as { requestSequence?: number }).requestSequence !== sequence) return;
      const ids = new Set(this.data.sales.map((sale) => sale.pos_sale_id));
      this.setData({
        hasMore: next.length === 50,
        sales: [
          ...this.data.sales,
          ...next
            .filter((sale) => !ids.has(sale.pos_sale_id))
            .map((sale) => ({
              ...sale,
              netText: formatCatalogNumber(sale.net_amount_clp),
              kindLabel: salesCodeLabel(sale.business_kind, "kind", this.data.text),
            })),
        ],
      });
    } catch (error) {
      if (
        app.activeShop?.shop_id === shop.shop_id &&
        app.sensitiveCaches.generation === cacheGeneration &&
        (this as unknown as { requestSequence?: number }).requestSequence === sequence
      )
        this.setData({ errorMessage: this.data.text[readErrorTranslationKey(error)] });
    } finally {
      if ((this as unknown as { requestSequence?: number }).requestSequence === sequence)
        this.setData({ loading: false });
    }
  },
  openDetail(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({
      url: `/pages/sale-detail/index?id=${encodeURIComponent(String(event.currentTarget.dataset.id))}`,
    });
  },
});
