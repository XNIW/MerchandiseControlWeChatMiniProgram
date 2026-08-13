import type { MerchandiseControlApp } from "../../app";
import type { Supplier } from "../../lib/contracts";
import { type MiniSyncNotification, miniSyncEntityIds } from "../../lib/sync-coordinator";
import { translationsFor } from "../../locales/index";
import { hasCatalogCapability } from "../catalog-management";

const app = getApp<MerchandiseControlApp>();

interface SupplierRuntime {
  sequence?: number;
  unsubscribeSync: (() => boolean) | undefined;
}

function runtime(page: unknown): SupplierRuntime {
  return page as SupplierRuntime;
}

Page({
  data: {
    canManage: false,
    errorMessage: "",
    items: [] as readonly Supplier[],
    loading: true,
    search: "",
    text: translationsFor(app.locale),
  },
  onShow() {
    const text = translationsFor(app.locale);
    this.setData({
      canManage: hasCatalogCapability(app.activeShop, "can_write_suppliers"),
      text,
    });
    wx.setNavigationBarTitle({ title: text.suppliers });
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
        miniSyncEntityIds(notification, "supplier_ids", 1).length > 0)
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
      const items = await app.salesClient.suppliers(shop.shop_id, this.data.search || undefined);
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
    wx.navigateTo({ url: "/pages/catalog-entity-form/index?type=supplier&mode=create" });
  },
  manage(event: WechatMiniprogram.BaseEvent) {
    if (!this.data.canManage) return;
    wx.navigateTo({
      url: `/pages/catalog-entity-form/index?type=supplier&mode=edit&id=${encodeURIComponent(String(event.currentTarget.dataset.id))}`,
    });
  },
  viewArchived() {
    wx.navigateTo({ url: "/pages/catalog-lifecycle/index?type=supplier" });
  },
  openProducts(event: WechatMiniprogram.BaseEvent) {
    app.pendingCatalogFilter = { supplierId: String(event.currentTarget.dataset.id) };
    wx.switchTab({ url: "/pages/database/index" });
  },
});
