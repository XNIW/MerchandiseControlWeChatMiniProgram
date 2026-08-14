import type { MerchandiseControlApp } from "../../app";
import type { SyncHistoryEntry } from "../../lib/contracts";
import type {
  CatalogEntityType,
  CatalogHistoryEvent,
  CatalogHistoryOperation,
} from "../../lib/sales-api-client";
import { translationsFor } from "../../locales/index";
import { hasCatalogCapability } from "../catalog-management";

const app = getApp<MerchandiseControlApp>();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maximumHistoryRangeMilliseconds = 366 * 24 * 60 * 60 * 1_000;

interface FilterOption<T extends string> {
  readonly label: string;
  readonly value: "" | T;
}

type CatalogHistoryRow = CatalogHistoryEvent & {
  readonly entity_label: string;
  readonly operation_label: string;
  readonly result_label: string;
  readonly surface_label: string;
};

interface HistoryRequestContext {
  readonly cacheGeneration: number;
  readonly requestGeneration: number;
  readonly sessionGeneration: number;
  readonly shopId: string;
  readonly viewMode: "catalog" | "sync";
}

let historyRequestGeneration = 0;

function isHistoryRequestCurrent(context: HistoryRequestContext): boolean {
  const activeSession = app.sessionStore.load();
  return (
    activeSession !== null &&
    historyRequestGeneration === context.requestGeneration &&
    app.sessionStore.generation === context.sessionGeneration &&
    app.sensitiveCaches.generation === context.cacheGeneration &&
    app.activeShop?.shop_id === context.shopId
  );
}

function startOfLocalDay(date: string): string {
  return new Date(`${date}T00:00:00.000`).toISOString();
}

function endOfLocalDay(date: string): string {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

Page({
  data: {
    canReadCatalogHistory: false,
    catalogItems: [] as readonly CatalogHistoryRow[],
    entityId: "",
    entityIndex: 0,
    entityOptions: [] as readonly FilterOption<CatalogEntityType>[],
    errorMessage: "",
    featureReady: app.featureReady,
    fromDate: "",
    hasMoreCatalog: false,
    hasMoreSync: false,
    loading: false,
    operationIndex: 0,
    operationOptions: [] as readonly FilterOption<CatalogHistoryOperation>[],
    syncItems: [] as readonly SyncHistoryEntry[],
    text: translationsFor(app.locale),
    toDate: "",
    viewMode: "catalog" as "catalog" | "sync",
  },
  onPullDownRefresh() {
    if (!app.featureReady) {
      wx.stopPullDownRefresh();
      return;
    }
    historyRequestGeneration += 1;
    this.setData({ loading: false });
    void this.load(true).finally(() => wx.stopPullDownRefresh());
  },
  onShow() {
    historyRequestGeneration += 1;
    const text = translationsFor(app.locale);
    this.setData({
      canReadCatalogHistory: hasCatalogCapability(app.activeShop, "can_read_catalog_history"),
      catalogItems: [],
      entityId: "",
      entityIndex: 0,
      entityOptions: [
        { label: text.all, value: "" },
        { label: text.products, value: "product" },
        { label: text.categories, value: "category" },
        { label: text.suppliers, value: "supplier" },
      ],
      operationOptions: [
        { label: text.all, value: "" },
        { label: text.created, value: "created" },
        { label: text.modified, value: "updated" },
        { label: text.archived, value: "archived" },
        { label: text.restored, value: "restored" },
        { label: text.priceChanged, value: "price_changed" },
        { label: text.categoryChanged, value: "category_changed" },
        { label: text.supplierChanged, value: "supplier_changed" },
        { label: text.imageAdded, value: "image_added" },
        { label: text.imageReplaced, value: "image_replaced" },
        { label: text.imageRemoved, value: "image_removed" },
      ],
      errorMessage: "",
      fromDate: "",
      hasMoreCatalog: false,
      hasMoreSync: false,
      loading: false,
      operationIndex: 0,
      syncItems: [],
      text,
      toDate: "",
    });
    wx.setNavigationBarTitle({ title: text.history });
    if (!app.featureReady) return;
    void this.load(true);
  },
  onUnload() {
    historyRequestGeneration += 1;
  },
  selectCatalog() {
    if (this.data.viewMode === "catalog") return;
    historyRequestGeneration += 1;
    this.setData({ errorMessage: "", loading: false, viewMode: "catalog" });
    if (this.data.catalogItems.length === 0) void this.load(true);
  },
  selectSync() {
    if (this.data.viewMode === "sync") return;
    historyRequestGeneration += 1;
    this.setData({ errorMessage: "", loading: false, viewMode: "sync" });
    if (this.data.syncItems.length === 0) void this.load(true);
  },
  chooseEntity(event: WechatMiniprogram.PickerChange) {
    this.setData({ entityIndex: Number(event.detail.value) });
  },
  chooseOperation(event: WechatMiniprogram.PickerChange) {
    this.setData({ operationIndex: Number(event.detail.value) });
  },
  changeEntityId(event: WechatMiniprogram.Input) {
    this.setData({ entityId: event.detail.value.trim() });
  },
  chooseFromDate(event: WechatMiniprogram.PickerChange) {
    this.setData({ fromDate: String(event.detail.value) });
  },
  chooseToDate(event: WechatMiniprogram.PickerChange) {
    this.setData({ toDate: String(event.detail.value) });
  },
  applyFilters() {
    historyRequestGeneration += 1;
    this.setData({ catalogItems: [], hasMoreCatalog: false, loading: false });
    void this.load(true);
  },
  clearFilters() {
    historyRequestGeneration += 1;
    this.setData({
      catalogItems: [],
      entityId: "",
      entityIndex: 0,
      fromDate: "",
      hasMoreCatalog: false,
      loading: false,
      operationIndex: 0,
      toDate: "",
    });
    void this.load(true);
  },
  async load(reset: boolean) {
    if (!app.featureReady) return;
    const shop = app.activeShop;
    const salesClient = app.salesClient;
    const session = app.sessionStore.load();
    if (this.data.loading || !shop || !salesClient || session === null) return;
    historyRequestGeneration += 1;
    const context: HistoryRequestContext = {
      cacheGeneration: app.sensitiveCaches.generation,
      requestGeneration: historyRequestGeneration,
      sessionGeneration: app.sessionStore.generation,
      shopId: shop.shop_id,
      viewMode: this.data.viewMode,
    };
    const catalogItems = this.data.catalogItems;
    const syncItems = this.data.syncItems;
    const text = this.data.text;
    this.setData({ errorMessage: "", loading: true });
    try {
      if (context.viewMode === "sync") {
        const last = reset ? undefined : syncItems[syncItems.length - 1];
        const next = await salesClient.syncHistory(shop.shop_id, last?.event_id);
        if (!isHistoryRequestCurrent(context) || this.data.viewMode !== context.viewMode) return;
        const ids = new Set(syncItems.map((item) => item.event_id));
        this.setData({
          hasMoreSync: next.length === 50,
          syncItems: reset
            ? next
            : [...syncItems, ...next.filter((item) => !ids.has(item.event_id))],
        });
        return;
      }
      if (!this.data.canReadCatalogHistory) {
        if (isHistoryRequestCurrent(context)) {
          this.setData({ catalogItems: [], errorMessage: text.historyUnavailable });
        }
        return;
      }
      const last = reset ? undefined : catalogItems[catalogItems.length - 1];
      const entityType = this.data.entityOptions[this.data.entityIndex]?.value || undefined;
      const operation = this.data.operationOptions[this.data.operationIndex]?.value || undefined;
      const fromAt = this.data.fromDate ? startOfLocalDay(this.data.fromDate) : undefined;
      const toAt = this.data.toDate ? endOfLocalDay(this.data.toDate) : undefined;
      if (
        (this.data.entityId && !uuidPattern.test(this.data.entityId)) ||
        (fromAt !== undefined &&
          toAt !== undefined &&
          (Date.parse(toAt) < Date.parse(fromAt) ||
            Date.parse(toAt) - Date.parse(fromAt) > maximumHistoryRangeMilliseconds))
      ) {
        if (isHistoryRequestCurrent(context)) this.setData({ errorMessage: text.invalidFilters });
        return;
      }
      const entityId = this.data.entityId;
      const entityOptions = this.data.entityOptions;
      const operationOptions = this.data.operationOptions;
      const next = await salesClient.catalogHistory(shop.shop_id, {
        ...(last ? { beforeAuditLogId: last.history_id, beforeCreatedAt: last.occurred_at } : {}),
        ...(entityId ? { entityId } : {}),
        ...(entityType ? { entityType } : {}),
        ...(fromAt ? { fromAt } : {}),
        limit: 50,
        ...(operation ? { operation } : {}),
        ...(toAt ? { toAt } : {}),
      });
      if (!isHistoryRequestCurrent(context) || this.data.viewMode !== context.viewMode) return;
      const operationLabels = new Map(operationOptions.map((item) => [item.value, item.label]));
      const entityLabels = new Map(entityOptions.map((item) => [item.value, item.label]));
      const rows = next.map((item) => ({
        ...item,
        entity_label: entityLabels.get(item.entity_type) ?? item.entity_type,
        operation_label: operationLabels.get(item.operation) ?? item.operation,
        result_label: item.result === "success" ? text.success : item.result,
        surface_label: item.surface === "mini_program" ? text.miniProgram : text.imageApi,
      }));
      const ids = new Set(catalogItems.map((item) => item.history_id));
      this.setData({
        catalogItems: reset
          ? rows
          : [...catalogItems, ...rows.filter((item) => !ids.has(item.history_id))],
        hasMoreCatalog: rows.length === 50,
      });
    } catch {
      if (isHistoryRequestCurrent(context) && this.data.viewMode === context.viewMode) {
        this.setData({ errorMessage: text.offline });
      }
    } finally {
      if (historyRequestGeneration === context.requestGeneration) {
        this.setData({ loading: false });
      }
    }
  },
  loadMore() {
    void this.load(false);
  },
});
