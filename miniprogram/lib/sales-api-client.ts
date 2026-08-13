import type {
  AccountProfile,
  AuthorizedShop,
  CatalogProduct,
  Category,
  DailySale,
  DailySalesSummary,
  PriceHistoryEntry,
  ProductDetail,
  ProductImageUrl,
  SaleDetail,
  SalesFilterOptions,
  Supplier,
  SyncHistoryEntry,
} from "./contracts";
import type { HttpClient } from "./http-client";
import type { ActiveSession, SessionStore } from "./session-store";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CatalogEntityType = "category" | "product" | "supplier";
export type CatalogLifecycleState = "active" | "all" | "archived";
export type CatalogHistoryOperation =
  | "archived"
  | "category_changed"
  | "created"
  | "image_added"
  | "image_removed"
  | "image_replaced"
  | "price_changed"
  | "restored"
  | "supplier_changed"
  | "updated";

export interface CatalogLifecycleEntity {
  readonly active_product_count: number;
  readonly barcode: string | null;
  readonly deleted_at: string | null;
  readonly display_name: string;
  readonly entity_id: string;
  readonly entity_type: CatalogEntityType;
  readonly state: "active" | "archived";
  readonly updated_at: string;
}

export interface CatalogHistoryEvent {
  readonly actor_display_name: string;
  readonly actor_kind: "personal_account" | "system";
  readonly correlation_id_redacted: string | null;
  readonly entity_id_redacted: string | null;
  readonly entity_type: CatalogEntityType;
  readonly history_id: string;
  readonly occurred_at: string;
  readonly operation: CatalogHistoryOperation;
  readonly result: string;
  readonly shop_id: string;
  readonly summary: string;
  readonly surface: "mini_program" | "product_image_api";
}

export class SalesApiClient {
  readonly #http: HttpClient;
  readonly #sessions: SessionStore;

  constructor(http: HttpClient, sessions: SessionStore) {
    this.#http = http;
    this.#sessions = sessions;
  }

  async authorizedShops(): Promise<readonly AuthorizedShop[]> {
    const token = this.#requireSession();
    const result = await this.#http.get<{ readonly ok: true; readonly shops: AuthorizedShop[] }>(
      "/api/mini-program/v1/shops",
      {},
      token,
    );
    return result.shops;
  }

  async dailySummary(shopId: string, date?: string): Promise<DailySalesSummary | null> {
    this.#validateShop(shopId);
    const result = await this.#http.get<{
      readonly ok: true;
      readonly summary: DailySalesSummary[];
    }>("/api/mini-program/v1/sales/summary", { date, shop_id: shopId }, this.#requireSession());
    return result.summary[0] ?? null;
  }

  async dailySalesPage(
    shopId: string,
    options: {
      readonly beforeAt?: string;
      readonly beforeId?: string;
      readonly date?: string;
      readonly limit?: number;
    } = {},
  ): Promise<readonly DailySale[]> {
    this.#validateShop(shopId);
    const limit = options.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("invalid_page_limit");
    }
    if ((options.beforeAt === undefined) !== (options.beforeId === undefined)) {
      throw new Error("invalid_page_cursor");
    }
    const date = options.date ?? new Date().toISOString().slice(0, 10);
    const result = await this.#http.get<{ readonly ok: true; readonly sales: DailySale[] }>(
      "/api/mini-program/v1/sales",
      {
        before_at: options.beforeAt,
        before_id: options.beforeId,
        from: date,
        limit,
        shop_id: shopId,
        to: date,
      },
      this.#requireSession(),
    );
    return result.sales;
  }

  async periodSummary(
    shopId: string,
    from: string,
    to: string,
  ): Promise<readonly DailySalesSummary[]> {
    this.#validateShop(shopId);
    const result = await this.#http.get<{ readonly days: DailySalesSummary[]; readonly ok: true }>(
      "/api/mini-program/v1/sales/range",
      { from, shop_id: shopId, to },
      this.#requireSession(),
    );
    return result.days;
  }

  async salesPage(
    shopId: string,
    options: {
      readonly beforeAt?: string;
      readonly beforeId?: string;
      readonly deviceId?: string;
      readonly from: string;
      readonly kind?: string;
      readonly limit?: number;
      readonly paymentMethod?: string;
      readonly saleNumber?: string;
      readonly staffId?: string;
      readonly status?: string;
      readonly to: string;
    },
  ): Promise<readonly DailySale[]> {
    this.#validateShop(shopId);
    const limit = options.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("invalid_page_limit");
    if ((options.beforeAt === undefined) !== (options.beforeId === undefined)) {
      throw new Error("invalid_page_cursor");
    }
    const result = await this.#http.get<{ readonly ok: true; readonly sales: DailySale[] }>(
      "/api/mini-program/v1/sales",
      {
        before_at: options.beforeAt,
        before_id: options.beforeId,
        device_id: options.deviceId,
        from: options.from,
        kind: options.kind,
        limit,
        payment_method: options.paymentMethod,
        sale_number: options.saleNumber,
        shop_id: shopId,
        staff_id: options.staffId,
        status: options.status,
        to: options.to,
      },
      this.#requireSession(),
    );
    return result.sales;
  }

  async salesFilterOptions(
    shopId: string,
    from: string,
    to: string,
  ): Promise<SalesFilterOptions | null> {
    this.#validateShop(shopId);
    const result = await this.#http.get<{
      readonly filters: SalesFilterOptions | null;
      readonly ok: true;
    }>("/api/mini-program/v1/sales/filters", { from, shop_id: shopId, to }, this.#requireSession());
    return result.filters;
  }

  async saleDetail(shopId: string, saleId: string): Promise<SaleDetail | null> {
    this.#validateShop(shopId);
    this.#validateShop(saleId);
    const result = await this.#http.get<{ readonly detail: SaleDetail | null; readonly ok: true }>(
      "/api/mini-program/v1/sales/detail",
      { sale_id: saleId, shop_id: shopId },
      this.#requireSession(),
    );
    return result.detail;
  }

  async catalogPage(
    shopId: string,
    options: {
      readonly categoryId?: string;
      readonly cursorAt?: string;
      readonly cursorId?: string;
      readonly cursorText?: string;
      readonly hasImage?: boolean;
      readonly limit?: number;
      readonly search?: string;
      readonly sort?: "barcode_asc" | "name_asc" | "updated_desc";
      readonly supplierId?: string;
    } = {},
  ): Promise<readonly CatalogProduct[]> {
    this.#validateShop(shopId);
    const result = await this.#http.get<{ readonly ok: true; readonly products: CatalogProduct[] }>(
      "/api/mini-program/v1/catalog",
      {
        category_id: options.categoryId,
        cursor_at: options.cursorAt,
        cursor_id: options.cursorId,
        cursor_text: options.cursorText,
        has_image: options.hasImage,
        limit: options.limit ?? 50,
        search: options.search,
        shop_id: shopId,
        sort: options.sort ?? "updated_desc",
        supplier_id: options.supplierId,
      },
      this.#requireSession(),
    );
    return result.products;
  }

  async productDetail(shopId: string, productId: string): Promise<ProductDetail | null> {
    this.#validateShop(shopId);
    this.#validateShop(productId);
    const result = await this.#http.get<{ readonly ok: true; readonly product: ProductDetail[] }>(
      "/api/mini-program/v1/catalog/detail",
      { product_id: productId, shop_id: shopId },
      this.#requireSession(),
    );
    return result.product[0] ?? null;
  }

  async priceHistory(
    shopId: string,
    productId: string,
    options: {
      readonly beforeAt?: string;
      readonly beforeId?: string;
      readonly limit?: number;
    } = {},
  ): Promise<readonly PriceHistoryEntry[]> {
    this.#validateShop(shopId);
    this.#validateShop(productId);
    const result = await this.#http.get<{
      readonly ok: true;
      readonly prices: PriceHistoryEntry[];
    }>(
      "/api/mini-program/v1/catalog/prices",
      {
        before_at: options.beforeAt,
        before_id: options.beforeId,
        limit: options.limit ?? 50,
        product_id: productId,
        shop_id: shopId,
      },
      this.#requireSession(),
    );
    return result.prices;
  }

  async categories(shopId: string, search?: string): Promise<readonly Category[]> {
    this.#validateShop(shopId);
    const result = await this.#http.get<{ readonly categories: Category[]; readonly ok: true }>(
      "/api/mini-program/v1/categories",
      { limit: 100, search, shop_id: shopId },
      this.#requireSession(),
    );
    return result.categories;
  }

  async suppliers(shopId: string, search?: string): Promise<readonly Supplier[]> {
    this.#validateShop(shopId);
    const result = await this.#http.get<{ readonly ok: true; readonly suppliers: Supplier[] }>(
      "/api/mini-program/v1/suppliers",
      { limit: 100, search, shop_id: shopId },
      this.#requireSession(),
    );
    return result.suppliers;
  }

  async catalogLifecycle(
    shopId: string,
    entityType: CatalogEntityType,
    state: CatalogLifecycleState,
    options: {
      readonly beforeId?: string;
      readonly beforeUpdatedAt?: string;
      readonly limit?: number;
    } = {},
  ): Promise<readonly CatalogLifecycleEntity[]> {
    this.#validateShop(shopId);
    const limit = options.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("invalid_page_limit");
    if ((options.beforeUpdatedAt === undefined) !== (options.beforeId === undefined)) {
      throw new Error("invalid_page_cursor");
    }
    if (options.beforeId) this.#validateShop(options.beforeId);
    const result = await this.#http.get<{
      readonly entities: CatalogLifecycleEntity[];
      readonly ok: true;
    }>(
      "/api/mini-program/v1/catalog/lifecycle",
      {
        before_id: options.beforeId,
        before_updated_at: options.beforeUpdatedAt,
        entity_type: entityType,
        limit,
        shop_id: shopId,
        state,
      },
      this.#requireSession(),
    );
    return result.entities;
  }

  async catalogHistory(
    shopId: string,
    options: {
      readonly beforeAuditLogId?: string;
      readonly beforeCreatedAt?: string;
      readonly entityId?: string;
      readonly entityType?: CatalogEntityType;
      readonly fromAt?: string;
      readonly limit?: number;
      readonly operation?: CatalogHistoryOperation;
      readonly toAt?: string;
    } = {},
  ): Promise<readonly CatalogHistoryEvent[]> {
    this.#validateShop(shopId);
    const limit = options.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("invalid_page_limit");
    if ((options.beforeCreatedAt === undefined) !== (options.beforeAuditLogId === undefined)) {
      throw new Error("invalid_page_cursor");
    }
    if (options.beforeAuditLogId) this.#validateShop(options.beforeAuditLogId);
    if (options.entityId) this.#validateShop(options.entityId);
    const result = await this.#http.get<{
      readonly events: CatalogHistoryEvent[];
      readonly ok: true;
    }>(
      "/api/mini-program/v1/catalog/history",
      {
        before_audit_log_id: options.beforeAuditLogId,
        before_created_at: options.beforeCreatedAt,
        entity_id: options.entityId,
        entity_type: options.entityType,
        from_at: options.fromAt,
        limit,
        operation: options.operation,
        shop_id: shopId,
        to_at: options.toAt,
      },
      this.#requireSession(),
    );
    return result.events;
  }

  async syncHistory(shopId: string, beforeId?: number): Promise<readonly SyncHistoryEntry[]> {
    this.#validateShop(shopId);
    const result = await this.#http.get<{ readonly events: SyncHistoryEntry[]; readonly ok: true }>(
      "/api/mini-program/v1/history",
      { before_id: beforeId, limit: 50, shop_id: shopId },
      this.#requireSession(),
    );
    return result.events;
  }

  async account(): Promise<AccountProfile | null> {
    const result = await this.#http.get<{ readonly account: AccountProfile[]; readonly ok: true }>(
      "/api/mini-program/v1/account",
      {},
      this.#requireSession(),
    );
    return result.account[0] ?? null;
  }

  async productImage(
    shopId: string,
    productId: string,
    versionId: string,
    variant: "main" | "thumb",
  ): Promise<ProductImageUrl | null> {
    this.#validateShop(shopId);
    this.#validateShop(productId);
    this.#validateShop(versionId);
    const result = await this.#http.post<{
      readonly items: readonly (ProductImageUrl | { readonly status: "not_found" })[];
      readonly ok: true;
    }>(
      "/api/mini-program/v1/product-images/read-urls",
      { refs: [{ productId, variant, versionId }], shopId },
      this.#requireSession(),
    );
    const item = result.items[0];
    return item?.status === "ready" ? item : null;
  }

  async productImages(
    shopId: string,
    refs: readonly {
      readonly productId: string;
      readonly variant: "main" | "thumb";
      readonly versionId: string;
    }[],
  ): Promise<readonly ProductImageUrl[]> {
    this.#validateShop(shopId);
    if (refs.length > 16) throw new Error("invalid_image_batch");
    for (const ref of refs) {
      this.#validateShop(ref.productId);
      this.#validateShop(ref.versionId);
    }
    const result = await this.#http.post<{
      readonly items: readonly (ProductImageUrl | { readonly status: "not_found" })[];
      readonly ok: true;
    }>("/api/mini-program/v1/product-images/read-urls", { refs, shopId }, this.#requireSession());
    return result.items.filter((item): item is ProductImageUrl => item.status === "ready");
  }

  #requireSession(): ActiveSession {
    const session = this.#sessions.load();
    if (session === null) throw new Error("session_expired");
    return session;
  }

  #validateShop(shopId: string): void {
    if (!uuidPattern.test(shopId)) throw new Error("invalid_shop_id");
  }
}
