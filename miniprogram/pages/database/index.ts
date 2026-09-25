import type { MerchandiseControlApp } from "../../app";
import { formatCatalogNumber } from "../../lib/catalog-numbers";
import type { CatalogProduct } from "../../lib/contracts";
import { ProductImageCache } from "../../lib/product-image-cache";
import type { ProductImageReadResult } from "../../lib/product-image-mutation-client";
import type { MiniSyncNotification } from "../../lib/sync-coordinator";
import { translationsFor } from "../../locales/index";
import { hasCatalogCapability, readErrorTranslationKey } from "../catalog-management";

type ProductRow = CatalogProduct & {
  readonly price_text: string;
  readonly thumbnail_url: string | null;
};
const app = getApp<MerchandiseControlApp>();
const imageCache = new ProductImageCache(20, app.sessionStore);
app.sensitiveCaches.register(imageCache, ["catalog", "prices"]);

interface DatabaseRuntime {
  sequence?: number;
  mounted?: boolean;
  imageEpoch?: number;
  imageRetries?: Set<string>;
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
    pageRuntime(this).mounted = true;
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
    pageRuntime(this).mounted = false;
    pageRuntime(this).sequence = (pageRuntime(this).sequence ?? 0) + 1;
    pageRuntime(this).imageEpoch = (pageRuntime(this).imageEpoch ?? 0) + 1;
    pageRuntime(this).unsubscribeSync?.();
    pageRuntime(this).unsubscribeSync = undefined;
  },
  async applySync(notification: MiniSyncNotification) {
    if (!app.featureReady) return;
    const shop = app.activeShop;
    if (!shop || notification.shopId !== shop.shop_id || !app.salesClient) return;
    if (notification.kind === "reconcile") {
      await this.refresh(true, true);
      return;
    }
    // Reload only the already visible window through canonical keyset pages.
    // This covers every changed ID (including compact events), preserves server
    // ordering/filters and handles archived rows without per-entity fan-out.
    if (
      notification.events.some((event) => event.domain === "catalog" || event.domain === "prices")
    ) {
      await this.refresh(true, true);
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
  async refresh(reset: boolean, preserveWindow = false) {
    if (reset) {
      pageRuntime(this).imageRetries = new Set();
      pageRuntime(this).imageEpoch = (pageRuntime(this).imageEpoch ?? 0) + 1;
    }
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
    const windowSize = preserveWindow ? Math.max(50, this.data.products.length) : 50;
    let last: CatalogProduct | undefined = reset
      ? undefined
      : this.data.products[this.data.products.length - 1];
    this.setData({
      errorMessage: "",
      loading: true,
      ...(reset && !preserveWindow ? { products: [] } : {}),
    });
    try {
      const products: CatalogProduct[] = [];
      while (products.length < windowSize) {
        const batch = await app.salesClient.catalogPage(shop.shop_id, {
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
        products.push(...batch);
        if (batch.length < 50) break;
        const next = batch[batch.length - 1];
        if (!next || next.product_id === last?.product_id)
          throw new Error("catalog_cursor_invalid");
        last = next;
      }
      const rows: ProductRow[] = products.map((product) => ({
        ...product,
        price_text: formatCatalogNumber(product.retail_price),
        thumbnail_url: cachedThumbnail(shop.shop_id, product),
      }));
      const missing = rows.filter((item) => item.primary_image_version_id && !item.thumbnail_url);
      const visibleUrls = new Map<string, string>();
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
          if (
            pageRuntime(this).sequence !== sequence ||
            app.sensitiveCaches.generation !== cacheGeneration ||
            app.activeShop?.shop_id !== shop.shop_id
          )
            return;
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
          if (image.status === "ready") {
            imageCache.set(shop.shop_id, image);
            visibleUrls.set(`${image.productId}:${image.versionId}`, image.signedUrl);
          }
        }
      }
      const hydrated = rows.map((item) => ({
        ...item,
        thumbnail_url:
          visibleUrls.get(`${item.product_id}:${item.primary_image_version_id}`) ??
          item.thumbnail_url,
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
    } catch (error) {
      if (
        pageRuntime(this).sequence !== sequence ||
        app.sensitiveCaches.generation !== cacheGeneration
      ) {
        return;
      }
      this.setData({ errorMessage: this.data.text[readErrorTranslationKey(error)] });
      if (preserveWindow) throw new Error("catalog_refresh_failed");
    } finally {
      if (pageRuntime(this).sequence === sequence) {
        this.setData({ loading: false });
      }
    }
  },
  async imageFailed(event: WechatMiniprogram.BaseEvent) {
    const { id, version, url } = event.currentTarget.dataset;
    const row = this.data.products.find(
      (item) =>
        item.product_id === id &&
        item.primary_image_version_id === version &&
        item.thumbnail_url === url,
    );
    const shop = app.activeShop;
    if (!row || !shop || !app.imageClient || app.sessionStore.load() === null) return;
    const holder = pageRuntime(this),
      imageEpoch = holder.imageEpoch,
      generation = app.sessionStore.generation,
      cacheGeneration = app.sensitiveCaches.generation;
    holder.imageRetries ??= new Set();
    const retries = holder.imageRetries;
    const key = `${generation}:${shop.shop_id}:${id}:${version}`;
    this.setData({
      products: this.data.products.map((item) =>
        item === row ? { ...item, thumbnail_url: null } : item,
      ),
    });
    if (retries.has(key)) return;
    retries.add(key);
    try {
      const result = await app.imageClient.readUrls(shop.shop_id, [
        { productId: row.product_id, versionId: version, variant: "thumb" },
      ]);
      if (
        holder.mounted === false ||
        holder.imageEpoch !== imageEpoch ||
        app.sessionStore.generation !== generation ||
        app.sensitiveCaches.generation !== cacheGeneration ||
        app.activeShop?.shop_id !== shop.shop_id
      )
        return;
      const image = result.items.find(
        (item) => item.productId === id && item.versionId === version && item.variant === "thumb",
      );
      if (image?.status !== "ready") return;
      imageCache.set(shop.shop_id, image);
      this.setData({
        products: this.data.products.map((item) =>
          item.product_id === id && item.primary_image_version_id === version
            ? { ...item, thumbnail_url: image.signedUrl }
            : item,
        ),
      });
    } catch {
      // Keep the placeholder after one bounded renewal; refresh/onShow allows retry.
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
