import type { MerchandiseControlApp } from "../../app";
import type { CatalogMutationAttemptController } from "../../lib/catalog-mutation-client";
import { formatCatalogNumber } from "../../lib/catalog-numbers";
import {
  CatalogMutationContractError,
  type PriceHistoryEntry,
  type ProductDetail,
} from "../../lib/contracts";
import { ProductImageMutationError } from "../../lib/product-image-mutation-client";
import { type MiniSyncNotification, miniSyncEntityIds } from "../../lib/sync-coordinator";
import { translationsFor } from "../../locales/index";
import {
  catalogConflictAction,
  hasCatalogCapability,
  isCatalogRevisionConflict,
  mutationErrorTranslationKey,
  readErrorTranslationKey,
} from "../catalog-management";

const app = getApp<MerchandiseControlApp>();

type PriceRow = PriceHistoryEntry & {
  readonly price_text: string;
  readonly price_type_label: string;
};

interface DetailRuntime {
  previewEpoch?: number;
  finishPreview?: ((confirmed: boolean) => void) | undefined;
  imageRetryKey?: string | undefined;
  context?: string;
  mounted?: boolean;
  priceRefreshPending?: boolean;
  priceSequence?: number;
  priceCursor?: { at: string; id: string } | undefined;
  archiveAttempt: CatalogMutationAttemptController | null;
  rejectedArchiveId?: string | undefined;
  loadSequence?: number;
  productId: string;
  unsubscribeSync: (() => boolean) | undefined;
}

function runtime(page: unknown): DetailRuntime {
  return page as DetailRuntime;
}

function actionContext(page: unknown): () => boolean {
  const holder = runtime(page),
    generation = app.sessionStore.generation,
    shop = app.activeShop?.shop_id,
    product = holder.productId;
  return () =>
    holder.mounted !== false &&
    generation === app.sessionStore.generation &&
    shop === app.activeShop?.shop_id &&
    product === holder.productId;
}

function imageErrorMessage(error: unknown, text: ReturnType<typeof translationsFor>): string {
  if (error instanceof CatalogMutationContractError) {
    return text[mutationErrorTranslationKey(error.code)];
  }
  if (error instanceof ProductImageMutationError) {
    if (error.code === "image_permission_denied") return text.imagePermissionDenied;
    if (error.code === "image_operation_cancelled") return text.imageOperationCancelled;
    if (error.code === "session_expired") return text.sessionExpired;
    return text.imageUploadFailed;
  }
  return text.imageUploadFailed;
}

function isRevisionConflict(error: unknown): boolean {
  return error instanceof CatalogMutationContractError && isCatalogRevisionConflict(error.code);
}

Page({
  data: {
    canEdit: false,
    canManageImages: false,
    currencyCode: "",
    errorMessage: "",
    imageBusy: false,
    imageUrl: "",
    imagePreviewUrl: "",
    imagePreviewThumb: "",
    imagePermissionDenied: false,
    loading: true,
    mutating: false,
    prices: [] as readonly PriceRow[],
    pricesLoading: false,
    pricesMore: true,
    pricesError: "",
    retailPriceText: "",
    stockText: "",
    product: null as ProductDetail | null,
    text: translationsFor(app.locale),
  },
  onLoad(options: Record<string, string | undefined>) {
    runtime(this).mounted = true;
    runtime(this).productId = options.id ?? "";
    runtime(this).archiveAttempt = null;
  },
  onShow() {
    this.setData({ text: translationsFor(app.locale) });
    wx.setNavigationBarTitle({ title: this.data.text.product });
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = app.syncCoordinator?.subscribe((notification) =>
      this.applySync(notification),
    );
    void this.load();
  },
  onHide() {
    runtime(this).previewEpoch = (runtime(this).previewEpoch ?? 0) + 1;
    this.cancelImagePreview();
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = undefined;
  },
  onUnload() {
    this.cancelImagePreview();
    runtime(this).mounted = false;
    runtime(this).loadSequence = (runtime(this).loadSequence ?? 0) + 1;
    runtime(this).priceSequence = (runtime(this).priceSequence ?? 0) + 1;
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = undefined;
  },
  async applySync(notification: MiniSyncNotification) {
    if (notification.shopId !== app.activeShop?.shop_id) return;
    if (
      notification.kind === "reconcile" ||
      miniSyncEntityIds(notification, "product_ids", 250).includes(runtime(this).productId)
    ) {
      await this.load();
    }
  },
  async load() {
    const productId = runtime(this).productId;
    const shop = app.activeShop;
    if (!productId || !shop || !app.salesClient) {
      this.setData({ errorMessage: this.data.text.error, loading: false });
      return;
    }
    const holder = runtime(this);
    const context = `${app.sessionStore.generation}:${shop.shop_id}:${productId}`;
    if (holder.context !== context) {
      this.cancelImagePreview();
      holder.imageRetryKey = undefined;
      holder.context = context;
      holder.priceCursor = undefined;
      holder.priceSequence = (holder.priceSequence ?? 0) + 1;
      this.setData({
        imageBusy: false,
        imagePermissionDenied: false,
        prices: [],
        pricesMore: true,
        pricesLoading: false,
        pricesError: "",
        product: null,
        imageUrl: "",
      });
    }
    const sequence = (holder.loadSequence ?? 0) + 1;
    holder.loadSequence = sequence;
    const sessionGeneration = app.sessionStore.generation;
    const cacheGeneration = app.sensitiveCaches.generation;
    const isCurrent = () =>
      holder.mounted !== false &&
      holder.loadSequence === sequence &&
      app.sessionStore.generation === sessionGeneration &&
      app.sensitiveCaches.generation === cacheGeneration &&
      app.activeShop?.shop_id === shop.shop_id;
    this.setData({
      canEdit: hasCatalogCapability(shop, "can_write_products"),
      canManageImages: hasCatalogCapability(shop, "can_manage_images"),
      currencyCode: shop.currency_code,
      errorMessage: "",
      loading: true,
    });
    try {
      const product = await app.salesClient.productDetail(shop.shop_id, productId);
      if (!isCurrent()) return;
      if (!product) {
        this.setData({
          errorMessage: this.data.text.entityNotFound,
          loading: false,
          product: null,
        });
        return;
      }
      this.setData({
        imageUrl: "",
        loading: false,
        retailPriceText: formatCatalogNumber(product.retail_price),
        stockText: formatCatalogNumber(product.stock_quantity),
        product,
      });
      void this.loadPrices(true);
      if (product.primary_image_version_id) {
        if (!app.imageClient) {
          this.setData({ errorMessage: this.data.text.imageManagementUnavailable });
        } else {
          try {
            const images = await app.imageClient.readUrls(shop.shop_id, [
              {
                productId,
                variant: "main",
                versionId: product.primary_image_version_id,
              },
            ]);
            if (!isCurrent()) return;
            const image = images.items[0];
            if (image?.status === "ready") this.setData({ imageUrl: image.signedUrl });
          } catch (error) {
            if (isCurrent())
              this.setData({ errorMessage: imageErrorMessage(error, this.data.text) });
          }
        }
      }
    } catch (error) {
      if (isCurrent())
        this.setData({
          errorMessage: this.data.text[readErrorTranslationKey(error)],
          loading: false,
        });
    }
  },
  async loadPrices(refresh = false) {
    const holder = runtime(this);
    const shop = app.activeShop;
    const api = app.salesClient;
    if (!shop || !api || (!refresh && !this.data.pricesMore)) return;
    if (this.data.pricesLoading) {
      if (refresh) holder.priceRefreshPending = true;
      return;
    }
    const context = holder.context;
    const generation = app.sessionStore.generation;
    const sequence = (holder.priceSequence ?? 0) + 1;
    holder.priceSequence = sequence;
    const cursor = refresh ? undefined : holder.priceCursor;
    const valid = () =>
      holder.context === context &&
      holder.priceSequence === sequence &&
      app.sessionStore.generation === generation &&
      app.activeShop?.shop_id === shop.shop_id;
    this.setData({ pricesLoading: true, pricesError: "" });
    try {
      const page = await api.priceHistory(shop.shop_id, holder.productId, {
        limit: 50,
        ...(cursor ? { beforeAt: cursor.at, beforeId: cursor.id } : {}),
      });
      if (!valid()) return;
      const mapped = page.map((price) => ({
        ...price,
        price_text: formatCatalogNumber(price.price),
        price_type_label:
          price.price_type === "PURCHASE"
            ? this.data.text.purchasePrice
            : this.data.text.retailPrice,
      }));
      const prices = refresh
        ? [
            ...mapped,
            ...this.data.prices.filter((p) => !page.some((n) => n.price_id === p.price_id)),
          ]
        : [
            ...this.data.prices,
            ...mapped.filter((p) => !this.data.prices.some((n) => n.price_id === p.price_id)),
          ];
      {
        const last = page[page.length - 1];
        holder.priceCursor = last ? { at: last.effective_at, id: last.price_id } : undefined;
        this.setData({ pricesMore: page.length === 50 });
      }
      prices.sort(
        (a, b) =>
          b.effective_at.localeCompare(a.effective_at) || b.price_id.localeCompare(a.price_id),
      );
      this.setData({ prices });
    } catch {
      if (valid()) this.setData({ pricesError: this.data.text.retryableError });
    } finally {
      if (valid()) {
        this.setData({ pricesLoading: false });
        if (holder.priceRefreshPending) {
          holder.priceRefreshPending = false;
          void this.loadPrices(true);
        }
      }
    }
  },
  loadMorePrices() {
    void this.loadPrices(false);
  },
  edit() {
    if (!this.data.canEdit || !runtime(this).productId) return;
    wx.navigateTo({
      url: `/pages/product-form/index?mode=edit&id=${encodeURIComponent(runtime(this).productId)}`,
    });
  },
  async archive() {
    if (this.data.mutating || !this.data.canEdit || !this.data.product || !app.activeShop) return;
    const valid = actionContext(this);
    const existingAttempt = runtime(this).archiveAttempt;
    if (existingAttempt?.state.lifecycle !== "retryable_error") {
      const confirmation = await wx.showModal({
        cancelText: this.data.text.cancel,
        confirmText: this.data.text.archive,
        content: this.data.text.archiveConfirm,
      });
      if (!confirmation.confirm || !valid()) return;
    }
    const attempt = existingAttempt ?? app.createCatalogMutationAttempt();
    if (!attempt) {
      this.setData({ errorMessage: this.data.text.unavailable });
      return;
    }
    runtime(this).archiveAttempt = attempt;
    this.setData({ errorMessage: "", mutating: true });
    try {
      const input = {
        expectedUpdatedAt: this.data.product.updated_at,
        operation: "product_archive" as const,
        payload: { reason: "mini_program_user_action" },
        shopId: app.activeShop.shop_id,
        targetId: this.data.product.product_id,
      };
      if (attempt.state.lifecycle === "retryable_error") await attempt.retry();
      else await attempt.start(input);
      if (!valid()) return;
      runtime(this).archiveAttempt = null;
      app.sensitiveCaches.invalidate();
      wx.navigateBack();
    } catch (error) {
      if (!valid()) return;
      if (attempt.state.lifecycle !== "retryable_error") runtime(this).archiveAttempt = null;
      if (isRevisionConflict(error)) {
        runtime(this).rejectedArchiveId = attempt.operationId ?? undefined;
        this.setData({ errorMessage: this.data.text.conflictMessage });
        await this.resolveArchiveConflict();
        return;
      }
      const key =
        error instanceof CatalogMutationContractError
          ? mutationErrorTranslationKey(error.code)
          : "retryableError";
      this.setData({ errorMessage: this.data.text[key] });
    } finally {
      if (valid()) this.setData({ mutating: false });
    }
  },
  async resolveArchiveConflict() {
    const valid = actionContext(this);
    await this.load();
    if (!valid()) return;
    const product = this.data.product;
    if (!product) return;
    const preview = await wx.showModal({
      cancelText: this.data.text.cancel,
      confirmText: this.data.text.manage,
      content: `${this.data.text.productName}: ${product.product_name ?? ""}\n${this.data.text.barcode}: ${product.barcode}\n${this.data.text.modified}: ${product.updated_at}`,
      title: this.data.text.conflictTitle,
    });
    if (!preview.confirm || !valid()) return;
    try {
      const choice = await wx.showActionSheet({
        itemList: [
          this.data.text.reloadServer,
          this.data.text.reapplyManually,
          this.data.text.cancel,
        ],
      });
      if (!valid()) return;
      const action = catalogConflictAction(choice.tapIndex);
      if (action !== "cancel" && runtime(this).rejectedArchiveId && app.activeShop) {
        app.outbox.discardOperation(
          app.activeShop.shop_id,
          runtime(this).rejectedArchiveId as string,
        );
        runtime(this).rejectedArchiveId = undefined;
      }
      if (action === "reapply_manually") void this.archive();
    } catch {
      // Native action-sheet cancellation leaves the refreshed server state visible.
    }
  },
  async replaceImage(event: WechatMiniprogram.BaseEvent) {
    const valid = actionContext(this);
    const previewEpoch = runtime(this).previewEpoch;
    const source = event.currentTarget.dataset.source === "album" ? "album" : "camera";
    if (this.data.imageBusy || !this.data.canManageImages || !app.activeShop) return;
    if (!app.imageClient) {
      this.setData({ errorMessage: this.data.text.imageManagementUnavailable });
      return;
    }
    if (this.data.product?.primary_image_version_id) {
      const confirmation = await wx.showModal({
        cancelText: this.data.text.cancel,
        confirmText: this.data.text.replaceImage,
        content: this.data.text.replaceImageConfirm,
      });
      if (!confirmation.confirm || !valid()) return;
    }
    this.setData({ errorMessage: "", imageBusy: true, imagePermissionDenied: false });
    try {
      await app.imageClient.selectAndReplace(
        app.activeShop.shop_id,
        runtime(this).productId,
        source,
        async (preview) => {
          if (!valid() || runtime(this).previewEpoch !== previewEpoch) return false;
          this.setData({ imagePreviewUrl: preview.mainPath, imagePreviewThumb: preview.thumbPath });
          const confirmed = await new Promise<boolean>((resolve) => {
            runtime(this).finishPreview = resolve;
          });
          return confirmed && valid() && runtime(this).previewEpoch === previewEpoch;
        },
      );
      if (!valid()) return;
      app.sensitiveCaches.invalidate();
      await this.load();
    } catch (error) {
      if (valid())
        this.setData({
          errorMessage: imageErrorMessage(error, this.data.text),
          imagePermissionDenied:
            error instanceof ProductImageMutationError && error.code === "image_permission_denied",
        });
    } finally {
      if (valid()) this.setData({ imageBusy: false });
    }
  },
  confirmImagePreview() {
    const finish = runtime(this).finishPreview;
    runtime(this).finishPreview = undefined;
    this.setData({ imagePreviewUrl: "", imagePreviewThumb: "" });
    finish?.(true);
  },
  cancelImagePreview() {
    const finish = runtime(this).finishPreview;
    runtime(this).finishPreview = undefined;
    this.setData({ imagePreviewUrl: "", imagePreviewThumb: "" });
    finish?.(false);
  },
  async imageFailed(event: WechatMiniprogram.BaseEvent) {
    const product = this.data.product,
      shop = app.activeShop;
    const { version, url } = event.currentTarget.dataset;
    if (
      !product ||
      !shop ||
      !app.imageClient ||
      version !== product.primary_image_version_id ||
      url !== this.data.imageUrl
    )
      return;
    const valid = actionContext(this),
      holder = runtime(this),
      sequence = holder.loadSequence;
    const key = `${app.sessionStore.generation}:${shop.shop_id}:${product.product_id}:${version}`;
    this.setData({ imageUrl: "" });
    if (holder.imageRetryKey === key) return;
    holder.imageRetryKey = key;
    try {
      const result = await app.imageClient.readUrls(shop.shop_id, [
        { productId: product.product_id, versionId: version, variant: "main" },
      ]);
      if (
        !valid() ||
        holder.loadSequence !== sequence ||
        this.data.product?.primary_image_version_id !== version
      )
        return;
      const image = result.items.find(
        (item) =>
          item.productId === product.product_id &&
          item.versionId === version &&
          item.variant === "main",
      );
      if (image?.status === "ready") this.setData({ imageUrl: image.signedUrl });
    } catch {
      // Leave the placeholder after a failed bounded renewal.
    }
  },
  async removeImage() {
    const valid = actionContext(this);
    const versionId = this.data.product?.primary_image_version_id;
    if (this.data.imageBusy || !this.data.canManageImages || !app.activeShop || !versionId) return;
    if (!app.imageClient) {
      this.setData({ errorMessage: this.data.text.imageManagementUnavailable });
      return;
    }
    const confirmation = await wx.showModal({
      cancelText: this.data.text.cancel,
      confirmText: this.data.text.removeImage,
      content: this.data.text.removeImageConfirm,
    });
    if (!confirmation.confirm || !valid()) return;
    this.setData({ errorMessage: "", imageBusy: true });
    try {
      await app.imageClient.remove(app.activeShop.shop_id, runtime(this).productId, versionId);
      if (!valid()) return;
      app.sensitiveCaches.invalidate();
      await this.load();
    } catch (error) {
      if (valid()) this.setData({ errorMessage: imageErrorMessage(error, this.data.text) });
    } finally {
      if (valid()) this.setData({ imageBusy: false });
    }
  },
});
