export type AuthProvider = "email" | "google" | "wechat";
export type WeChatSurface = "mini_program";
export type SessionState = "signed_out" | "exchanging" | "active" | "expired" | "revoked";
export type LinkState = "not_linked" | "linked" | "conflict" | "link_required";

export type AuthErrorCode =
  | "account_suspended"
  | "backend_temporary"
  | "code_expired"
  | "code_invalid"
  | "code_missing"
  | "identity_already_linked"
  | "identity_conflict"
  | "membership_missing"
  | "offline"
  | "provider_not_configured"
  | "rate_limited"
  | "session_expired"
  | "state_expired"
  | "state_invalid"
  | "state_replayed"
  | "user_cancelled"
  | "user_denied"
  | "validation_failed";

export interface WeChatChallenge {
  readonly correlationId: string;
  readonly expiresInSeconds: number;
  readonly nonce: string;
  readonly state: string;
}

export interface MiniSessionHandoff {
  readonly accountFingerprint: string;
  readonly expiresAt: number;
  readonly expiresIn: number;
  readonly sessionToken: string;
  readonly tokenType: "bearer";
  readonly user: {
    readonly provider: "custom:wechat";
  };
}

export interface AuthorizedShop {
  readonly can_change_prices: boolean;
  readonly can_manage_images: boolean;
  readonly can_read_catalog: boolean;
  readonly can_read_catalog_history: boolean;
  readonly can_write_categories: boolean;
  readonly can_write_products: boolean;
  readonly can_write_suppliers: boolean;
  readonly currency_code: string;
  readonly role_key: "shop_owner" | "shop_manager" | "viewer";
  readonly server_time: string;
  readonly shop_code: string;
  readonly shop_id: string;
  readonly shop_name: string;
  readonly time_zone: string;
}

export interface DailySalesSummary {
  readonly business_date: string;
  readonly currency_code: string;
  readonly discounts_clp: number;
  readonly gross_sales_clp: number;
  readonly latest_ledger_at: string | null;
  readonly net_revenue_clp: number;
  readonly refund_count: number;
  readonly refunds_clp: number;
  readonly sale_count: number;
  readonly server_time: string;
  readonly shop_id: string;
  readonly time_zone: string;
  readonly transaction_count: number;
  readonly void_count: number;
}

export interface SaleListItem {
  readonly business_date: string;
  readonly business_kind: string;
  readonly currency_code: string;
  readonly device_name: string | null;
  readonly discount_amount_clp: number;
  readonly fiscal_status: string;
  readonly gross_amount_clp: number;
  readonly latest_update_at: string;
  readonly net_amount_clp: number;
  readonly occurred_at: string;
  readonly payment_methods: readonly string[];
  readonly pos_sale_id: string;
  readonly sale_number: string;
  readonly sale_status: string;
  readonly staff_name: string | null;
  readonly time_zone: string;
}

export type DailySale = SaleListItem;

export interface SalesFilterEntity {
  readonly id: string;
  readonly name: string;
}

export interface SalesFilterOptions {
  readonly can_filter_operational_metadata: boolean;
  readonly devices: readonly SalesFilterEntity[];
  readonly payment_methods: readonly string[];
  readonly staff: readonly SalesFilterEntity[];
}

export interface SaleDetailLine {
  readonly barcode: string | null;
  readonly item_number: string | null;
  readonly line_amount_clp: number;
  readonly line_position: number;
  readonly line_type: string;
  readonly product_id: string | null;
  readonly product_name: string | null;
  readonly quantity: number;
  readonly unit_amount_clp: number;
}

export interface SaleDetail {
  readonly lines: readonly SaleDetailLine[];
  readonly sale: Omit<SaleListItem, "time_zone" | "latest_update_at"> & {
    readonly updated_at: string;
  };
}

export interface CatalogProduct {
  readonly barcode: string;
  readonly category_id: string | null;
  readonly category_name: string | null;
  readonly cursor_text: string | null;
  readonly item_number: string | null;
  readonly previous_retail_price: number | null;
  readonly primary_image_version_id: string | null;
  readonly product_id: string;
  readonly product_name: string | null;
  readonly purchase_price: number | null;
  readonly retail_price: number | null;
  readonly second_product_name: string | null;
  readonly stock_quantity: number | null;
  readonly supplier_id: string | null;
  readonly supplier_name: string | null;
  readonly updated_at: string;
}

export interface ProductDetail
  extends Omit<CatalogProduct, "cursor_text" | "previous_retail_price"> {
  readonly primary_image_updated_at: string | null;
}

export interface PriceHistoryEntry {
  readonly created_at: string;
  readonly effective_at: string;
  readonly price: number;
  readonly price_id: string;
  readonly price_type: "PURCHASE" | "RETAIL";
  readonly source: string | null;
}

export interface CatalogGroup {
  readonly product_count: number;
  readonly updated_at: string;
}

export interface Category extends CatalogGroup {
  readonly category_id: string;
  readonly category_name: string;
}

export interface Supplier extends CatalogGroup {
  readonly supplier_id: string;
  readonly supplier_name: string;
}

export interface SyncHistoryEntry {
  readonly changed_count: number;
  readonly created_at: string;
  readonly domain: "catalog" | "history" | "prices";
  readonly event_id: number;
  readonly event_type: string;
  readonly source: string | null;
}

export interface AccountProfile {
  readonly display_name: string;
  readonly profile_id: string;
  readonly profile_status: "active" | "disabled" | "review";
  readonly providers: readonly string[];
  readonly server_time: string;
  readonly wechat_linked: boolean;
}

export interface ProductImageUrl {
  readonly expiresAt: string;
  readonly productId: string;
  readonly signedUrl: string;
  readonly status: "ready";
  readonly variant: "main" | "thumb";
  readonly versionId: string;
}

export type CatalogMutationOperation =
  | "product_create"
  | "product_update"
  | "product_archive"
  | "product_restore"
  | "product_price_update"
  | "category_create"
  | "category_update"
  | "category_archive"
  | "category_restore"
  | "supplier_create"
  | "supplier_update"
  | "supplier_archive"
  | "supplier_restore";

/**
 * Capabilities are server declarations used to shape the client UI. They are
 * never an authorization decision; every mutation is authorized again by the
 * Admin gateway.
 */
export interface CatalogMutationCapabilities {
  readonly canChangePrices: boolean;
  readonly canManageImages: boolean;
  readonly canReadCatalog: boolean;
  readonly canReadCatalogHistory: boolean;
  readonly canWriteCategories: boolean;
  readonly canWriteProducts: boolean;
  readonly canWriteSuppliers: boolean;
  readonly shopId: string;
}

export interface CatalogProductMutationPayload {
  readonly barcode: string;
  readonly categoryId?: string | null;
  readonly itemNumber?: string;
  readonly productName: string;
  readonly purchasePrice?: number;
  readonly retailPrice?: number;
  readonly secondProductName?: string;
  readonly stockQuantity?: number | null;
  readonly supplierId?: string | null;
}

export interface CatalogArchivePayload {
  readonly reason: string;
}

export interface CatalogRelationArchivePayload extends CatalogArchivePayload {
  readonly replacementId?: string | null;
}

export interface CatalogPriceMutationPayload {
  readonly price: number;
  readonly priceType: "PURCHASE" | "RETAIL";
}

export interface CatalogEntityMutationPayload {
  readonly name: string;
}

type CatalogCreateMutation<TOperation extends CatalogMutationOperation, TPayload> = {
  readonly expectedUpdatedAt?: never;
  readonly operation: TOperation;
  readonly payload: TPayload;
  readonly shopId: string;
  /** Stable client-generated UUID used by the durable outbox. */
  readonly targetId?: string;
};

type CatalogVersionedMutation<TOperation extends CatalogMutationOperation, TPayload> = {
  readonly expectedUpdatedAt: string;
  readonly operation: TOperation;
  readonly payload: TPayload;
  readonly shopId: string;
  readonly targetId: string;
};

export type CatalogMutationInput =
  | CatalogCreateMutation<"product_create", CatalogProductMutationPayload>
  | CatalogVersionedMutation<"product_update", CatalogProductMutationPayload>
  | CatalogVersionedMutation<"product_archive" | "product_restore", CatalogArchivePayload>
  | CatalogVersionedMutation<"product_price_update", CatalogPriceMutationPayload>
  | CatalogCreateMutation<"category_create", CatalogEntityMutationPayload>
  | CatalogVersionedMutation<"category_update", CatalogEntityMutationPayload>
  | CatalogVersionedMutation<"category_archive", CatalogRelationArchivePayload>
  | CatalogVersionedMutation<"category_restore", CatalogArchivePayload>
  | CatalogCreateMutation<"supplier_create", CatalogEntityMutationPayload>
  | CatalogVersionedMutation<"supplier_update", CatalogEntityMutationPayload>
  | CatalogVersionedMutation<"supplier_archive", CatalogRelationArchivePayload>
  | CatalogVersionedMutation<"supplier_restore", CatalogArchivePayload>;

export type CatalogMutationRequestBody = CatalogMutationInput & {
  readonly schemaVersion: 1;
};

export interface CatalogMutationResult {
  readonly code: "success";
  readonly correlationId: string;
  readonly replayed: boolean;
  readonly shopId: string;
  readonly targetId: string;
  readonly updatedAt: string;
}

export interface CatalogMutationSuccessResponse {
  readonly mutation: CatalogMutationResult;
  readonly ok: true;
}

export type CatalogMutationErrorCode =
  | "account_suspended"
  | "backend_temporary"
  | "conflict"
  | "duplicate_barcode"
  | "entity_not_found"
  | "idempotency_conflict"
  | "image_invalid"
  | "image_too_large"
  | "invalid_category"
  | "invalid_operation"
  | "invalid_price"
  | "invalid_state"
  | "invalid_supplier"
  | "membership_missing"
  | "offline"
  | "permission_denied"
  | "profile_suspended"
  | "rate_limited"
  | "retryable_error"
  | "session_expired"
  | "shop_suspended"
  | "stale_version"
  | "unauthenticated"
  | "validation_failed";

export type CatalogMutationAttemptLifecycle =
  | "idle"
  | "preparing"
  | "submitting"
  | "retryable_error"
  | "failed"
  | "succeeded";

export type CatalogMutationAttemptState =
  | { readonly lifecycle: "idle" }
  | { readonly lifecycle: "preparing" }
  | {
      readonly correlationId: string;
      readonly lifecycle: "submitting";
    }
  | {
      readonly correlationId: string;
      readonly errorCode: "backend_temporary" | "offline" | "retryable_error";
      readonly lifecycle: "retryable_error";
    }
  | {
      readonly errorCode: CatalogMutationErrorCode;
      readonly lifecycle: "failed";
    }
  | {
      readonly correlationId: string;
      readonly lifecycle: "succeeded";
      readonly mutation: CatalogMutationResult;
    };

export class CatalogMutationContractError extends Error {
  readonly code: CatalogMutationErrorCode;

  constructor(code: CatalogMutationErrorCode) {
    super(code);
    this.name = "CatalogMutationContractError";
    this.code = code;
  }
}

export class AuthContractError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = "AuthContractError";
    this.code = code;
  }
}
