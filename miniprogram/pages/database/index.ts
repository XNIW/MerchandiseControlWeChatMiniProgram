import type { MerchandiseControlApp } from "../../app";
import type { CatalogProduct } from "../../lib/contracts";
import { ProductImageCache } from "../../lib/product-image-cache";
import type { ProductImageReadResult } from "../../lib/product-image-mutation-client";
import { type MiniSyncNotification, miniSyncEntityIds } from "../../lib/sync-coordinator";
import { translationsFor } from "../../locales/index";
import { hasCatalogCapability } from "../catalog-management";

type ProductRow = CatalogProduct & { readonly thumbnail_url: string | null };
const app = getApp<MerchandiseControlApp>();
const imageCache = new ProductImageCache(20, app.sessionStore);
app.sensitiveCaches.register(imageCache, ["catalog", "prices"]);

interface DatabaseRuntime {
  sequence?: number;
  syncSequence?: number;
  unsubscribeSync: (() => boolean) | undefined;
}

function pageRuntime(page: unknown): DatabaseRuntime {
  return page as DatabaseRuntime;
}

function cachedThumbnail(
  shopId: string,
  product: Pick<CatalogProduct, "primary_image_version_id" | "product_id">,
): string | null {
  if (!product.primary_image_version_id) return null;
  return (
    imageCache.get({
      productId: product.product_id,
      shopId,
      variant: "thumb",
      versionId: product.primary_image_version_id,
    })?.signedUrl ?? null
  );
}

Page({
  data: {
    canCreate: false,
    categoryFilterId: "",
    currencyCode: "",
    errorMessage: "",
    featureReady: app.featureReady,
    loading: false,
    products: [] as readonly ProductRow[],
    search: "",
    sortIndex: 0,
    sortLabels: [] as readonly string[],
    sorts: ["updated_desc", "name_asc", "barcode_asc"],
    supplierFilterId: "",
    text: translationsFor(app.locale),
  },
  onPullDownRefresh() {
    if (!app.featureReady) {
      wx.stopPullDownRefresh();
      return;
    }
    void this.refresh(true).finally(() => wx.stopPullDownRefresh());
  },
  onShow() {
    const text = translationsFor(app.locale);
    this.setData({
      canCreate: hasCatalogCapability(app.activeShop, "can_write_products"),
      currencyCode: app.activeShop?.currency_code ?? "",
      sortLabels: [text.recentlyUpdated, text.nameAscending, text.barcodeAscending],
      text,
    });
    wx.setNavigationBarTitle({ title: text.database });
    if (!app.featureReady) return;
    pageRuntime(this).unsubscribeSync?.();
    pageRuntime(this).unsubscribeSync = app.syncCoordinator?.subscribe((notification) =>
      this.applySync(notification),
    );
    void this.refresh(true);
  },
  onHide() {
    pageRuntime(this).unsubscribeSync?.();
    pageRuntime(this).unsubscribeSync = undefined;
  },
  onUnload() {
    pageRuntime(this).unsubscribeSync?.();
    pageRuntime(this).unsubscribeSync = undefined;
  },
  async applySync(notification: MiniSyncNotification) {
    if (!app.featureReady) return;
    const shop = app.activeShop;
    if (!shop || notification.shopId !== shop.shop_id || !app.salesClient) return;
    if (notification.kind === "reconcile") {
      await this.refresh(true);
      return;
    }
    const productIds = miniSyncEntityIds(notification, "product_ids", 16);
    if (productIds.length === 0) {
      if (
        miniSyncEntityIds(notification, "category_ids", 1).length > 0 ||
        miniSyncEntityIds(notification, "supplier_ids", 1).length > 0
      ) {
        await this.refresh(true);
      }
      return;
    }
    const holder = pageRuntime(this);
    const sequence = (holder.syncSequence ?? 0) + 1;
    holder.syncSequence = sequence;
    const sessionGeneration = app.sessionStore.generation;
    const cacheGeneration = app.sensitiveCaches.generation;
    const details = await Promise.all(
      productIds.map((productId) => app.salesClient?.productDetail(shop.shop_id, productId)),
    );
    if (
      holder.syncSequence !== sequence ||
      app.sessionStore.generation !== sessionGeneration ||
      app.sensitiveCaches.generation !== cacheGeneration ||
      app.activeShop?.shop_id !== shop.shop_id
    ) {
      return;
    }
    const imageRequests = details.flatMap((product) =>
      product?.primary_image_version_id
        ? [
            {
              productId: product.product_id,
              variant: "thumb" as const,
              versionId: product.primary_image_version_id,
            },
          ]
        : [],
    );
    if (app.imageClient && imageRequests.length > 0) {
      try {
        const images = await app.imageClient.readUrls(shop.shop_id, imageRequests);
        if (
          holder.syncSequence !== sequence ||
          app.sessionStore.generation !== sessionGeneration ||
          app.sensitiveCaches.generation !== cacheGeneration ||
          app.activeShop?.shop_id !== shop.shop_id
        ) {
          return;
        }
        for (const image of images.items) {
          if (image.status === "ready") imageCache.set(shop.shop_id, image);
        }
      } catch {
        // Business fields still converge; the next image read requests a fresh capability.
      }
    }
    const byId = new Map(details.map((detail, index) => [productIds[index], detail]));
    const rows = [...this.data.products];
    for (const productId of productIds) {
      const detail = byId.get(productId) ?? null;
      const index = rows.findIndex((row) => row.product_id === productId);
      if (!detail) {
        if (index >= 0) rows.splice(index, 1);
        continue;
      }
      const existing = index >= 0 ? rows[index] : undefined;
      const row: ProductRow = {
        ...detail,
        cursor_text: existing?.cursor_text ?? null,
        previous_retail_price: existing?.previous_retail_price ?? null,
        thumbnail_url: cachedThumbnail(shop.shop_id, detail),
      };
      const search = this.data.search.trim().toLocaleLowerCase();
      const visible =
        (!this.data.categoryFilterId || detail.category_id === this.data.categoryFilterId) &&
        (!this.data.supplierFilterId || detail.supplier_id === this.data.supplierFilterId) &&
        (!search ||
          [
            detail.barcode,
            detail.item_number,
            detail.product_name,
            detail.second_product_name,
          ].some((value) => value?.toLocaleLowerCase().includes(search)));
      if (!visible) {
        if (index >= 0) rows.splice(index, 1);
      } else if (index >= 0) {
        rows[index] = row;
      } else {
        rows.push(row);
      }
    }
    const sort = this.data.sorts[this.data.sortIndex];
    rows.sort((left, right) => {
      if (sort === "name_asc") {
        return (
          (left.product_name ?? "").localeCompare(right.product_name ?? "") ||
          left.product_id.localeCompare(right.product_id)
        );
      }
      if (sort === "barcode_asc") {
        return (
          left.barcode.localeCompare(right.barcode) ||
          left.product_id.localeCompare(right.product_id)
        );
      }
      return (
        right.updated_at.localeCompare(left.updated_at) ||
        right.product_id.localeCompare(left.product_id)
      );
    });
    if (
      holder.syncSequence === sequence &&
      app.sessionStore.generation === sessionGeneration &&
      app.sensitiveCaches.generation === cacheGeneration &&
      app.activeShop?.shop_id === shop.shop_id
    ) {
      this.setData({ products: rows.slice(0, Math.max(50, this.data.products.length)) });
    }
  },
  search(event: WechatMiniprogram.Input) {
    this.setData({ search: event.detail.value });
    const holder = this as unknown as { timer?: number };
    if (holder.timer !== undefined) clearTimeout(holder.timer);
    holder.timer = setTimeout(() => void this.refresh(true), 350);
  },
  chooseSort(event: WechatMiniprogram.PickerChange) {
    this.setData({ sortIndex: Number(event.detail.value), products: [] });
    void this.refresh(true);
  },
  async ensureShop() {
    if (!app.featureReady) return null;
    if (app.sessionStore.load() === null) {
      app.clearSessionContext();
      this.setData({
        errorMessage: this.data.text.sessionExpired,
        loading: false,
        products: [],
      });
      return null;
    }
    if (app.activeShop || !app.salesClient) return app.activeShop;
    const shops = await app.salesClient.authorizedShops();
    const shop = shops[0] ?? null;
    if (shop) app.selectShop(shop);
    this.setData({
      canCreate: hasCatalogCapability(shop, "can_write_products"),
      currencyCode: shop?.currency_code ?? "",
    });
    return shop;
  },
  async refresh(reset: boolean) {
    const sequence = (pageRuntime(this).sequence ?? 0) + 1;
    pageRuntime(this).sequence = sequence;
    const shop = await this.ensureShop();
    if (!shop || !app.salesClient || pageRuntime(this).sequence !== sequence) {
      return;
    }
    const cacheGeneration = app.sensitiveCaches.generation;
    const pendingFilter = reset ? app.pendingCatalogFilter : null;
    if (pendingFilter) {
      app.pendingCatalogFilter = null;
      this.setData({
        categoryFilterId: pendingFilter.categoryId ?? "",
        supplierFilterId: pendingFilter.supplierId ?? "",
      });
    }
    const categoryFilterId = pendingFilter
      ? (pendingFilter.categoryId ?? "")
      : this.data.categoryFilterId;
    const supplierFilterId = pendingFilter
      ? (pendingFilter.supplierId ?? "")
      : this.data.supplierFilterId;
    const last = reset ? undefined : this.data.products[this.data.products.length - 1];
    this.setData({ errorMessage: "", loading: true, ...(reset ? { products: [] } : {}) });
    try {
      const products = await app.salesClient.catalogPage(shop.shop_id, {
        ...(categoryFilterId ? { categoryId: categoryFilterId } : {}),
        ...(last ? { cursorId: last.product_id } : {}),
        ...(last?.updated_at ? { cursorAt: last.updated_at } : {}),
        ...(last?.cursor_text ? { cursorText: last.cursor_text } : {}),
        limit: 50,
        ...(this.data.search ? { search: this.data.search } : {}),
        sort: this.data.sorts[this.data.sortIndex] as "barcode_asc" | "name_asc" | "updated_desc",
        ...(supplierFilterId ? { supplierId: supplierFilterId } : {}),
      });
      if (
        pageRuntime(this).sequence !== sequence ||
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.sessionStore.load() === null ||
        app.activeShop?.shop_id !== shop.shop_id
      ) {
        return;
      }
      const rows: ProductRow[] = products.map((product) => ({
        ...product,
        thumbnail_url: cachedThumbnail(shop.shop_id, product),
      }));
      const missing = rows.filter((item) => item.primary_image_version_id && !item.thumbnail_url);
      for (let offset = 0; app.imageClient && offset < missing.length; offset += 16) {
        const batch = missing.slice(offset, offset + 16);
        let imageResult: ProductImageReadResult;
        try {
          imageResult = await app.imageClient.readUrls(
            shop.shop_id,
            batch.flatMap((item) =>
              item.primary_image_version_id
                ? [
                    {
                      productId: item.product_id,
                      variant: "thumb" as const,
                      versionId: item.primary_image_version_id,
                    },
                  ]
                : [],
            ),
          );
        } catch {
          this.setData({ errorMessage: this.data.text.imageManagementUnavailable });
          break;
        }
        if (
          pageRuntime(this).sequence !== sequence ||
          app.sensitiveCaches.generation !== cacheGeneration ||
          app.sessionStore.load() === null ||
          app.activeShop?.shop_id !== shop.shop_id
        ) {
          return;
        }
        for (const image of imageResult.items) {
          if (image.status === "ready") imageCache.set(shop.shop_id, image);
        }
      }
      const hydrated = rows.map((item) => ({
        ...item,
        thumbnail_url: cachedThumbnail(shop.shop_id, item),
      }));
      if (
        pageRuntime(this).sequence !== sequence ||
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.sessionStore.load() === null ||
        app.activeShop?.shop_id !== shop.shop_id
      ) {
        return;
      }
      const ids = new Set(this.data.products.map((item) => item.product_id));
      this.setData({
        products: reset
          ? hydrated
          : [...this.data.products, ...hydrated.filter((item) => !ids.has(item.product_id))],
      });
    } catch {
      if (
        pageRuntime(this).sequence !== sequence ||
        app.sensitiveCaches.generation !== cacheGeneration
      ) {
        return;
      }
      this.setData({ errorMessage: this.data.text.offline });
    } finally {
      if (pageRuntime(this).sequence === sequence) {
        this.setData({ loading: false });
      }
    }
  },
  loadMore() {
    void this.refresh(false);
  },
  openProduct(event: WechatMiniprogram.BaseEvent) {
    wx.navigateTo({
      url: `/pages/product-detail/index?id=${encodeURIComponent(String(event.currentTarget.dataset.id))}`,
    });
  },
  createProduct() {
    if (!hasCatalogCapability(app.activeShop, "can_write_products")) return;
    wx.navigateTo({ url: "/pages/product-form/index?mode=create" });
  },
  openCategories() {
    wx.navigateTo({ url: "/pages/categories/index" });
  },
  openSuppliers() {
    wx.navigateTo({ url: "/pages/suppliers/index" });
  },
  openHistory() {
    wx.switchTab({ url: "/pages/history/index" });
  },
  viewArchived() {
    wx.navigateTo({ url: "/pages/catalog-lifecycle/index?type=product" });
  },
  clearCatalogFilter() {
    this.setData({ categoryFilterId: "", supplierFilterId: "" });
    void this.refresh(true);
  },
});
