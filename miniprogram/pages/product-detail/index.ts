import type { MerchandiseControlApp } from "../../app";
import type { CatalogMutationAttemptController } from "../../lib/catalog-mutation-client";
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
} from "../catalog-management";

const app = getApp<MerchandiseControlApp>();

type PriceRow = PriceHistoryEntry & { readonly price_type_label: string };

interface DetailRuntime {
  archiveAttempt: CatalogMutationAttemptController | null;
  loadSequence?: number;
  productId: string;
  unsubscribeSync: (() => boolean) | undefined;
}

function runtime(page: unknown): DetailRuntime {
  return page as DetailRuntime;
}

function imageErrorMessage(error: unknown, text: ReturnType<typeof translationsFor>): string {
  if (error instanceof CatalogMutationContractError) {
    return text[mutationErrorTranslationKey(error.code)];
  }
  if (error instanceof ProductImageMutationError) {
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
    loading: true,
    mutating: false,
    prices: [] as readonly PriceRow[],
    product: null as ProductDetail | null,
    text: translationsFor(app.locale),
  },
  onLoad(options: Record<string, string | undefined>) {
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
    runtime(this).unsubscribeSync?.();
    runtime(this).unsubscribeSync = undefined;
  },
  onUnload() {
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
    const sequence = (holder.loadSequence ?? 0) + 1;
    holder.loadSequence = sequence;
    const sessionGeneration = app.sessionStore.generation;
    const cacheGeneration = app.sensitiveCaches.generation;
    const isCurrent = () =>
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
      const [product, prices] = await Promise.all([
        app.salesClient.productDetail(shop.shop_id, productId),
        app.salesClient.priceHistory(shop.shop_id, productId),
      ]);
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
        prices: prices.map((price) => ({
          ...price,
          price_type_label:
            price.price_type === "PURCHASE"
              ? this.data.text.purchasePrice
              : this.data.text.retailPrice,
        })),
        product,
      });
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
            this.setData({ errorMessage: imageErrorMessage(error, this.data.text) });
          }
        }
      }
    } catch {
      if (isCurrent()) this.setData({ errorMessage: this.data.text.offline, loading: false });
    }
  },
  edit() {
    if (!this.data.canEdit || !runtime(this).productId) return;
    wx.navigateTo({
      url: `/pages/product-form/index?mode=edit&id=${encodeURIComponent(runtime(this).productId)}`,
    });
  },
  async archive() {
    if (this.data.mutating || !this.data.canEdit || !this.data.product || !app.activeShop) return;
    const existingAttempt = runtime(this).archiveAttempt;
    if (existingAttempt?.state.lifecycle !== "retryable_error") {
      const confirmation = await wx.showModal({
        cancelText: this.data.text.cancel,
        confirmText: this.data.text.archive,
        content: this.data.text.archiveConfirm,
      });
      if (!confirmation.confirm) return;
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
      runtime(this).archiveAttempt = null;
      app.sensitiveCaches.invalidate();
      wx.navigateBack();
    } catch (error) {
      if (attempt.state.lifecycle !== "retryable_error") runtime(this).archiveAttempt = null;
      if (isRevisionConflict(error)) {
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
      this.setData({ mutating: false });
    }
  },
  async resolveArchiveConflict() {
    await this.load();
    const product = this.data.product;
    if (!product) return;
    const preview = await wx.showModal({
      cancelText: this.data.text.cancel,
      confirmText: this.data.text.manage,
      content: `${this.data.text.productName}: ${product.product_name ?? ""}\n${this.data.text.barcode}: ${product.barcode}\n${this.data.text.modified}: ${product.updated_at}`,
      title: this.data.text.conflictTitle,
    });
    if (!preview.confirm) return;
    try {
      const choice = await wx.showActionSheet({
        itemList: [
          this.data.text.reloadServer,
          this.data.text.reapplyManually,
          this.data.text.cancel,
        ],
      });
      if (catalogConflictAction(choice.tapIndex) === "reapply_manually") void this.archive();
    } catch {
      // Native action-sheet cancellation leaves the refreshed server state visible.
    }
  },
  async replaceImage() {
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
      if (!confirmation.confirm) return;
    }
    this.setData({ errorMessage: "", imageBusy: true });
    try {
      await app.imageClient.selectAndReplace(app.activeShop.shop_id, runtime(this).productId);
      app.sensitiveCaches.invalidate();
      await this.load();
    } catch (error) {
      this.setData({ errorMessage: imageErrorMessage(error, this.data.text) });
    } finally {
      this.setData({ imageBusy: false });
    }
  },
  async removeImage() {
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
    if (!confirmation.confirm) return;
    this.setData({ errorMessage: "", imageBusy: true });
    try {
      await app.imageClient.remove(app.activeShop.shop_id, runtime(this).productId, versionId);
      app.sensitiveCaches.invalidate();
      await this.load();
    } catch (error) {
      this.setData({ errorMessage: imageErrorMessage(error, this.data.text) });
    } finally {
      this.setData({ imageBusy: false });
    }
  },
});
