import type { MerchandiseControlApp } from "../../app";
import { createCatalogMutationAttemptIdentifiers } from "../../lib/catalog-mutation-client";
import { formatCatalogNumber } from "../../lib/catalog-numbers";
import {
  CatalogMutationContractError,
  type CatalogMutationInput,
  type Category,
  type ProductDetail,
  type Supplier,
} from "../../lib/contracts";
import { createWeChatPlatform } from "../../lib/platform";
import { translationsFor } from "../../locales/index";
import {
  catalogConflictAction,
  hasCatalogCapability,
  isCatalogRevisionConflict,
  mutationErrorTranslationKey,
  planProductSave,
  readErrorTranslationKey,
  validateProductForm,
} from "../catalog-management";

const app = getApp<MerchandiseControlApp>();

interface PickerOption {
  readonly id: string;
  readonly label: string;
}

interface ProductSaveAction {
  readonly fingerprint: string;
  readonly intentId: string;
}
interface ProductFormRuntime {
  saveAction: ProductSaveAction | undefined;
  mounted: boolean;
  generation: number;
  shopId: string;
  loadSequence: number;
}
function runtime(page: unknown): ProductFormRuntime {
  return page as ProductFormRuntime;
}
function current(page: unknown): boolean {
  const r = runtime(page);
  return (
    r.mounted &&
    r.generation === app.sessionStore.generation &&
    r.shopId === app.activeShop?.shop_id &&
    app.sessionStore.load() !== null
  );
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
    categorySearch: "",
    supplierSearch: "",
    categoryAppliedSearch: "",
    supplierAppliedSearch: "",
    categoryMore: true,
    supplierMore: true,
    relationsLoading: false,
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
    originalStockQuantity: null as number | null,
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
    const holder = runtime(this);
    holder.mounted = true;
    holder.generation = app.sessionStore.generation;
    holder.shopId = app.activeShop?.shop_id ?? "";
    const sequence = (holder.loadSequence ?? 0) + 1;
    holder.loadSequence = sequence;
    holder.saveAction = undefined;
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
      if (!current(this) || holder.loadSequence !== sequence) return;
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
      if (product?.category_id && !categoryOptions.some((o) => o.id === product.category_id))
        categoryOptions.push({
          id: product.category_id,
          label: product.category_name ?? product.category_id,
        });
      if (product?.supplier_id && !supplierOptions.some((o) => o.id === product.supplier_id))
        supplierOptions.push({
          id: product.supplier_id,
          label: product.supplier_name ?? product.supplier_id,
        });
      const basePayload = product ? productBasePayload(product) : null;
      this.setData({
        barcode: product?.barcode ?? "",
        categories,
        categoryMore: categories.length === 100,
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
        originalStockQuantity: product?.stock_quantity ?? null,
        productName: product?.product_name ?? "",
        purchasePrice: formatCatalogNumber(product?.purchase_price),
        retailPrice: formatCatalogNumber(product?.retail_price),
        secondProductName: product?.second_product_name ?? "",
        stockQuantity: formatCatalogNumber(product?.stock_quantity),
        supplierId: product?.supplier_id ?? "",
        supplierIndex: Math.max(
          0,
          supplierOptions.findIndex((item) => item.id === (product?.supplier_id ?? "")),
        ),
        suppliers,
        supplierMore: suppliers.length === 100,
        supplierOptions,
        updatedAt: product?.updated_at ?? "",
      });
    } catch (error) {
      if (current(this))
        this.setData({ errorMessage: this.data.text[readErrorTranslationKey(error)] });
    } finally {
      if (current(this)) this.setData({ loading: false });
    }
  },
  onShow() {
    if (runtime(this).shopId && !current(this))
      this.setData({
        formReady: false,
        errorMessage: this.data.text.sessionExpired,
        barcode: "",
        productName: "",
        purchasePrice: "",
        retailPrice: "",
        stockQuantity: "",
      });
  },
  onUnload() {
    runtime(this).mounted = false;
    runtime(this).loadSequence = (runtime(this).loadSequence ?? 0) + 1;
    if (this.data.dirty) wx.disableAlertBeforeUnload();
  },
  markDirty(values: Record<string, unknown>) {
    const holder = runtime(this);
    if (!current(this) || this.data.saving || holder.saveAction) {
      this.setData({ errorMessage: this.data.text.retryableError });
      return;
    }
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
  searchRelations(event: WechatMiniprogram.Input) {
    const type = event.currentTarget.dataset.type === "supplier" ? "supplier" : "category";
    this.setData({ [type + "Search"]: event.detail.value });
  },
  findRelations(event: WechatMiniprogram.BaseEvent) {
    void this.loadRelations(
      event.currentTarget.dataset.type === "supplier" ? "supplier" : "category",
      false,
    );
  },
  moreRelations(event: WechatMiniprogram.BaseEvent) {
    void this.loadRelations(
      event.currentTarget.dataset.type === "supplier" ? "supplier" : "category",
      true,
    );
  },
  async loadRelations(type: "category" | "supplier", append: boolean) {
    if (!current(this) || !app.salesClient || this.data.relationsLoading) return;
    if (
      type === "category"
        ? this.data.categorySearch !== this.data.categoryAppliedSearch
        : this.data.supplierSearch !== this.data.supplierAppliedSearch
    )
      append = false;
    this.setData({ relationsLoading: true });
    const sequence = runtime(this).loadSequence;
    try {
      const search = type === "category" ? this.data.categorySearch : this.data.supplierSearch;
      const old =
        type === "category"
          ? this.data.categories.map((i) => ({ id: i.category_id, name: i.category_name }))
          : this.data.suppliers.map((i) => ({ id: i.supplier_id, name: i.supplier_name }));
      const last = append ? old[old.length - 1] : undefined;
      const options = last ? { afterName: last.name, afterId: last.id } : {};
      const page =
        type === "category"
          ? await app.salesClient.categories(runtime(this).shopId, search || undefined, options)
          : await app.salesClient.suppliers(runtime(this).shopId, search || undefined, options);
      if (!current(this) || sequence !== runtime(this).loadSequence) return;
      const mapped = page.map((i) =>
        "category_id" in i
          ? { id: i.category_id, label: i.category_name }
          : { id: i.supplier_id, label: i.supplier_name },
      );
      const selectedId = type === "category" ? this.data.categoryId : this.data.supplierId;
      const prior = type === "category" ? this.data.categoryOptions : this.data.supplierOptions;
      const selected = prior.find((o) => o.id === selectedId);
      const rows = append
        ? [...prior.filter((o) => o.id), ...mapped.filter((o) => !prior.some((p) => p.id === o.id))]
        : mapped;
      if (selected?.id && !rows.some((o) => o.id === selected.id)) rows.unshift(selected);
      const picker = [{ id: "", label: this.data.text.none }, ...rows];
      this.setData({
        [type === "category" ? "categories" : "suppliers"]: append
          ? [...(type === "category" ? this.data.categories : this.data.suppliers), ...page]
          : page,
        [type + "Options"]: picker,
        [type + "Index"]: Math.max(
          0,
          picker.findIndex((o) => o.id === selectedId),
        ),
        [type + "More"]: page.length === 100,
        [type + "AppliedSearch"]: search,
      });
    } catch {
      if (current(this)) this.setData({ errorMessage: this.data.text.retryableError });
    } finally {
      if (current(this)) this.setData({ relationsLoading: false });
    }
  },
  applyServerProduct(product: ProductDetail, preserveDraft: boolean) {
    const holder = runtime(this);
    if (holder.saveAction) app.outbox.discardIntent(holder.shopId, holder.saveAction.intentId);
    holder.saveAction = undefined;
    const baseline = {
      errorMessage: "",
      originalBasePayload: JSON.stringify(productBasePayload(product)),
      originalPurchasePrice: product.purchase_price,
      originalRetailPrice: product.retail_price,
      originalStockQuantity: product.stock_quantity,
      updatedAt: product.updated_at,
    };
    if (preserveDraft) {
      this.setData(baseline);
      return;
    }
    const categoryOptions = [...this.data.categoryOptions];
    const supplierOptions = [...this.data.supplierOptions];
    if (product.category_id && !categoryOptions.some((o) => o.id === product.category_id))
      categoryOptions.push({
        id: product.category_id,
        label: product.category_name ?? product.category_id,
      });
    if (product.supplier_id && !supplierOptions.some((o) => o.id === product.supplier_id))
      supplierOptions.push({
        id: product.supplier_id,
        label: product.supplier_name ?? product.supplier_id,
      });
    this.setData({
      ...baseline,
      categoryOptions,
      supplierOptions,
      barcode: product.barcode,
      categoryId: product.category_id ?? "",
      categoryIndex: Math.max(
        0,
        categoryOptions.findIndex((item) => item.id === (product.category_id ?? "")),
      ),
      dirty: false,
      itemNumber: product.item_number ?? "",
      productName: product.product_name ?? "",
      purchasePrice: formatCatalogNumber(product.purchase_price),
      retailPrice: formatCatalogNumber(product.retail_price),
      secondProductName: product.second_product_name ?? "",
      stockQuantity: formatCatalogNumber(product.stock_quantity),
      supplierId: product.supplier_id ?? "",
      supplierIndex: Math.max(
        0,
        supplierOptions.findIndex((item) => item.id === (product.supplier_id ?? "")),
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
      if (!current(this)) return;
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
      if (!preview.confirm || !current(this)) return;
      try {
        const choice = await wx.showActionSheet({
          itemList: [
            this.data.text.reloadServer,
            this.data.text.reapplyManually,
            this.data.text.cancel,
          ],
        });
        if (!current(this)) return;
        const action = catalogConflictAction(choice.tapIndex);
        if (action === "reload_server") this.applyServerProduct(product, false);
        if (action === "reapply_manually") this.applyServerProduct(product, true);
      } catch {
        // Native action-sheet cancellation intentionally keeps the local draft unchanged.
      }
    } catch (error) {
      if (current(this))
        this.setData({ errorMessage: this.data.text[readErrorTranslationKey(error)] });
    }
  },
  async save() {
    if (this.data.saving || !app.activeShop || !current(this) || !this.data.formReady) return;
    const validation = validateProductForm(
      {
        barcode: this.data.barcode,
        categoryId: this.data.categoryId,
        itemNumber: this.data.itemNumber,
        productName: this.data.productName,
        purchasePrice: this.data.purchasePrice,
        retailPrice: this.data.retailPrice,
        secondProductName: this.data.secondProductName,
        stockQuantity: this.data.stockQuantity,
        supplierId: this.data.supplierId,
      },
      {
        purchasePrice: this.data.originalPurchasePrice,
        retailPrice: this.data.originalRetailPrice,
        stockQuantity: this.data.originalStockQuantity,
      },
    );
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
      const holder = runtime(this);
      const fingerprint = JSON.stringify({
        mode: this.data.mode,
        payload: validation.payload,
        stages,
      });
      if (holder.saveAction && holder.saveAction.fingerprint !== fingerprint)
        throw new CatalogMutationContractError("invalid_state");
      if (!holder.saveAction && stages.length) {
        const pending = app.outbox
          .pendingForCurrentShop(holder.shopId)
          .some(
            (e) =>
              e.entityType === "product" &&
              (e.entityId === this.data.productId ||
                (e.operation === "product_create" &&
                  "barcode" in e.payload &&
                  e.payload.barcode === validation.payload.barcode)),
          );
        if (pending) throw new CatalogMutationContractError("retryable_error");
        const inputs: CatalogMutationInput[] = stages.map((stage) =>
          stage.kind === "create"
            ? { operation: "product_create", payload: validation.payload, shopId: holder.shopId }
            : stage.kind === "base"
              ? {
                  operation: "product_update",
                  payload: basePayload,
                  shopId: holder.shopId,
                  targetId: this.data.productId,
                  expectedUpdatedAt: this.data.updatedAt,
                }
              : {
                  operation: "product_price_update",
                  payload: { price: stage.price, priceType: stage.priceType },
                  shopId: holder.shopId,
                  targetId: this.data.productId,
                  expectedUpdatedAt: this.data.updatedAt,
                },
        );
        const ids = await Promise.all(
          inputs.map(() => createCatalogMutationAttemptIdentifiers(createWeChatPlatform())),
        );
        if (!current(this)) throw new CatalogMutationContractError("session_expired");
        const intentId = app.outbox.enqueueSequence(inputs, ids);
        holder.saveAction = { fingerprint, intentId };
      }
      if (holder.saveAction)
        await app.outbox.completeIntent(
          app.catalogClient,
          holder.shopId,
          holder.saveAction.intentId,
          holder.generation,
        );
      if (!current(this)) return;
      holder.saveAction = undefined;
      this.setData({ dirty: false });
      wx.disableAlertBeforeUnload();
      app.sensitiveCaches.invalidate();
      wx.showToast({ icon: "success", title: this.data.text.saved });
      setTimeout(() => {
        if (current(this)) wx.navigateBack();
      }, 500);
    } catch (error) {
      if (!current(this)) return;
      if (isRevisionConflict(error)) {
        this.setData({ errorMessage: this.data.text.conflictMessage });
        await this.resolveRevisionConflict();
        return;
      }
      if (
        error instanceof CatalogMutationContractError &&
        ["duplicate_barcode", "invalid_category", "invalid_supplier", "invalid_payload"].includes(
          error.code,
        )
      ) {
        const holder = runtime(this);
        if (holder.saveAction) {
          app.outbox.discardIntent(holder.shopId, holder.saveAction.intentId);
          holder.saveAction = undefined;
        }
      }
      const key =
        error instanceof CatalogMutationContractError
          ? mutationErrorTranslationKey(error.code)
          : "retryableError";
      this.setData({ errorMessage: this.data.text[key] });
    } finally {
      if (current(this)) this.setData({ saving: false });
    }
  },
  retryLoad() {
    void this.onLoad({ id: this.data.productId, mode: this.data.mode });
  },
});
