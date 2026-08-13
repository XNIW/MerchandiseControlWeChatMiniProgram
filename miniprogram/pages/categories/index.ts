import type { MerchandiseControlApp } from "../../app";
import type { Category } from "../../lib/contracts";
import { type MiniSyncNotification, miniSyncEntityIds } from "../../lib/sync-coordinator";
import { translationsFor } from "../../locales/index";
import { hasCatalogCapability } from "../catalog-management";

const app = getApp<MerchandiseControlApp>();

interface CategoryRuntime {
  sequence?: number;
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
    void this.load();
  },
  onHide() {
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = undefined;
  },
  onUnload() {
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = undefined;
  },
  async applySync(notification: MiniSyncNotification) {
    if (
      notification.shopId === app.activeShop?.shop_id &&
      (notification.kind === "reconcile" ||
        miniSyncEntityIds(notification, "category_ids", 1).length > 0)
    ) {
      await this.load();
    }
  },
  search(event: WechatMiniprogram.Input) {
    this.setData({ search: event.detail.value });
    const holder = this as unknown as { timer?: number };
    if (holder.timer !== undefined) clearTimeout(holder.timer);
    holder.timer = setTimeout(() => void this.load(), 350);
  },
  async load() {
    const shop = app.activeShop;
    if (!shop || !app.salesClient) return;
    const sequence = (runtime(this).sequence ?? 0) + 1;
    runtime(this).sequence = sequence;
    const sessionGeneration = app.sessionStore.generation;
    const cacheGeneration = app.sensitiveCaches.generation;
    this.setData({ loading: true });
    try {
      const items = await app.salesClient.categories(shop.shop_id, this.data.search || undefined);
      if (
        runtime(this).sequence === sequence &&
        app.sessionStore.generation === sessionGeneration &&
        app.sensitiveCaches.generation === cacheGeneration &&
        app.activeShop?.shop_id === shop.shop_id
      ) {
        this.setData({ errorMessage: "", items });
      }
    } catch {
      if (runtime(this).sequence === sequence) {
        this.setData({ errorMessage: this.data.text.offline });
      }
    } finally {
      if (runtime(this).sequence === sequence) this.setData({ loading: false });
    }
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
