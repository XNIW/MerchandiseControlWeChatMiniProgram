import type { MerchandiseControlApp } from "../../app";
import type { Category } from "../../lib/contracts";
import { type MiniSyncNotification, miniSyncEntityIds } from "../../lib/sync-coordinator";
import { translationsFor } from "../../locales/index";
import { hasCatalogCapability, readErrorTranslationKey } from "../catalog-management";

const app = getApp<MerchandiseControlApp>();

interface CategoryRuntime {
  sequence?: number;
  pendingRefresh?: boolean;
  context?: string;
  appliedSearch?: string;
  unsubscribeSync: (() => boolean) | undefined;
}

function runtime(page: unknown): CategoryRuntime {
  return page as CategoryRuntime;
}

Page({
  data: {
    canManage: false,
    errorMessage: "",
    items: [] as readonly Category[],
    loading: true,
    hasMore: true,
    search: "",
    text: translationsFor(app.locale),
  },
  onShow() {
    const text = translationsFor(app.locale);
    this.setData({
      canManage: hasCatalogCapability(app.activeShop, "can_write_categories"),
      text,
    });
    wx.setNavigationBarTitle({ title: text.categories });
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = app.syncCoordinator?.subscribe((notification) =>
      this.applySync(notification),
    );
    void this.load(false, true);
  },
  onHide() {
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = undefined;
  },
  onUnload() {
    runtime(this).sequence = (runtime(this).sequence ?? 0) + 1;
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = undefined;
  },
  async applySync(notification: MiniSyncNotification) {
    if (
      notification.shopId === app.activeShop?.shop_id &&
      (notification.kind === "reconcile" ||
        miniSyncEntityIds(notification, "category_ids", 1).length > 0)
    ) {
      if (this.data.loading) runtime(this).pendingRefresh = true;
      else await this.load(false, true);
    }
  },
  search(event: WechatMiniprogram.Input) {
    this.setData({ search: event.detail.value });
    const holder = this as unknown as { timer?: number };
    if (holder.timer !== undefined) clearTimeout(holder.timer);
    holder.timer = setTimeout(() => void this.load(), 350);
  },
  async load(append = false, preserveWindow = false) {
    if (append && (this.data.loading || !this.data.hasMore)) return;
    const shop = app.activeShop;
    if (!shop || !app.salesClient) return;
    const context = `${app.sessionStore.generation}:${shop.shop_id}`;
    if (runtime(this).context !== context) {
      runtime(this).context = context;
      preserveWindow = false;
      append = false;
      this.setData({ items: [], search: "" });
    }
    const search = preserveWindow
      ? (runtime(this).appliedSearch ?? this.data.search)
      : this.data.search;
    if (append && search !== runtime(this).appliedSearch) append = false;
    const windowSize = preserveWindow ? this.data.items.length : 0;
    const sequence = (runtime(this).sequence ?? 0) + 1;
    runtime(this).sequence = sequence;
    const sessionGeneration = app.sessionStore.generation;
    const cacheGeneration = app.sensitiveCaches.generation;
    this.setData({ loading: true });
    try {
      const last = append ? this.data.items[this.data.items.length - 1] : undefined;
      let page = await app.salesClient.categories(
        shop.shop_id,
        search || undefined,
        last ? { afterName: last.category_name, afterId: last.category_id } : {},
      );
      const refreshed = [...page];
      while (preserveWindow && refreshed.length < windowSize && page.length === 100) {
        if (
          runtime(this).sequence !== sequence ||
          app.sessionStore.generation !== sessionGeneration ||
          app.activeShop?.shop_id !== shop.shop_id
        )
          return;
        const cursor = page[page.length - 1];
        if (!cursor) break;
        page = await app.salesClient.categories(shop.shop_id, search || undefined, {
          afterName: cursor.category_name,
          afterId: cursor.category_id,
        });
        refreshed.push(...page);
      }
      const items = append
        ? [
            ...this.data.items,
            ...page.filter((p) => !this.data.items.some((i) => i.category_id === p.category_id)),
          ]
        : refreshed;
      if (
        runtime(this).sequence === sequence &&
        app.sessionStore.generation === sessionGeneration &&
        app.sensitiveCaches.generation === cacheGeneration &&
        app.activeShop?.shop_id === shop.shop_id
      ) {
        runtime(this).appliedSearch = search;
        this.setData({ errorMessage: "", items, hasMore: page.length === 100 });
      }
    } catch (error) {
      if (
        runtime(this).sequence === sequence &&
        app.sessionStore.generation === sessionGeneration &&
        app.activeShop?.shop_id === shop.shop_id
      ) {
        this.setData({ errorMessage: this.data.text[readErrorTranslationKey(error)] });
      }
    } finally {
      if (runtime(this).sequence === sequence) {
        this.setData({ loading: false });
        if (runtime(this).pendingRefresh) {
          runtime(this).pendingRefresh = false;
          void this.load(false, true);
        }
      }
    }
  },
  loadMore() {
    void this.load(true);
  },
  create() {
    if (!this.data.canManage) return;
    wx.navigateTo({ url: "/pages/catalog-entity-form/index?type=category&mode=create" });
  },
  manage(event: WechatMiniprogram.BaseEvent) {
    if (!this.data.canManage) return;
    wx.navigateTo({
      url: `/pages/catalog-entity-form/index?type=category&mode=edit&id=${encodeURIComponent(String(event.currentTarget.dataset.id))}`,
    });
  },
  viewArchived() {
    wx.navigateTo({ url: "/pages/catalog-lifecycle/index?type=category" });
  },
  openProducts(event: WechatMiniprogram.BaseEvent) {
    app.pendingCatalogFilter = { categoryId: String(event.currentTarget.dataset.id) };
    wx.switchTab({ url: "/pages/database/index" });
  },
});
