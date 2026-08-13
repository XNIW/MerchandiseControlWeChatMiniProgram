import test from "node:test";
import {
  CatalogMutationAttemptController,
  type CatalogMutationAttemptIdentifiers,
  CatalogMutationClient,
} from "../miniprogram/lib/catalog-mutation-client";
import {
  CatalogMutationContractError,
  type CatalogMutationErrorCode,
  type CatalogMutationInput,
} from "../miniprogram/lib/contracts";
import { HttpClient } from "../miniprogram/lib/http-client";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assert, assertEqual, expectReject, FakePlatform } from "./fakes";

const shopId = "10000000-0000-4000-8000-000000000201";
const productId = "20000000-0000-4000-8000-000000000201";
const createdProductId = "30000000-0000-4000-8000-000000000201";
const expectedUpdatedAt = "2026-08-13T12:00:00.123Z";
const deviceId = "00000000-0000-4000-8000-000000000901";
const directIdentifiers: CatalogMutationAttemptIdentifiers = {
  correlationId: "40000000-0000-4000-8000-000000000201",
  idempotencyKey: "50000000-0000-4000-8000-000000000201",
};
const generatedIdentifiers: CatalogMutationAttemptIdentifiers = {
  correlationId: "13243546-5768-498a-9bac-bdcedff00112",
  idempotencyKey: "03142536-4758-497a-8b9c-adbecfe0f102",
};

function activeClient(platform: FakePlatform): CatalogMutationClient {
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
  return new CatalogMutationClient(
    new HttpClient("https://staging.example.com", platform),
    sessions,
  );
}

function successResponse(
  correlationId: string,
  targetId: string,
  replayed = false,
): {
  readonly data: unknown;
  readonly statusCode: number;
} {
  return {
    data: {
      mutation: {
        code: "success",
        correlationId,
        replayed,
        shopId,
        targetId,
        updatedAt: expectedUpdatedAt,
      },
      ok: true,
    },
    statusCode: 200,
  };
}

function productCreateInput(): Extract<CatalogMutationInput, { operation: "product_create" }> {
  return {
    operation: "product_create",
    payload: {
      barcode: "780000000001",
      categoryId: "60000000-0000-4000-8000-000000000201",
      productName: "Tea",
      retailPrice: 1.005,
    },
    shopId,
  };
}

function assertMutationError(
  error: unknown,
  code: CatalogMutationErrorCode,
): error is CatalogMutationContractError {
  return error instanceof CatalogMutationContractError && error.code === code;
}

test("catalog create uses the exact gateway body and controlled replay headers", async () => {
  const platform = new FakePlatform();
  platform.queuedResponses.push(successResponse(directIdentifiers.correlationId, createdProductId));
  const result = await activeClient(platform).mutate(productCreateInput(), directIdentifiers);

  assertEqual(result.targetId, createdProductId, "server-assigned create target is returned");
  const request = platform.requests[0];
  assert(request !== undefined, "mutation request exists");
  assertEqual(request.method, "POST", "mutation method");
  assert(request.url.endsWith("/api/mini-program/v1/catalog/mutations"), "fixed mutation path");
  assertEqual(
    request.headers?.Authorization,
    `Bearer ${"a".repeat(43)}`,
    "opaque bearer remains present",
  );
  assertEqual(
    request.headers?.["Idempotency-Key"],
    directIdentifiers.idempotencyKey,
    "idempotency header",
  );
  assertEqual(
    request.headers?.["X-Correlation-ID"],
    directIdentifiers.correlationId,
    "correlation header",
  );
  assertEqual(
    JSON.stringify(request.data),
    JSON.stringify({
      operation: "product_create",
      payload: {
        barcode: "780000000001",
        categoryId: "60000000-0000-4000-8000-000000000201",
        productName: "Tea",
        retailPrice: 1.005,
      },
      schemaVersion: 1,
      shopId,
    }),
    "request is rebuilt from the exact v1 contract",
  );
});

test("the complete controlled operation set is accepted with create or versioned envelopes", async () => {
  const platform = new FakePlatform();
  const client = activeClient(platform);
  const product = productCreateInput().payload;
  const inputs: readonly CatalogMutationInput[] = [
    productCreateInput(),
    {
      expectedUpdatedAt,
      operation: "product_update",
      payload: product,
      shopId,
      targetId: productId,
    },
    {
      expectedUpdatedAt,
      operation: "product_archive",
      payload: { reason: "Archived" },
      shopId,
      targetId: productId,
    },
    {
      expectedUpdatedAt,
      operation: "product_restore",
      payload: { reason: "Restored" },
      shopId,
      targetId: productId,
    },
    {
      expectedUpdatedAt,
      operation: "product_price_update",
      payload: { price: 10, priceType: "PURCHASE" },
      shopId,
      targetId: productId,
    },
    { operation: "category_create", payload: { name: "Tea" }, shopId },
    {
      expectedUpdatedAt,
      operation: "category_update",
      payload: { name: "Hot tea" },
      shopId,
      targetId: productId,
    },
    {
      expectedUpdatedAt,
      operation: "category_archive",
      payload: { reason: "Merged" },
      shopId,
      targetId: productId,
    },
    {
      expectedUpdatedAt,
      operation: "category_restore",
      payload: { reason: "Restored" },
      shopId,
      targetId: productId,
    },
    { operation: "supplier_create", payload: { name: "Supplier" }, shopId },
    {
      expectedUpdatedAt,
      operation: "supplier_update",
      payload: { name: "Supplier two" },
      shopId,
      targetId: productId,
    },
    {
      expectedUpdatedAt,
      operation: "supplier_archive",
      payload: { reason: "Unused", replacementId: null },
      shopId,
      targetId: productId,
    },
    {
      expectedUpdatedAt,
      operation: "supplier_restore",
      payload: { reason: "Restored" },
      shopId,
      targetId: productId,
    },
  ];
  for (const input of inputs) {
    const targetId = "targetId" in input ? input.targetId : createdProductId;
    platform.queuedResponses.push(successResponse(directIdentifiers.correlationId, targetId));
    await client.mutate(input, directIdentifiers);
  }
  assertEqual(
    platform.requests.length,
    inputs.length,
    "every controlled operation reaches gateway",
  );
  assertEqual(
    JSON.stringify(
      platform.requests.map((request) => (request.data as { operation: string }).operation),
    ),
    JSON.stringify(inputs.map((input) => input.operation)),
    "operation names remain exact",
  );
});

test("versioned mutations reject malformed ids, revisions, price precision and extra keys", async () => {
  const platform = new FakePlatform();
  const client = activeClient(platform);
  const validPriceInput: CatalogMutationInput = {
    expectedUpdatedAt,
    operation: "product_price_update",
    payload: { price: 123.456, priceType: "RETAIL" },
    shopId,
    targetId: productId,
  };
  platform.queuedResponses.push(successResponse(directIdentifiers.correlationId, productId));
  assertEqual(
    (await client.mutate(validPriceInput, directIdentifiers)).updatedAt,
    expectedUpdatedAt,
    "three-decimal price is accepted",
  );

  platform.queuedResponses.push(successResponse(directIdentifiers.correlationId, productId));
  const maximumPriceInput: CatalogMutationInput = {
    ...validPriceInput,
    payload: { price: 999_999_999_999.999, priceType: "RETAIL" as const },
  };
  assertEqual(
    (await client.mutate(maximumPriceInput, directIdentifiers)).updatedAt,
    expectedUpdatedAt,
    "canonical maximum price is accepted",
  );

  const invalidInputs: CatalogMutationInput[] = [
    { ...validPriceInput, targetId: "not-a-uuid" },
    { ...validPriceInput, expectedUpdatedAt: "yesterday" },
    {
      ...validPriceInput,
      payload: { price: 12.3456, priceType: "RETAIL" },
    } as unknown as CatalogMutationInput,
    {
      ...validPriceInput,
      payload: { price: -1, priceType: "RETAIL" },
    } as unknown as CatalogMutationInput,
    {
      ...validPriceInput,
      payload: { price: 1_000_000_000_000, priceType: "RETAIL" },
    } as unknown as CatalogMutationInput,
    {
      ...validPriceInput,
      payload: { price: 1, priceType: "RETAIL", rawSql: "select secret" },
    } as unknown as CatalogMutationInput,
    {
      operation: "product_price_update",
      payload: { price: 1, priceType: "RETAIL" },
      shopId,
      targetId: productId,
    } as unknown as CatalogMutationInput,
    {
      ...productCreateInput(),
      expectedUpdatedAt,
    } as unknown as CatalogMutationInput,
  ];
  for (const input of invalidInputs) {
    await expectReject(
      () => client.mutate(input, directIdentifiers),
      (error) => assertMutationError(error, "validation_failed"),
    );
  }
  assertEqual(platform.requests.length, 2, "invalid mutations fail before transport");
});

test("relation replacement cannot target itself and explicit null remains supported", async () => {
  const platform = new FakePlatform();
  const client = activeClient(platform);
  const base: CatalogMutationInput = {
    expectedUpdatedAt,
    operation: "category_archive",
    payload: { reason: "No longer used", replacementId: null },
    shopId,
    targetId: productId,
  };
  platform.queuedResponses.push(successResponse(directIdentifiers.correlationId, productId));
  await client.mutate(base, directIdentifiers);
  const clearRequest = platform.requests[0];
  assert(clearRequest !== undefined, "clear-assignment request exists");
  assertEqual(
    (clearRequest.data as { payload: { replacementId: unknown } }).payload.replacementId,
    null,
    "null explicitly requests assignment clearing",
  );

  await expectReject(
    () =>
      client.mutate(
        { ...base, payload: { reason: "Replace", replacementId: productId } },
        directIdentifiers,
      ),
    (error) => assertMutationError(error, "validation_failed"),
  );
  assertEqual(platform.requests.length, 1, "self replacement never reaches the gateway");
});

test("success responses are bound to correlation, shop, target and revision shape", async () => {
  const platform = new FakePlatform();
  const client = activeClient(platform);
  const input: CatalogMutationInput = {
    expectedUpdatedAt,
    operation: "product_restore",
    payload: { reason: "Returned to sale" },
    shopId,
    targetId: productId,
  };
  platform.queuedResponses.push(
    successResponse(directIdentifiers.correlationId, createdProductId),
    {
      data: {
        ...(successResponse(directIdentifiers.correlationId, productId).data as Record<
          string,
          unknown
        >),
        debug: "must not be accepted",
      },
      statusCode: 200,
    },
  );
  await expectReject(
    () => client.mutate(input, directIdentifiers),
    (error) => assertMutationError(error, "backend_temporary"),
  );
  await expectReject(
    () => client.mutate(input, directIdentifiers),
    (error) => assertMutationError(error, "backend_temporary"),
  );
});

test("typed mutation errors are preserved and unknown server errors are sanitized", async () => {
  const platform = new FakePlatform();
  const client = activeClient(platform);
  platform.queuedResponses.push(
    { data: { code: "permission_denied", ok: false }, statusCode: 403 },
    { data: { code: "database_password_exposed", detail: "internal" }, statusCode: 500 },
  );
  await expectReject(
    () => client.mutate(productCreateInput(), directIdentifiers),
    (error) => assertMutationError(error, "permission_denied"),
  );
  await expectReject(
    () => client.mutate(productCreateInput(), directIdentifiers),
    (error) =>
      assertMutationError(error, "backend_temporary") && error.message === "backend_temporary",
  );
});

test("attempt controller coalesces double submit and reuses identifiers after offline ambiguity", async () => {
  const platform = new FakePlatform();
  const controller = new CatalogMutationAttemptController(activeClient(platform), platform);
  const mutableInput = productCreateInput() as {
    operation: "product_create";
    payload: { barcode: string; productName: string; retailPrice: number };
    shopId: string;
  };
  const first = controller.start(mutableInput);
  const duplicate = controller.start(mutableInput);
  assert(first === duplicate, "double submit returns the same in-flight promise");
  await expectReject(
    () => first,
    (error) => assertMutationError(error, "offline"),
  );
  assertEqual(controller.state.lifecycle, "retryable_error", "offline state is retryable");
  const firstRequest = platform.requests[0];
  assert(firstRequest !== undefined, "first attempt was sent once");

  mutableInput.payload.productName = "Changed after timeout";
  platform.queuedResponses.push(
    successResponse(generatedIdentifiers.correlationId, generatedIdentifiers.idempotencyKey, true),
  );
  const retry = controller.retry();
  const duplicateRetry = controller.retry();
  assert(retry === duplicateRetry, "double retry is also coalesced");
  const result = await retry;
  assertEqual(result.replayed, true, "server replay acknowledgement is preserved");
  assertEqual(controller.state.lifecycle, "succeeded", "successful retry completes attempt");

  const retryRequest = platform.requests[1];
  assert(retryRequest !== undefined, "retry request exists");
  assertEqual(
    retryRequest.headers?.["Idempotency-Key"],
    firstRequest.headers?.["Idempotency-Key"],
    "ambiguous retry retains idempotency key",
  );
  assertEqual(
    retryRequest.headers?.["X-Correlation-ID"],
    firstRequest.headers?.["X-Correlation-ID"],
    "logical attempt retains correlation id",
  );
  assertEqual(
    JSON.stringify(retryRequest.data),
    JSON.stringify(firstRequest.data),
    "retry retains the original canonical payload even if caller state changes",
  );
  assertEqual(
    (firstRequest.data as { targetId?: string }).targetId,
    generatedIdentifiers.idempotencyKey,
    "controller binds a stable client entity UUID to the durable create",
  );
  assertEqual(platform.requests.length, 2, "one request per network attempt");
});

test("definitive denial ends an attempt and a reset creates fresh state", async () => {
  const platform = new FakePlatform();
  const controller = new CatalogMutationAttemptController(activeClient(platform), platform);
  platform.queuedResponses.push({
    data: { code: "permission_denied", ok: false },
    statusCode: 403,
  });
  await expectReject(
    () => controller.start(productCreateInput()),
    (error) => assertMutationError(error, "permission_denied"),
  );
  assertEqual(controller.state.lifecycle, "failed", "definitive error is not retryable");
  await expectReject(
    () => controller.retry(),
    (error) => assertMutationError(error, "invalid_state"),
  );
  controller.reset();
  assertEqual(controller.state.lifecycle, "idle", "reset permits a new logical attempt");
});
