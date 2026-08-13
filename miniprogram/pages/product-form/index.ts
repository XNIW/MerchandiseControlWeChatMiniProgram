import type { MerchandiseControlApp } from "../../app";
import type { CatalogMutationAttemptController } from "../../lib/catalog-mutation-client";
import {
  CatalogMutationContractError,
  type CatalogMutationInput,
  type CatalogMutationResult,
  type Category,
  type ProductDetail,
  type Supplier,
} from "../../lib/contracts";
import { translationsFor } from "../../locales/index";
import {
  catalogConflictAction,
  hasCatalogCapability,
  isCatalogRevisionConflict,
  mutationErrorTranslationKey,
  planProductSave,
  validateProductForm,
} from "../catalog-management";

const app = getApp<MerchandiseControlApp>();

interface PickerOption {
  readonly id: string;
  readonly label: string;
}

interface ProductSaveAction {
  attempt: CatalogMutationAttemptController | null;
  readonly fingerprint: string;
  expectedUpdatedAt: string;
  stageIndex: number;
  targetId: string;
}

interface ProductFormRuntime {
  saveAction: ProductSaveAction | undefined;
}

function runtime(page: unknown): ProductFormRuntime {
  return page as ProductFormRuntime;
}

async function runRetainedAttempt(
  action: ProductSaveAction,
  input: CatalogMutationInput,
): Promise<CatalogMutationResult> {
  const attempt = action.attempt ?? app.createCatalogMutationAttempt();
  if (!attempt) throw new CatalogMutationContractError("backend_temporary");
  action.attempt = attempt;
  const result =
    attempt.state.lifecycle === "retryable_error"
      ? await attempt.retry()
      : await attempt.start(input);
  action.attempt = null;
  return result;
}

function inputValue(event: WechatMiniprogram.Input): string {
  return event.detail.value;
}

function productBasePayload(product: ProductDetail): Record<string, unknown> {
  return {
    barcode: product.barcode,
    categoryId: product.category_id,
    itemNumber: product.item_number ?? "",
    productName: product.product_name ?? "",
    secondProductName: product.second_product_name ?? "",
    stockQuantity: product.stock_quantity,
    supplierId: product.supplier_id,
  };
}

function isRevisionConflict(error: unknown): boolean {
  return error instanceof CatalogMutationContractError && isCatalogRevisionConflict(error.code);
}

Page({
  data: {
    barcode: "",
    categories: [] as readonly Category[],
    categoryId: "",
    categoryIndex: 0,
    categoryOptions: [] as readonly PickerOption[],
    canChangePrices: false,
    currencyCode: "",
    dirty: false,
    errorMessage: "",
    formReady: false,
    itemNumber: "",
    loading: false,
    mode: "create" as "create" | "edit",
    originalBasePayload: "",
    originalPurchasePrice: null as number | null,
    originalRetailPrice: null as number | null,
    productId: "",
    productName: "",
    purchasePrice: "",
    retailPrice: "",
    saving: false,
    secondProductName: "",
    stockQuantity: "",
    supplierId: "",
    supplierIndex: 0,
    suppliers: [] as readonly Supplier[],
    supplierOptions: [] as readonly PickerOption[],
    text: translationsFor(app.locale),
    updatedAt: "",
  },
  async onLoad(options: Record<string, string | undefined>) {
    const mode = options.mode === "edit" ? "edit" : "create";
    const productId = options.id ?? "";
    this.setData({
      canChangePrices: hasCatalogCapability(app.activeShop, "can_change_prices"),
      currencyCode: app.activeShop?.currency_code ?? "",
      mode,
      productId,
      text: translationsFor(app.locale),
      formReady: false,
    });
    wx.setNavigationBarTitle({
      title: mode === "edit" ? this.data.text.editProduct : this.data.text.newProduct,
    });
    if (
      !app.activeShop ||
      !app.salesClient ||
      !hasCatalogCapability(app.activeShop, "can_write_products") ||
      (mode === "edit" && !productId)
    ) {
      this.setData({ errorMessage: this.data.text.permissionDenied });
      return;
    }
    this.setData({ loading: true });
    try {
      const reads: [
        Promise<readonly Category[]>,
        Promise<readonly Supplier[]>,
        Promise<ProductDetail | null>,
      ] = [
        app.salesClient.categories(app.activeShop.shop_id),
        app.salesClient.suppliers(app.activeShop.shop_id),
        mode === "edit"
          ? app.salesClient.productDetail(app.activeShop.shop_id, productId)
          : Promise.resolve(null),
      ];
      const [categories, suppliers, product] = await Promise.all(reads);
      if (mode === "edit" && product === null) {
        this.setData({ errorMessage: this.data.text.entityNotFound });
        return;
      }
      const categoryOptions: PickerOption[] = [
        { id: "", label: this.data.text.none },
        ...categories.map((item) => ({ id: item.category_id, label: item.category_name })),
      ];
      const supplierOptions: PickerOption[] = [
        { id: "", label: this.data.text.none },
        ...suppliers.map((item) => ({ id: item.supplier_id, label: item.supplier_name })),
      ];
      const basePayload = product ? productBasePayload(product) : null;
      this.setData({
        barcode: product?.barcode ?? "",
        categories,
        categoryId: product?.category_id ?? "",
        categoryIndex: Math.max(
          0,
          categoryOptions.findIndex((item) => item.id === (product?.category_id ?? "")),
        ),
        categoryOptions,
        errorMessage: "",
        formReady: true,
        itemNumber: product?.item_number ?? "",
        originalBasePayload: basePayload ? JSON.stringify(basePayload) : "",
        originalPurchasePrice: product?.purchase_price ?? null,
        originalRetailPrice: product?.retail_price ?? null,
        productName: product?.product_name ?? "",
        purchasePrice: product?.purchase_price?.toString() ?? "",
        retailPrice: product?.retail_price?.toString() ?? "",
        secondProductName: product?.second_product_name ?? "",
        stockQuantity: product?.stock_quantity?.toString() ?? "",
        supplierId: product?.supplier_id ?? "",
        supplierIndex: Math.max(
          0,
          supplierOptions.findIndex((item) => item.id === (product?.supplier_id ?? "")),
        ),
        suppliers,
        supplierOptions,
        updatedAt: product?.updated_at ?? "",
      });
    } catch {
      this.setData({ errorMessage: this.data.text.offline });
    } finally {
      this.setData({ loading: false });
    }
  },
  onUnload() {
    if (this.data.dirty) wx.disableAlertBeforeUnload();
  },
  markDirty(values: Record<string, unknown>) {
    const holder = runtime(this);
    if (holder.saveAction?.attempt?.state.lifecycle === "retryable_error") {
      holder.saveAction.attempt.reset();
    }
    holder.saveAction = undefined;
    this.setData({ ...values, dirty: true, errorMessage: "" });
    wx.enableAlertBeforeUnload({ message: this.data.text.unsavedChanges });
  },
  changeBarcode(event: WechatMiniprogram.Input) {
    this.markDirty({ barcode: inputValue(event) });
  },
  changeItemNumber(event: WechatMiniprogram.Input) {
    this.markDirty({ itemNumber: inputValue(event) });
  },
  changeProductName(event: WechatMiniprogram.Input) {
    this.markDirty({ productName: inputValue(event) });
  },
  changeSecondProductName(event: WechatMiniprogram.Input) {
    this.markDirty({ secondProductName: inputValue(event) });
  },
  changePurchasePrice(event: WechatMiniprogram.Input) {
    this.markDirty({ purchasePrice: inputValue(event) });
  },
  changeRetailPrice(event: WechatMiniprogram.Input) {
    this.markDirty({ retailPrice: inputValue(event) });
  },
  changeStockQuantity(event: WechatMiniprogram.Input) {
    this.markDirty({ stockQuantity: inputValue(event) });
  },
  chooseCategory(event: WechatMiniprogram.PickerChange) {
    const categoryIndex = Number(event.detail.value);
    this.markDirty({
      categoryId: this.data.categoryOptions[categoryIndex]?.id ?? "",
      categoryIndex,
    });
  },
  chooseSupplier(event: WechatMiniprogram.PickerChange) {
    const supplierIndex = Number(event.detail.value);
    this.markDirty({
      supplierId: this.data.supplierOptions[supplierIndex]?.id ?? "",
      supplierIndex,
    });
  },
  applyServerProduct(product: ProductDetail, preserveDraft: boolean) {
    const holder = runtime(this);
    holder.saveAction?.attempt?.reset();
    holder.saveAction = undefined;
    const baseline = {
      errorMessage: "",
      originalBasePayload: JSON.stringify(productBasePayload(product)),
      originalPurchasePrice: product.purchase_price,
      originalRetailPrice: product.retail_price,
      updatedAt: product.updated_at,
    };
    if (preserveDraft) {
      this.setData(baseline);
      return;
    }
    this.setData({
      ...baseline,
      barcode: product.barcode,
      categoryId: product.category_id ?? "",
      categoryIndex: Math.max(
        0,
        this.data.categoryOptions.findIndex((item) => item.id === (product.category_id ?? "")),
      ),
      dirty: false,
      itemNumber: product.item_number ?? "",
      productName: product.product_name ?? "",
      purchasePrice: product.purchase_price?.toString() ?? "",
      retailPrice: product.retail_price?.toString() ?? "",
      secondProductName: product.second_product_name ?? "",
      stockQuantity: product.stock_quantity?.toString() ?? "",
      supplierId: product.supplier_id ?? "",
      supplierIndex: Math.max(
        0,
        this.data.supplierOptions.findIndex((item) => item.id === (product.supplier_id ?? "")),
      ),
    });
    wx.disableAlertBeforeUnload();
  },
  async resolveRevisionConflict() {
    if (!app.activeShop || !app.salesClient || this.data.mode !== "edit") return;
    try {
      const product = await app.salesClient.productDetail(
        app.activeShop.shop_id,
        this.data.productId,
      );
      if (!product) {
        this.setData({ errorMessage: this.data.text.entityNotFound });
        return;
      }
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
        const action = catalogConflictAction(choice.tapIndex);
        if (action === "reload_server") this.applyServerProduct(product, false);
        if (action === "reapply_manually") this.applyServerProduct(product, true);
      } catch {
        // Native action-sheet cancellation intentionally keeps the local draft unchanged.
      }
    } catch {
      this.setData({ errorMessage: this.data.text.offline });
    }
  },
  async save() {
    if (this.data.saving || !app.activeShop) return;
    const validation = validateProductForm({
      barcode: this.data.barcode,
      categoryId: this.data.categoryId,
      itemNumber: this.data.itemNumber,
      productName: this.data.productName,
      purchasePrice: this.data.purchasePrice,
      retailPrice: this.data.retailPrice,
      secondProductName: this.data.secondProductName,
      stockQuantity: this.data.stockQuantity,
      supplierId: this.data.supplierId,
    });
    if (!validation.ok) {
      this.setData({ errorMessage: this.data.text[validation.errorKey] });
      return;
    }
    if (!app.catalogClient) {
      this.setData({ errorMessage: this.data.text.unavailable });
      return;
    }
    this.setData({ errorMessage: "", saving: true });
    try {
      const plan = planProductSave({
        canChangePrices: hasCatalogCapability(app.activeShop, "can_change_prices"),
        mode: this.data.mode,
        originalBasePayload: this.data.originalBasePayload,
        originalPurchasePrice: this.data.originalPurchasePrice,
        originalRetailPrice: this.data.originalRetailPrice,
        payload: validation.payload,
      });
      if (!plan.ok) {
        this.setData({ errorMessage: this.data.text[plan.errorKey] });
        return;
      }
      const { basePayload, stages } = plan;
      const fingerprint = JSON.stringify({
        mode: this.data.mode,
        payload: validation.payload,
        stages,
      });
      const holder = runtime(this);
      const action =
        holder.saveAction?.fingerprint === fingerprint
          ? holder.saveAction
          : {
              attempt: null,
              expectedUpdatedAt: this.data.updatedAt,
              fingerprint,
              stageIndex: 0,
              targetId: this.data.productId,
            };
      holder.saveAction = action;
      while (action.stageIndex < stages.length) {
        const stage = stages[action.stageIndex];
        if (!stage) break;
        const input: CatalogMutationInput =
          stage.kind === "create"
            ? {
                operation: "product_create",
                payload: validation.payload,
                shopId: app.activeShop.shop_id,
              }
            : stage.kind === "base"
              ? {
                  expectedUpdatedAt: action.expectedUpdatedAt,
                  operation: "product_update",
                  payload: basePayload,
                  shopId: app.activeShop.shop_id,
                  targetId: action.targetId,
                }
              : {
                  expectedUpdatedAt: action.expectedUpdatedAt,
                  operation: "product_price_update",
                  payload: { price: stage.price, priceType: stage.priceType },
                  shopId: app.activeShop.shop_id,
                  targetId: action.targetId,
                };
        const result = await runRetainedAttempt(action, input);
        action.targetId = result.targetId;
        action.expectedUpdatedAt = result.updatedAt;
        action.stageIndex += 1;
        this.setData({ updatedAt: result.updatedAt });
      }
      holder.saveAction = undefined;
      this.setData({ dirty: false });
      wx.disableAlertBeforeUnload();
      app.sensitiveCaches.invalidate();
      wx.showToast({ icon: "success", title: this.data.text.saved });
      setTimeout(() => wx.navigateBack(), 500);
    } catch (error) {
      const action = runtime(this).saveAction;
      if (action?.attempt?.state.lifecycle !== "retryable_error") {
        runtime(this).saveAction = undefined;
      }
      if (isRevisionConflict(error)) {
        this.setData({ errorMessage: this.data.text.conflictMessage });
        await this.resolveRevisionConflict();
        return;
      }
      const key =
        error instanceof CatalogMutationContractError
          ? mutationErrorTranslationKey(error.code)
          : "retryableError";
      this.setData({ errorMessage: this.data.text[key] });
    } finally {
      this.setData({ saving: false });
    }
  },
  retryLoad() {
    void this.onLoad({ id: this.data.productId, mode: this.data.mode });
  },
});
