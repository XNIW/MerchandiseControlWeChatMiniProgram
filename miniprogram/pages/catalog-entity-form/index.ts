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
  readErrorTranslationKey,
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
  generation: number;
  shopId: string;
  mounted: boolean;
  rejectedOperationId?: string | undefined;
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
    replacementSearch: "",
    replacementAppliedSearch: "",
    replacementMore: true,
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
    runtime(this).mounted = true;
    runtime(this).generation = app.sessionStore.generation;
    runtime(this).shopId = app.activeShop?.shop_id ?? "";
    const entityType: EntityType = options.type === "supplier" ? "supplier" : "category";
    const mode = options.mode === "edit" ? "edit" : "create";
    const entityId = options.id ?? "";
    runtime(this).attempt = null;
    runtime(this).fingerprint = "";
    runtime(this).rejectedOperationId = undefined;
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
      const current = mode === "edit" ? await this.readCurrent() : null;
      if (!this.contextCurrent()) return;
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
        replacementMore: allRows.length === 100,
        replacements: allRows.filter((item) => item.id !== entityId),
      });
    } catch (error) {
      if (!this.contextCurrent()) return;
      this.setData({
        errorMessage: this.data.text[readErrorTranslationKey(error)],
        loading: false,
      });
    }
  },
  onUnload() {
    runtime(this).mounted = false;
  },
  onShow() {
    if (!this.contextCurrent())
      this.setData({
        formReady: false,
        name: "",
        current: null,
        replacements: [],
        errorMessage: this.data.text.sessionExpired,
      });
  },
  contextCurrent() {
    return (
      runtime(this).mounted &&
      runtime(this).generation === app.sessionStore.generation &&
      runtime(this).shopId === app.activeShop?.shop_id
    );
  },
  async readCurrent(): Promise<EntityRow | null> {
    const api = app.salesClient;
    if (!api || !this.contextCurrent()) return null;
    const id = this.data.entityId,
      shop = runtime(this).shopId;
    const data =
      this.data.entityType === "category"
        ? rows("category", await api.categories(shop, undefined, { id }), [])
        : rows("supplier", [], await api.suppliers(shop, undefined, { id }));
    return data[0] ?? null;
  },
  searchReplacements(event: WechatMiniprogram.Input) {
    this.setData({ replacementSearch: event.detail.value });
  },
  findReplacements() {
    void this.loadReplacements(false);
  },
  moreReplacements() {
    void this.loadReplacements(true);
  },
  async loadReplacements(append: boolean) {
    if (!this.contextCurrent() || !app.salesClient || this.data.loading) return;
    if (this.data.replacementSearch !== this.data.replacementAppliedSearch) append = false;
    this.setData({ loading: true });
    try {
      const last = append ? this.data.replacements[this.data.replacements.length - 1] : undefined;
      const options = last ? { afterName: last.name, afterId: last.id } : {};
      const type = this.data.entityType,
        shop = runtime(this).shopId,
        search = this.data.replacementSearch || undefined;
      const page =
        type === "category"
          ? rows(type, await app.salesClient.categories(shop, search, options), [])
          : rows(type, [], await app.salesClient.suppliers(shop, search, options));
      if (!this.contextCurrent()) return;
      const replacements = (
        append
          ? [
              ...this.data.replacements,
              ...page.filter((p) => !this.data.replacements.some((i) => i.id === p.id)),
            ]
          : page
      ).filter((i) => i.id !== this.data.entityId);
      const selected = this.data.replacements.find((i) => i.id === this.data.replacementId);
      if (selected && !replacements.some((i) => i.id === selected.id))
        replacements.unshift(selected);
      this.setData({
        replacements,
        replacementAppliedSearch: this.data.replacementSearch,
        replacementMore: page.length === 100,
        replacementIndex: Math.max(
          0,
          replacements.findIndex((i) => i.id === this.data.replacementId),
        ),
      });
    } catch {
      if (this.contextCurrent()) this.setData({ errorMessage: this.data.text.retryableError });
    } finally {
      if (this.contextCurrent()) this.setData({ loading: false });
    }
  },
  changeName(event: WechatMiniprogram.Input) {
    const holder = runtime(this);
    if (
      !this.contextCurrent() ||
      this.data.saving ||
      holder.attempt?.state.lifecycle === "retryable_error"
    ) {
      this.setData({ errorMessage: this.data.text.pendingChanges });
      return;
    }
    if (holder.rejectedOperationId) {
      app.outbox.discardOperation(holder.shopId, holder.rejectedOperationId);
      holder.rejectedOperationId = undefined;
    }
    holder.attempt = null;
    holder.fingerprint = "";
    this.setData({ errorMessage: "", name: event.detail.value });
  },
  chooseReplacement(event: WechatMiniprogram.PickerChange) {
    const replacementIndex = Number(event.detail.value);
    const holder = runtime(this);
    if (
      !this.contextCurrent() ||
      this.data.saving ||
      holder.attempt?.state.lifecycle === "retryable_error"
    ) {
      this.setData({ errorMessage: this.data.text.pendingChanges });
      return;
    }
    if (holder.rejectedOperationId) {
      app.outbox.discardOperation(holder.shopId, holder.rejectedOperationId);
      holder.rejectedOperationId = undefined;
    }
    holder.attempt = null;
    holder.fingerprint = "";
    this.setData({
      errorMessage: "",
      replacementId: this.data.replacements[replacementIndex]?.id ?? "",
      replacementIndex,
    });
  },
  async run(input: CatalogMutationInput, fingerprint: string): Promise<boolean> {
    if (!this.contextCurrent()) throw new CatalogMutationContractError("session_expired");
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
      if (!this.contextCurrent()) throw error;
      if (attempt.state.lifecycle === "failed")
        holder.rejectedOperationId = attempt.operationId ?? undefined;
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
      const current = await this.readCurrent();
      if (!this.contextCurrent()) return;
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
      if (!preview.confirm || !this.contextCurrent()) return;
      try {
        const choice = await wx.showActionSheet({
          itemList: [
            this.data.text.reloadServer,
            this.data.text.reapplyManually,
            this.data.text.cancel,
          ],
        });
        if (!this.contextCurrent()) return;
        const replacements = allRows.filter((item) => item.id !== this.data.entityId);
        const selectedReplacementIndex = replacements.findIndex(
          (item) => item.id === this.data.replacementId,
        );
        runtime(this).attempt?.reset();
        runtime(this).attempt = null;
        runtime(this).fingerprint = "";
        const action = catalogConflictAction(choice.tapIndex);
        if (action !== "cancel" && runtime(this).rejectedOperationId) {
          app.outbox.discardOperation(
            runtime(this).shopId,
            runtime(this).rejectedOperationId as string,
          );
          runtime(this).rejectedOperationId = undefined;
        }
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
    } catch (error) {
      if (!this.contextCurrent()) return;
      this.setData({ errorMessage: this.data.text[readErrorTranslationKey(error)] });
    }
  },
  async save() {
    if (this.data.saving || !app.activeShop || !this.contextCurrent()) return;
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
      if (!this.contextCurrent()) return;
      app.sensitiveCaches.invalidate();
      wx.showToast({ icon: "success", title: this.data.text.saved });
      wx.navigateBack();
    } catch (error) {
      if (!this.contextCurrent()) return;
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
      if (this.contextCurrent()) this.setData({ saving: false });
    }
  },
  async archive() {
    if (this.data.saving || !app.activeShop || !this.data.current || !this.contextCurrent()) return;
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
      if (!confirmation.confirm || !this.contextCurrent()) return;
    }
    this.setData({ errorMessage: "", saving: true });
    try {
      await this.run(input, fingerprint);
      if (!this.contextCurrent()) return;
      app.sensitiveCaches.invalidate();
      wx.navigateBack();
    } catch (error) {
      if (!this.contextCurrent()) return;
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
      if (this.contextCurrent()) this.setData({ saving: false });
    }
  },
});
