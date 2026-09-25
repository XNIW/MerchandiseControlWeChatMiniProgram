import { parseCatalogNumber, parseUnchangedCatalogNumber } from "../lib/catalog-numbers";
import type {
  AuthorizedShop,
  CatalogMutationErrorCode,
  CatalogProductMutationPayload,
  CatalogRelationArchivePayload,
} from "../lib/contracts";
import type { TranslationKey } from "../locales/index";

export type CatalogCapability =
  | "can_read_catalog"
  | "can_write_products"
  | "can_write_categories"
  | "can_write_suppliers"
  | "can_change_prices"
  | "can_manage_images"
  | "can_read_catalog_history";

export function hasCatalogCapability(
  shop: AuthorizedShop | null,
  capability: CatalogCapability,
): boolean {
  return shop !== null && shop[capability] === true;
}

export interface ProductFormValues {
  readonly barcode: string;
  readonly categoryId: string;
  readonly itemNumber: string;
  readonly productName: string;
  readonly purchasePrice: string;
  readonly retailPrice: string;
  readonly secondProductName: string;
  readonly stockQuantity: string;
  readonly supplierId: string;
}

export type ProductFormValidation =
  | { readonly errorKey: TranslationKey; readonly ok: false }
  | { readonly ok: true; readonly payload: CatalogProductMutationPayload };

export type ProductSaveStage =
  | { readonly kind: "base" }
  | { readonly kind: "create" }
  | {
      readonly kind: "price";
      readonly price: number;
      readonly priceType: "PURCHASE" | "RETAIL";
    };

export type ProductSavePlan =
  | { readonly errorKey: "invalidNumber"; readonly ok: false }
  | {
      readonly basePayload: Omit<CatalogProductMutationPayload, "purchasePrice" | "retailPrice">;
      readonly ok: true;
      readonly stages: readonly ProductSaveStage[];
    };

export type RelationArchivePlan =
  | { readonly errorKey: "replacementRequired"; readonly ok: false }
  | { readonly ok: true; readonly payload: CatalogRelationArchivePayload };

export type CatalogConflictAction = "cancel" | "reapply_manually" | "reload_server";

export function catalogConflictAction(tapIndex: number | undefined): CatalogConflictAction {
  if (tapIndex === 0) return "reload_server";
  if (tapIndex === 1) return "reapply_manually";
  return "cancel";
}

export function isCatalogRevisionConflict(code: CatalogMutationErrorCode): boolean {
  return code === "conflict" || code === "stale_version";
}

export function parseRequiredCatalogNumber(value: string): number | null {
  const parsed = parseCatalogNumber(value, "price");
  return parsed === undefined ? null : parsed;
}

export function planProductSave(input: {
  readonly canChangePrices: boolean;
  readonly mode: "create" | "edit";
  readonly originalBasePayload: string;
  readonly originalPurchasePrice: number | null;
  readonly originalRetailPrice: number | null;
  readonly payload: CatalogProductMutationPayload;
}): ProductSavePlan {
  const { purchasePrice, retailPrice, ...basePayload } = input.payload;
  if (input.mode === "create") {
    return { basePayload, ok: true, stages: [{ kind: "create" }] };
  }
  const stages: ProductSaveStage[] = [];
  if (JSON.stringify(basePayload) !== input.originalBasePayload) stages.push({ kind: "base" });
  if (input.canChangePrices) {
    if (
      (purchasePrice === undefined && input.originalPurchasePrice !== null) ||
      (retailPrice === undefined && input.originalRetailPrice !== null)
    ) {
      return { errorKey: "invalidNumber", ok: false };
    }
    if (purchasePrice !== undefined && purchasePrice !== input.originalPurchasePrice) {
      stages.push({ kind: "price", price: purchasePrice, priceType: "PURCHASE" });
    }
    if (retailPrice !== undefined && retailPrice !== input.originalRetailPrice) {
      stages.push({ kind: "price", price: retailPrice, priceType: "RETAIL" });
    }
  }
  return { basePayload, ok: true, stages };
}

export function planRelationArchive(
  activeProductCount: number,
  replacementId: string,
): RelationArchivePlan {
  if (activeProductCount > 0 && !replacementId) {
    return { errorKey: "replacementRequired", ok: false };
  }
  return {
    ok: true,
    payload: {
      reason: "mini_program_user_action",
      ...(replacementId ? { replacementId } : {}),
    },
  };
}

export function validateProductForm(
  values: ProductFormValues,
  original: {
    purchasePrice?: number | null;
    retailPrice?: number | null;
    stockQuantity?: number | null;
  } = {},
): ProductFormValidation {
  if (
    values.barcode.length === 0 ||
    values.barcode.length > 96 ||
    values.barcode.trim().length === 0 ||
    values.productName.length === 0 ||
    values.productName.length > 240 ||
    values.productName.trim().length === 0 ||
    values.itemNumber.length > 120 ||
    values.secondProductName.length > 240
  ) {
    return { errorKey: "requiredFields", ok: false };
  }
  const purchasePrice = parseUnchangedCatalogNumber(
    values.purchasePrice,
    "price",
    original.purchasePrice,
  );
  const retailPrice = parseUnchangedCatalogNumber(
    values.retailPrice,
    "price",
    original.retailPrice,
  );
  const stockQuantity = parseUnchangedCatalogNumber(
    values.stockQuantity,
    "quantity",
    original.stockQuantity,
  );
  if (purchasePrice === null || retailPrice === null || stockQuantity === null) {
    return { errorKey: "invalidNumber", ok: false };
  }
  return {
    ok: true,
    payload: {
      barcode: values.barcode.trim(),
      categoryId: values.categoryId || null,
      itemNumber: values.itemNumber.trim(),
      productName: values.productName.trim(),
      ...(purchasePrice === undefined ? {} : { purchasePrice }),
      ...(retailPrice === undefined ? {} : { retailPrice }),
      secondProductName: values.secondProductName.trim(),
      stockQuantity: stockQuantity ?? null,
      supplierId: values.supplierId || null,
    },
  };
}

export function mutationErrorTranslationKey(code: CatalogMutationErrorCode): TranslationKey {
  switch (code) {
    case "duplicate_barcode":
      return "duplicateBarcode";
    case "conflict":
    case "stale_version":
      return "conflictMessage";
    case "permission_denied":
      return "permissionDenied";
    case "shop_suspended":
      return "shopSuspended";
    case "profile_suspended":
    case "account_suspended":
      return "accountSuspended";
    case "membership_missing":
      return "membershipRemoved";
    case "session_expired":
    case "unauthenticated":
      return "sessionExpired";
    case "invalid_category":
      return "invalidCategory";
    case "invalid_supplier":
      return "invalidSupplier";
    case "invalid_price":
      return "invalidNumber";
    case "offline":
      return "offline";
    case "backend_temporary":
    case "rate_limited":
    case "retryable_error":
      return "retryableError";
    case "entity_not_found":
      return "entityNotFound";
    case "idempotency_conflict":
    case "image_invalid":
    case "image_too_large":
    case "invalid_operation":
    case "invalid_state":
    case "validation_failed":
      return "error";
  }
}

export function readErrorTranslationKey(error: unknown): TranslationKey {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (code === "timeout") return "requestTimeout";
  if (code === "rate_limited") return "rateLimited";
  if (
    typeof code === "string" &&
    [
      "offline",
      "session_expired",
      "unauthenticated",
      "membership_missing",
      "shop_suspended",
      "profile_suspended",
      "account_suspended",
      "permission_denied",
    ].includes(code)
  )
    return mutationErrorTranslationKey(code as CatalogMutationErrorCode);
  return "retryableError";
}
