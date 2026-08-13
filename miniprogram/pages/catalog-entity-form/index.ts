import type { MerchandiseControlApp } from "../../app";
import type { CatalogMutationAttemptController } from "../../lib/catalog-mutation-client";
import {
  CatalogMutationContractError,
  type CatalogMutationInput,
  type Category,
  type Supplier,
} from "../../lib/contracts";
import { translationsFor } from "../../locales/index";
import {
  catalogConflictAction,
  hasCatalogCapability,
  isCatalogRevisionConflict,
  mutationErrorTranslationKey,
  planRelationArchive,
} from "../catalog-management";

const app = getApp<MerchandiseControlApp>();
type EntityType = "category" | "supplier";
type EntityRow = {
  readonly id: string;
  readonly name: string;
  readonly productCount: number;
  readonly updatedAt: string;
};

interface EntityRuntime {
  attempt: CatalogMutationAttemptController | null;
  fingerprint: string;
}

function runtime(page: unknown): EntityRuntime {
  return page as EntityRuntime;
}

function rows(
  type: EntityType,
  categories: readonly Category[],
  suppliers: readonly Supplier[],
): EntityRow[] {
  return type === "category"
    ? categories.map((item) => ({
        id: item.category_id,
        name: item.category_name,
        productCount: item.product_count,
        updatedAt: item.updated_at,
      }))
    : suppliers.map((item) => ({
        id: item.supplier_id,
        name: item.supplier_name,
        productCount: item.product_count,
        updatedAt: item.updated_at,
      }));
}

function isRevisionConflict(error: unknown): boolean {
  return error instanceof CatalogMutationContractError && isCatalogRevisionConflict(error.code);
}

Page({
  data: {
    current: null as EntityRow | null,
    entityId: "",
    entityType: "category" as EntityType,
    errorMessage: "",
    formReady: false,
    loading: true,
    mode: "create" as "create" | "edit",
    name: "",
    replacementId: "",
    replacementIndex: 0,
    replacements: [] as readonly EntityRow[],
    saving: false,
    text: translationsFor(app.locale),
  },
  async onLoad(options: Record<string, string | undefined>) {
    const entityType: EntityType = options.type === "supplier" ? "supplier" : "category";
    const mode = options.mode === "edit" ? "edit" : "create";
    const entityId = options.id ?? "";
    runtime(this).attempt = null;
    runtime(this).fingerprint = "";
    this.setData({
      entityId,
      entityType,
      formReady: false,
      mode,
      text: translationsFor(app.locale),
    });
    wx.setNavigationBarTitle({
      title:
        mode === "create"
          ? entityType === "category"
            ? this.data.text.newCategory
            : this.data.text.newSupplier
          : entityType === "category"
            ? this.data.text.category
            : this.data.text.supplier,
    });
    const capability = entityType === "category" ? "can_write_categories" : "can_write_suppliers";
    if (!app.activeShop || !app.salesClient || !hasCatalogCapability(app.activeShop, capability)) {
      this.setData({ errorMessage: this.data.text.permissionDenied, loading: false });
      return;
    }
    try {
      const [categories, suppliers] = await Promise.all([
        app.salesClient.categories(app.activeShop.shop_id),
        app.salesClient.suppliers(app.activeShop.shop_id),
      ]);
      const allRows = rows(entityType, categories, suppliers);
      const current =
        mode === "edit" ? (allRows.find((item) => item.id === entityId) ?? null) : null;
      if (mode === "edit" && !current) {
        this.setData({ errorMessage: this.data.text.entityNotFound, loading: false });
        return;
      }
      this.setData({
        current,
        errorMessage: "",
        formReady: true,
        loading: false,
        name: current?.name ?? "",
        replacements: allRows.filter((item) => item.id !== entityId),
      });
    } catch {
      this.setData({ errorMessage: this.data.text.offline, loading: false });
    }
  },
  changeName(event: WechatMiniprogram.Input) {
    const holder = runtime(this);
    if (holder.attempt?.state.lifecycle === "retryable_error") holder.attempt.reset();
    holder.attempt = null;
    holder.fingerprint = "";
    this.setData({ errorMessage: "", name: event.detail.value });
  },
  chooseReplacement(event: WechatMiniprogram.PickerChange) {
    const replacementIndex = Number(event.detail.value);
    const holder = runtime(this);
    if (holder.attempt?.state.lifecycle === "retryable_error") holder.attempt.reset();
    holder.attempt = null;
    holder.fingerprint = "";
    this.setData({
      errorMessage: "",
      replacementId: this.data.replacements[replacementIndex]?.id ?? "",
      replacementIndex,
    });
  },
  async run(input: CatalogMutationInput, fingerprint: string): Promise<boolean> {
    const holder = runtime(this);
    if (holder.fingerprint !== fingerprint) {
      holder.attempt = null;
      holder.fingerprint = fingerprint;
    }
    const attempt = holder.attempt ?? app.createCatalogMutationAttempt();
    if (!attempt) throw new CatalogMutationContractError("backend_temporary");
    holder.attempt = attempt;
    try {
      if (attempt.state.lifecycle === "retryable_error") await attempt.retry();
      else await attempt.start(input);
      holder.attempt = null;
      holder.fingerprint = "";
      return true;
    } catch (error) {
      if (attempt.state.lifecycle !== "retryable_error") {
        holder.attempt = null;
        holder.fingerprint = "";
      }
      throw error;
    }
  },
  async resolveRevisionConflict() {
    if (!app.activeShop || !app.salesClient || this.data.mode !== "edit") return;
    try {
      const [categories, suppliers] = await Promise.all([
        app.salesClient.categories(app.activeShop.shop_id),
        app.salesClient.suppliers(app.activeShop.shop_id),
      ]);
      const allRows = rows(this.data.entityType, categories, suppliers);
      const current = allRows.find((item) => item.id === this.data.entityId) ?? null;
      if (!current) {
        this.setData({ errorMessage: this.data.text.entityNotFound });
        return;
      }
      const preview = await wx.showModal({
        cancelText: this.data.text.cancel,
        confirmText: this.data.text.manage,
        content: `${this.data.text.name}: ${current.name}\n${this.data.text.productCount}: ${current.productCount}\n${this.data.text.modified}: ${current.updatedAt}`,
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
        const replacements = allRows.filter((item) => item.id !== this.data.entityId);
        const selectedReplacementIndex = replacements.findIndex(
          (item) => item.id === this.data.replacementId,
        );
        runtime(this).attempt?.reset();
        runtime(this).attempt = null;
        runtime(this).fingerprint = "";
        const action = catalogConflictAction(choice.tapIndex);
        if (action === "reload_server") {
          this.setData({
            current,
            errorMessage: "",
            name: current.name,
            replacementId: "",
            replacementIndex: 0,
            replacements,
          });
        }
        if (action === "reapply_manually") {
          this.setData({
            current,
            errorMessage: "",
            replacementId: selectedReplacementIndex >= 0 ? this.data.replacementId : "",
            replacementIndex: Math.max(0, selectedReplacementIndex),
            replacements,
          });
        }
      } catch {
        // Native action-sheet cancellation intentionally keeps the local draft unchanged.
      }
    } catch {
      this.setData({ errorMessage: this.data.text.offline });
    }
  },
  async save() {
    if (this.data.saving || !app.activeShop) return;
    const name = this.data.name.trim();
    if (!name || name.length > 160) {
      this.setData({ errorMessage: this.data.text.requiredFields });
      return;
    }
    const operation =
      `${this.data.entityType}_${this.data.mode === "create" ? "create" : "update"}` as
        | "category_create"
        | "category_update"
        | "supplier_create"
        | "supplier_update";
    const input: CatalogMutationInput =
      this.data.mode === "create"
        ? {
            operation: operation as "category_create" | "supplier_create",
            payload: { name },
            shopId: app.activeShop.shop_id,
          }
        : {
            expectedUpdatedAt: this.data.current?.updatedAt ?? "",
            operation: operation as "category_update" | "supplier_update",
            payload: { name },
            shopId: app.activeShop.shop_id,
            targetId: this.data.entityId,
          };
    this.setData({ errorMessage: "", saving: true });
    try {
      await this.run(input, JSON.stringify(input));
      app.sensitiveCaches.invalidate();
      wx.showToast({ icon: "success", title: this.data.text.saved });
      wx.navigateBack();
    } catch (error) {
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
  async archive() {
    if (this.data.saving || !app.activeShop || !this.data.current) return;
    const archivePlan = planRelationArchive(
      this.data.current.productCount,
      this.data.replacementId,
    );
    if (!archivePlan.ok) {
      this.setData({ errorMessage: this.data.text[archivePlan.errorKey] });
      return;
    }
    const input: CatalogMutationInput = {
      expectedUpdatedAt: this.data.current.updatedAt,
      operation: `${this.data.entityType}_archive` as "category_archive" | "supplier_archive",
      payload: archivePlan.payload,
      shopId: app.activeShop.shop_id,
      targetId: this.data.current.id,
    };
    const fingerprint = JSON.stringify(input);
    const holder = runtime(this);
    const retryingSameAction =
      holder.fingerprint === fingerprint && holder.attempt?.state.lifecycle === "retryable_error";
    if (holder.attempt?.state.lifecycle === "retryable_error" && !retryingSameAction) {
      this.setData({ errorMessage: this.data.text.retryableError });
      return;
    }
    if (!retryingSameAction) {
      const confirmation = await wx.showModal({
        cancelText: this.data.text.cancel,
        confirmText: this.data.text.archive,
        content: this.data.text.archiveConfirm,
      });
      if (!confirmation.confirm) return;
    }
    this.setData({ errorMessage: "", saving: true });
    try {
      await this.run(input, fingerprint);
      app.sensitiveCaches.invalidate();
      wx.navigateBack();
    } catch (error) {
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
});
