import type { MerchandiseControlApp } from "../../app";
import type { SyncHistoryEntry } from "../../lib/contracts";
import type {
  CatalogEntityType,
  CatalogHistoryEvent,
  CatalogHistoryOperation,
} from "../../lib/sales-api-client";
import { translationsFor } from "../../locales/index";
import { hasCatalogCapability, readErrorTranslationKey } from "../catalog-management";

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

let historyRefreshPending = false;
let historyVisible = false;
let historyCursor: CatalogHistoryRow | undefined;
let syncCursor: SyncHistoryEntry | undefined;
let historyScope = "";
let appliedFilters = { entityIndex: 0, operationIndex: 0, entityId: "", fromDate: "", toDate: "" };
let unsubscribeHistory: (() => boolean) | undefined;

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
    historyVisible = true;
    historyRefreshPending = false;
    historyRequestGeneration += 1;
    const text = translationsFor(app.locale);
    const scope = `${app.sessionStore.generation}:${app.activeShop?.shop_id ?? ""}`;
    const retain = historyScope === scope;
    historyScope = scope;
    if (!retain) {
      historyCursor = undefined;
      syncCursor = undefined;
    }
    this.setData({
      canReadCatalogHistory: hasCatalogCapability(app.activeShop, "can_read_catalog_history"),
      catalogItems: retain ? this.data.catalogItems : [],
      entityId: retain ? this.data.entityId : "",
      entityIndex: retain ? this.data.entityIndex : 0,
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
      fromDate: retain ? this.data.fromDate : "",
      hasMoreCatalog: retain ? this.data.hasMoreCatalog : false,
      hasMoreSync: retain ? this.data.hasMoreSync : false,
      loading: false,
      operationIndex: retain ? this.data.operationIndex : 0,
      syncItems: retain ? this.data.syncItems : [],
      text,
      toDate: retain ? this.data.toDate : "",
    });
    wx.setNavigationBarTitle({ title: text.history });
    if (!app.featureReady) return;
    unsubscribeHistory?.();
    unsubscribeHistory = app.syncCoordinator?.subscribe((notification) => {
      if (notification.shopId === app.activeShop?.shop_id) {
        if (this.data.loading) historyRefreshPending = true;
        else void this.load(true, true);
      }
    });
    void this.load(true, retain);
  },
  onHide() {
    historyVisible = false;
    historyRefreshPending = false;
    unsubscribeHistory?.();
    unsubscribeHistory = undefined;
    historyRequestGeneration += 1;
  },
  onUnload() {
    this.onHide();
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
  async load(reset: boolean, preserve = false) {
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
        const last = reset ? undefined : syncCursor;
        const next = await salesClient.syncHistory(shop.shop_id, last?.event_id);
        if (!isHistoryRequestCurrent(context) || this.data.viewMode !== context.viewMode) return;
        syncCursor = next[next.length - 1];
        const ids = new Set(syncItems.map((item) => item.event_id));
        this.setData({
          hasMoreSync: next.length === 50,
          syncItems: (reset
            ? preserve
              ? [...next, ...syncItems.filter((i) => !next.some((n) => n.event_id === i.event_id))]
              : [...next]
            : [...syncItems, ...next.filter((item) => !ids.has(item.event_id))]
          ).sort((a, b) => b.event_id - a.event_id),
        });
        return;
      }
      if (!this.data.canReadCatalogHistory) {
        if (isHistoryRequestCurrent(context)) {
          this.setData({ catalogItems: [], errorMessage: text.historyUnavailable });
        }
        return;
      }
      const last = reset ? undefined : historyCursor;
      if (reset && !preserve)
        appliedFilters = {
          entityIndex: this.data.entityIndex,
          operationIndex: this.data.operationIndex,
          entityId: this.data.entityId,
          fromDate: this.data.fromDate,
          toDate: this.data.toDate,
        };
      const filters = appliedFilters;
      const entityType = this.data.entityOptions[filters.entityIndex]?.value || undefined;
      const operation = this.data.operationOptions[filters.operationIndex]?.value || undefined;
      const fromAt = filters.fromDate || undefined;
      const toAt = filters.toDate || undefined;
      if (
        (filters.entityId && !uuidPattern.test(filters.entityId)) ||
        (fromAt !== undefined &&
          toAt !== undefined &&
          (Date.parse(toAt) < Date.parse(fromAt) ||
            Date.parse(toAt) - Date.parse(fromAt) > maximumHistoryRangeMilliseconds))
      ) {
        if (isHistoryRequestCurrent(context)) this.setData({ errorMessage: text.invalidFilters });
        return;
      }
      const entityId = filters.entityId;
      const entityOptions = this.data.entityOptions;
      const operationOptions = this.data.operationOptions;
      const next = await salesClient.catalogHistory(shop.shop_id, {
        ...(last ? { beforeAuditLogId: last.history_id, beforeCreatedAt: last.occurred_at } : {}),
        ...(entityId ? { entityId } : {}),
        ...(entityType ? { entityType } : {}),
        ...(fromAt ? { fromDate: fromAt } : {}),
        limit: 50,
        ...(operation ? { operation } : {}),
        ...(toAt ? { toDate: toAt } : {}),
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
      historyCursor = rows[rows.length - 1];
      const ids = new Set(catalogItems.map((item) => item.history_id));
      this.setData({
        catalogItems: (reset
          ? preserve
            ? [
                ...rows,
                ...catalogItems.filter((i) => !rows.some((r) => r.history_id === i.history_id)),
              ]
            : rows
          : [...catalogItems, ...rows.filter((item) => !ids.has(item.history_id))]
        ).sort(
          (a, b) =>
            b.occurred_at.localeCompare(a.occurred_at) || b.history_id.localeCompare(a.history_id),
        ),
        hasMoreCatalog: rows.length === 50,
      });
    } catch (error) {
      if (isHistoryRequestCurrent(context) && this.data.viewMode === context.viewMode) {
        this.setData({ errorMessage: text[readErrorTranslationKey(error)] });
      }
    } finally {
      if (historyRequestGeneration === context.requestGeneration) {
        if (
          app.sessionStore.generation !== context.sessionGeneration ||
          app.activeShop?.shop_id !== context.shopId
        )
          this.setData({ catalogItems: [], syncItems: [] });
        this.setData({ loading: false });
        if (historyVisible && historyRefreshPending) {
          historyRefreshPending = false;
          void this.load(true, true);
        }
      }
    }
  },
  loadMore() {
    void this.load(false);
  },
});
