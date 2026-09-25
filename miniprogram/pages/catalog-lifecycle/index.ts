import type { MerchandiseControlApp } from "../../app";
import type { CatalogMutationAttemptController } from "../../lib/catalog-mutation-client";
import { CatalogMutationContractError, type CatalogMutationInput } from "../../lib/contracts";
import type { CatalogEntityType, CatalogLifecycleEntity } from "../../lib/sales-api-client";
import { translationsFor } from "../../locales/index";
import {
  hasCatalogCapability,
  mutationErrorTranslationKey,
  readErrorTranslationKey,
} from "../catalog-management";

const app = getApp<MerchandiseControlApp>();
type LifecycleRow = CatalogLifecycleEntity & { readonly state_label: string };

interface RestoreAction {
  readonly attempt: CatalogMutationAttemptController;
  readonly entityId: string;
  readonly input: CatalogMutationInput;
}

interface LifecycleRuntime {
  restoreAction: RestoreAction | null;
  mounted: boolean;
  sequence: number;
  context?: string;
}

function runtime(page: unknown): LifecycleRuntime {
  return page as LifecycleRuntime;
}

function capability(type: CatalogEntityType) {
  if (type === "category") return "can_write_categories" as const;
  if (type === "supplier") return "can_write_suppliers" as const;
  return "can_write_products" as const;
}

Page({
  data: {
    canRestore: false,
    entityType: "product" as CatalogEntityType,
    errorMessage: "",
    hasMore: false,
    items: [] as readonly LifecycleRow[],
    loading: false,
    restoringId: "",
    text: translationsFor(app.locale),
  },
  onLoad(options: Record<string, string | undefined>) {
    const entityType: CatalogEntityType =
      options.type === "category" || options.type === "supplier" ? options.type : "product";
    runtime(this).mounted = true;
    runtime(this).sequence = 0;
    runtime(this).restoreAction = null;
    this.setData({ entityType, text: translationsFor(app.locale) });
    wx.setNavigationBarTitle({ title: this.data.text.archivedEntities });
  },
  onUnload() {
    runtime(this).mounted = false;
    runtime(this).sequence++;
  },
  onShow() {
    const context = `${app.sessionStore.generation}:${app.activeShop?.shop_id}`;
    if (runtime(this).context !== context) {
      runtime(this).context = context;
      runtime(this).restoreAction = null;
      runtime(this).sequence++;
      this.setData({ items: [], loading: false, restoringId: "" });
    }
    this.setData({
      canRestore: hasCatalogCapability(app.activeShop, capability(this.data.entityType)),
      text: translationsFor(app.locale),
    });
    void this.load(true);
  },
  async load(reset: boolean) {
    if (this.data.loading || !app.activeShop || !app.salesClient) return;
    if (!hasCatalogCapability(app.activeShop, "can_read_catalog")) {
      this.setData({ errorMessage: this.data.text.permissionDenied });
      return;
    }
    const generation = app.sessionStore.generation,
      shopId = app.activeShop.shop_id,
      sequence = ++runtime(this).sequence;
    const valid = () =>
      runtime(this).mounted &&
      runtime(this).sequence === sequence &&
      generation === app.sessionStore.generation &&
      shopId === app.activeShop?.shop_id;
    const last = reset ? undefined : this.data.items[this.data.items.length - 1];
    this.setData({ errorMessage: "", loading: true, ...(reset ? { items: [] } : {}) });
    try {
      const entities = await app.salesClient.catalogLifecycle(
        app.activeShop.shop_id,
        this.data.entityType,
        "archived",
        {
          ...(last ? { beforeId: last.entity_id, beforeUpdatedAt: last.updated_at } : {}),
          limit: 50,
        },
      );
      if (!valid()) return;
      const rows = entities.map((item) => ({ ...item, state_label: this.data.text.archived }));
      const existing = new Set(this.data.items.map((item) => item.entity_id));
      this.setData({
        hasMore: rows.length === 50,
        items: reset
          ? rows
          : [...this.data.items, ...rows.filter((item) => !existing.has(item.entity_id))],
      });
    } catch (error) {
      if (valid()) this.setData({ errorMessage: this.data.text[readErrorTranslationKey(error)] });
    } finally {
      if (valid()) this.setData({ loading: false });
    }
  },
  loadMore() {
    void this.load(false);
  },
  async restore(event: WechatMiniprogram.BaseEvent) {
    if (!this.data.canRestore || this.data.restoringId || !app.activeShop) return;
    const generation = app.sessionStore.generation,
      shopId = app.activeShop.shop_id;
    const valid = () =>
      runtime(this).mounted &&
      generation === app.sessionStore.generation &&
      shopId === app.activeShop?.shop_id;
    const entityId = String(event.currentTarget.dataset.id ?? "");
    const entity = this.data.items.find((item) => item.entity_id === entityId);
    if (!entity) return;
    const existing = runtime(this).restoreAction;
    if (existing && existing.entityId !== entityId) {
      this.setData({ errorMessage: this.data.text.retryableError });
      return;
    }
    if (existing?.attempt.state.lifecycle !== "retryable_error") {
      const confirmation = await wx.showModal({
        cancelText: this.data.text.cancel,
        confirmText: this.data.text.restore,
        content: this.data.text.restoreConfirm,
      });
      if (!confirmation.confirm || !valid()) return;
    }
    const operation = `${this.data.entityType}_restore` as
      | "category_restore"
      | "product_restore"
      | "supplier_restore";
    const input: CatalogMutationInput = {
      expectedUpdatedAt: entity.updated_at,
      operation,
      payload: { reason: "mini_program_user_action" },
      shopId,
      targetId: entityId,
    };
    const attempt = existing?.attempt ?? app.createCatalogMutationAttempt();
    if (!attempt) {
      this.setData({ errorMessage: this.data.text.unavailable });
      return;
    }
    runtime(this).restoreAction = { attempt, entityId, input };
    this.setData({ errorMessage: "", restoringId: entityId });
    try {
      if (attempt.state.lifecycle === "retryable_error") await attempt.retry();
      else await attempt.start(input);
      if (!valid()) return;
      runtime(this).restoreAction = null;
      app.sensitiveCaches.invalidate();
      this.setData({ items: this.data.items.filter((item) => item.entity_id !== entityId) });
    } catch (error) {
      if (!valid()) return;
      if (attempt.state.lifecycle !== "retryable_error") runtime(this).restoreAction = null;
      const key =
        error instanceof CatalogMutationContractError
          ? mutationErrorTranslationKey(error.code)
          : "retryableError";
      this.setData({ errorMessage: this.data.text[key] });
    } finally {
      if (valid()) this.setData({ restoringId: "" });
    }
  },
});
