import test from "node:test";
import type { AuthorizedShop } from "../miniprogram/lib/contracts";
import { HttpClient } from "../miniprogram/lib/http-client";
import { SalesApiClient } from "../miniprogram/lib/sales-api-client";
import { SessionStore } from "../miniprogram/lib/session-store";
import {
  catalogConflictAction,
  hasCatalogCapability,
  isCatalogRevisionConflict,
  mutationErrorTranslationKey,
  planProductSave,
  planRelationArchive,
  validateProductForm,
} from "../miniprogram/pages/catalog-management";
import { assert, assertEqual, expectReject, FakePlatform } from "./fakes";

const shopId = "10000000-0000-4000-8000-000000000201";
const cursorId = "20000000-0000-4000-8000-000000000201";
const deviceId = "00000000-0000-4000-8000-000000000901";

function shopFixture(overrides: Partial<AuthorizedShop> = {}): AuthorizedShop {
  return {
    can_change_prices: false,
    can_manage_images: false,
    can_read_catalog: true,
    can_read_catalog_history: false,
    can_write_categories: false,
    can_write_products: false,
    can_write_suppliers: false,
    currency_code: "CLP",
    role_key: "shop_owner",
    server_time: "2026-08-13T00:00:00Z",
    shop_code: "S1",
    shop_id: shopId,
    shop_name: "Shop",
    time_zone: "America/Santiago",
    ...overrides,
  };
}

function activeApi(platform: FakePlatform): SalesApiClient {
  const sessions = new SessionStore(platform, () => 1_000);
  sessions.save(
    {
      accountFingerprint: "f".repeat(64),
      expiresAt: 4_600,
      expiresIn: 3_600,
      sessionToken: "a".repeat(43),
      tokenType: "bearer",
      user: { provider: "custom:wechat" },
    },
    deviceId,
  );
  return new SalesApiClient(new HttpClient("https://staging.example.com", platform), sessions);
}

test("catalog page gates use explicit server capability booleans rather than role inference", () => {
  assertEqual(
    hasCatalogCapability(shopFixture({ role_key: "shop_owner" }), "can_write_products"),
    false,
    "owner role alone grants no UI action",
  );
  assertEqual(
    hasCatalogCapability(
      shopFixture({ can_write_products: true, role_key: "viewer" }),
      "can_write_products",
    ),
    true,
    "the explicit capability is the only UI input",
  );
});

test("product form emits explicit nullable relationships and a single bounded initial price payload", () => {
  const result = validateProductForm({
    barcode: " 1234567890123 ",
    categoryId: "",
    itemNumber: "ITEM-1",
    productName: "Tea",
    purchasePrice: "1.125",
    retailPrice: "2",
    secondProductName: "Green",
    stockQuantity: "",
    supplierId: "",
  });
  assert(result.ok, "valid form");
  assertEqual(result.payload.categoryId, null, "None explicitly clears category");
  assertEqual(result.payload.barcode, "1234567890123", "barcode identity is trimmed like Android");
  assertEqual(result.payload.supplierId, null, "None explicitly clears supplier");
  assertEqual(result.payload.stockQuantity, null, "empty nullable stock is explicit");
  assertEqual(result.payload.purchasePrice, 1.125, "initial purchase price retained once");
  assertEqual(result.payload.retailPrice, 2, "initial retail price retained once");
  assertEqual(mutationErrorTranslationKey("stale_version"), "conflictMessage", "CAS conflict copy");
  assertEqual(mutationErrorTranslationKey("offline"), "offline", "offline form copy");

  const createPlan = planProductSave({
    canChangePrices: true,
    mode: "create",
    originalBasePayload: "",
    originalPurchasePrice: null,
    originalRetailPrice: null,
    payload: result.payload,
  });
  assert(createPlan.ok, "valid create plan");
  assertEqual(createPlan.stages.length, 1, "create uses one mutation stage");
  assertEqual(createPlan.stages[0]?.kind, "create", "initial prices remain in product_create");
});

test("product form uses the canonical price ceiling", () => {
  const maximum = validateProductForm({
    barcode: "MAX-PRICE",
    categoryId: "",
    itemNumber: "",
    productName: "Maximum",
    purchasePrice: "999999999999.999",
    retailPrice: "",
    secondProductName: "",
    stockQuantity: "",
    supplierId: "",
  });
  const overMaximum = validateProductForm({
    barcode: "OVER-PRICE",
    categoryId: "",
    itemNumber: "",
    productName: "Over",
    purchasePrice: "1000000000000",
    retailPrice: "",
    secondProductName: "",
    stockQuantity: "",
    supplierId: "",
  });

  assert(maximum.ok, "canonical maximum should be accepted by the form");
  assertEqual(overMaximum.ok, false, "one trillion must be rejected by the form");
});

test("product edit omits prices from base update and schedules only changed dedicated prices", () => {
  const payload = {
    barcode: "1234567890123",
    categoryId: null,
    itemNumber: "ITEM-2",
    productName: "Tea",
    purchasePrice: 1.125,
    retailPrice: 3,
    secondProductName: "Green",
    stockQuantity: 5,
    supplierId: null,
  };
  const originalBasePayload = JSON.stringify({
    barcode: payload.barcode,
    categoryId: payload.categoryId,
    itemNumber: "ITEM-1",
    productName: payload.productName,
    secondProductName: payload.secondProductName,
    stockQuantity: payload.stockQuantity,
    supplierId: payload.supplierId,
  });
  const plan = planProductSave({
    canChangePrices: true,
    mode: "edit",
    originalBasePayload,
    originalPurchasePrice: 1.125,
    originalRetailPrice: 2,
    payload,
  });
  assert(plan.ok, "valid edit plan");
  assert(
    !("purchasePrice" in plan.basePayload) && !("retailPrice" in plan.basePayload),
    "product_update payload never carries price fields",
  );
  assertEqual(plan.stages.length, 2, "base change and one changed price only");
  assertEqual(plan.stages[0]?.kind, "base", "base update precedes price CAS");
  assertEqual(plan.stages[1]?.kind, "price", "changed retail price uses dedicated operation");
  if (plan.stages[1]?.kind === "price") {
    assertEqual(plan.stages[1].priceType, "RETAIL", "unchanged purchase price is omitted");
  }
});

test("relation archive requires one server-side replacement instead of client product loops", () => {
  const blocked = planRelationArchive(4, "");
  assert(!blocked.ok, "referenced relation cannot archive without replacement");
  assertEqual(blocked.errorKey, "replacementRequired", "localized replacement state");
  const planned = planRelationArchive(4, cursorId);
  assert(planned.ok, "replacement produces one archive payload");
  assertEqual(planned.payload.replacementId, cursorId, "replacement is sent to server mutation");
});

test("revision conflicts require an explicit reload, manual reapply, or cancel decision", () => {
  assert(isCatalogRevisionConflict("stale_version"), "stale CAS enters conflict resolution");
  assert(isCatalogRevisionConflict("conflict"), "server conflict enters conflict resolution");
  assertEqual(isCatalogRevisionConflict("retryable_error"), false, "transient errors do not");
  assertEqual(catalogConflictAction(0), "reload_server", "first option adopts server data");
  assertEqual(catalogConflictAction(1), "reapply_manually", "second option rebases the draft");
  assertEqual(catalogConflictAction(2), "cancel", "third option preserves without overwrite");
  assertEqual(catalogConflictAction(undefined), "cancel", "native dismissal is fail-closed");
});

test("lifecycle and catalog history reads use exact bounded routes and cursor pairs", async () => {
  const platform = new FakePlatform();
  const api = activeApi(platform);
  platform.queuedResponses.push(
    { data: { entities: [], ok: true }, statusCode: 200 },
    { data: { events: [], ok: true }, statusCode: 200 },
  );
  await api.catalogLifecycle(shopId, "category", "archived", {
    beforeId: cursorId,
    beforeUpdatedAt: "2026-08-13T00:00:00Z",
    limit: 50,
  });
  await api.catalogHistory(shopId, {
    beforeAuditLogId: cursorId,
    beforeCreatedAt: "2026-08-13T00:00:00Z",
    entityType: "product",
    operation: "price_changed",
  });
  const lifecycleUrl = platform.requests[0]?.url ?? "";
  const historyUrl = platform.requests[1]?.url ?? "";
  assert(lifecycleUrl.includes("/api/mini-program/v1/catalog/lifecycle?"), "lifecycle route");
  assert(lifecycleUrl.includes("entity_type=category"), "lifecycle entity filter");
  assert(lifecycleUrl.includes("state=archived"), "archived state is server-filtered");
  assert(lifecycleUrl.includes(`before_id=${cursorId}`), "lifecycle id cursor");
  assert(historyUrl.includes("/api/mini-program/v1/catalog/history?"), "catalog history route");
  assert(historyUrl.includes("operation=price_changed"), "semantic operation filter");
  assert(historyUrl.includes(`before_audit_log_id=${cursorId}`), "audit cursor");

  await expectReject(
    () => api.catalogLifecycle(shopId, "product", "archived", { beforeId: cursorId }),
    (error) => error instanceof Error && error.message === "invalid_page_cursor",
  );
  await expectReject(
    () => api.catalogHistory(shopId, { beforeCreatedAt: "2026-08-13T00:00:00Z" }),
    (error) => error instanceof Error && error.message === "invalid_page_cursor",
  );
  assertEqual(platform.requests.length, 2, "invalid cursor pairs fail before transport");
});
