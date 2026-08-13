import {
  type CatalogArchivePayload,
  type CatalogEntityMutationPayload,
  type CatalogMutationAttemptState,
  CatalogMutationContractError,
  type CatalogMutationErrorCode,
  type CatalogMutationInput,
  type CatalogMutationOperation,
  type CatalogMutationRequestBody,
  type CatalogMutationResult,
  type CatalogMutationSuccessResponse,
  type CatalogPriceMutationPayload,
  type CatalogProductMutationPayload,
  type CatalogRelationArchivePayload,
} from "./contracts";
import type { HttpClient } from "./http-client";
import type { MiniProgramPlatform } from "./platform";
import type { SessionStore } from "./session-store";

const mutationPath = "/api/mini-program/v1/catalog/mutations";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const generatedUuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const maximumCatalogNumber = 999_999_999_999.999;

const mutationOperations = new Set<CatalogMutationOperation>([
  "product_create",
  "product_update",
  "product_archive",
  "product_restore",
  "product_price_update",
  "category_create",
  "category_update",
  "category_archive",
  "category_restore",
  "supplier_create",
  "supplier_update",
  "supplier_archive",
  "supplier_restore",
]);

export interface CatalogMutationAttemptIdentifiers {
  readonly correlationId: string;
  readonly idempotencyKey: string;
}

interface PreparedCatalogMutation {
  readonly body: CatalogMutationRequestBody;
  readonly expectedTargetId: string | null;
}

function inputFromPrepared(prepared: PreparedCatalogMutation): CatalogMutationInput {
  const { schemaVersion: _schemaVersion, ...input } = prepared.body;
  return input as CatalogMutationInput;
}

export function canonicalizeCatalogMutationInput(
  input: CatalogMutationInput,
): CatalogMutationInput {
  return inputFromPrepared(prepareCatalogMutation(input));
}

function validationFailure(): never {
  throw new CatalogMutationContractError("validation_failed");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.getOwnPropertyDescriptor(record, key) !== undefined;
}

function assertExactKeys(record: Record<string, unknown>, expectedKeys: readonly string[]): void {
  const keys = Object.keys(record);
  if (keys.length !== expectedKeys.length || keys.some((key) => !expectedKeys.includes(key))) {
    validationFailure();
  }
}

function requiredString(
  record: Record<string, unknown>,
  key: string,
  maximumLength: number,
): string {
  const value = record[key];
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maximumLength ||
    value.trim().length === 0
  ) {
    validationFailure();
  }
  return value;
}

function optionalString(
  record: Record<string, unknown>,
  key: string,
  maximumLength: number,
): string | undefined {
  if (!hasOwn(record, key)) return undefined;
  const value = record[key];
  if (typeof value !== "string" || value.length > maximumLength) validationFailure();
  return value;
}

function assertUuid(value: unknown): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) validationFailure();
  return value;
}

function assertRevision(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 64 ||
    !timestampPattern.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    validationFailure();
  }
  return value;
}

function decimalPlaces(value: number): number {
  const [coefficient = "", exponentText] = value.toString().toLowerCase().split("e");
  const decimalIndex = coefficient.indexOf(".");
  const coefficientPlaces = decimalIndex < 0 ? 0 : coefficient.length - decimalIndex - 1;
  const exponent = exponentText === undefined ? 0 : Number(exponentText);
  return Math.max(0, coefficientPlaces - exponent);
}

function assertCatalogNumber(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > maximumCatalogNumber ||
    decimalPlaces(value) > 3
  ) {
    validationFailure();
  }
  return value;
}

function optionalCatalogNumber(
  record: Record<string, unknown>,
  key: string,
): number | null | undefined {
  if (!hasOwn(record, key)) return undefined;
  return record[key] === null ? null : assertCatalogNumber(record[key]);
}

function optionalUuid(record: Record<string, unknown>, key: string): string | null | undefined {
  if (!hasOwn(record, key)) return undefined;
  return record[key] === null ? null : assertUuid(record[key]);
}

function validatedProductPayload(value: unknown): CatalogProductMutationPayload {
  if (!isRecord(value)) validationFailure();
  const allowedKeys = [
    "barcode",
    "categoryId",
    "itemNumber",
    "productName",
    "purchasePrice",
    "retailPrice",
    "secondProductName",
    "stockQuantity",
    "supplierId",
  ] as const;
  if (
    Object.keys(value).some((key) => !allowedKeys.includes(key as (typeof allowedKeys)[number]))
  ) {
    validationFailure();
  }

  const barcode = requiredString(value, "barcode", 96);
  const productName = requiredString(value, "productName", 240);
  const categoryId = optionalUuid(value, "categoryId");
  const itemNumber = optionalString(value, "itemNumber", 120);
  const purchasePrice = optionalCatalogNumber(value, "purchasePrice");
  const retailPrice = optionalCatalogNumber(value, "retailPrice");
  const secondProductName = optionalString(value, "secondProductName", 240);
  const stockQuantity = optionalCatalogNumber(value, "stockQuantity");
  const supplierId = optionalUuid(value, "supplierId");

  return {
    barcode,
    ...(categoryId === undefined ? {} : { categoryId }),
    ...(itemNumber === undefined ? {} : { itemNumber }),
    productName,
    ...(purchasePrice === undefined ? {} : { purchasePrice: purchasePrice ?? validationFailure() }),
    ...(retailPrice === undefined ? {} : { retailPrice: retailPrice ?? validationFailure() }),
    ...(secondProductName === undefined ? {} : { secondProductName }),
    ...(stockQuantity === undefined ? {} : { stockQuantity }),
    ...(supplierId === undefined ? {} : { supplierId }),
  };
}

function archivePayload(value: unknown): CatalogArchivePayload {
  if (!isRecord(value)) validationFailure();
  assertExactKeys(value, ["reason"]);
  return { reason: requiredString(value, "reason", 240) };
}

function relationArchivePayload(value: unknown): CatalogRelationArchivePayload {
  if (!isRecord(value)) validationFailure();
  const expectedKeys = hasOwn(value, "replacementId") ? ["reason", "replacementId"] : ["reason"];
  assertExactKeys(value, expectedKeys);
  const replacement = value.replacementId;
  if (hasOwn(value, "replacementId") && replacement === undefined) validationFailure();
  if (replacement !== undefined && replacement !== null) assertUuid(replacement);
  return {
    reason: requiredString(value, "reason", 240),
    ...(replacement === undefined ? {} : { replacementId: replacement as string | null }),
  };
}

function entityPayload(value: unknown): CatalogEntityMutationPayload {
  if (!isRecord(value)) validationFailure();
  assertExactKeys(value, ["name"]);
  return { name: requiredString(value, "name", 160) };
}

function pricePayload(value: unknown): CatalogPriceMutationPayload {
  if (!isRecord(value)) validationFailure();
  assertExactKeys(value, ["price", "priceType"]);
  const priceType = value.priceType;
  if (priceType !== "PURCHASE" && priceType !== "RETAIL") validationFailure();
  return { price: assertCatalogNumber(value.price), priceType };
}

function isCreateOperation(operation: CatalogMutationOperation): boolean {
  return (
    operation === "product_create" ||
    operation === "category_create" ||
    operation === "supplier_create"
  );
}

function validatedPayload(operation: CatalogMutationOperation, payload: unknown): object {
  switch (operation) {
    case "product_create":
    case "product_update":
      return validatedProductPayload(payload);
    case "product_archive":
    case "product_restore":
    case "category_restore":
    case "supplier_restore":
      return archivePayload(payload);
    case "product_price_update":
      return pricePayload(payload);
    case "category_create":
    case "category_update":
    case "supplier_create":
    case "supplier_update":
      return entityPayload(payload);
    case "category_archive":
    case "supplier_archive":
      return relationArchivePayload(payload);
  }
}

function prepareCatalogMutation(input: CatalogMutationInput): PreparedCatalogMutation {
  if (!isRecord(input)) validationFailure();
  const operation = input.operation;
  if (
    typeof operation !== "string" ||
    !mutationOperations.has(operation as CatalogMutationOperation)
  ) {
    validationFailure();
  }
  const typedOperation = operation as CatalogMutationOperation;
  const createsEntity = isCreateOperation(typedOperation);
  const createHasTarget = createsEntity && hasOwn(input, "targetId");
  assertExactKeys(
    input,
    createsEntity
      ? createHasTarget
        ? ["operation", "payload", "shopId", "targetId"]
        : ["operation", "payload", "shopId"]
      : ["expectedUpdatedAt", "operation", "payload", "shopId", "targetId"],
  );

  const shopId = assertUuid(input.shopId);
  const payload = validatedPayload(typedOperation, input.payload);
  if (createsEntity) {
    const targetId = createHasTarget ? assertUuid(input.targetId) : undefined;
    return {
      body: {
        operation: typedOperation,
        payload,
        schemaVersion: 1,
        shopId,
        ...(targetId === undefined ? {} : { targetId }),
      } as CatalogMutationRequestBody,
      expectedTargetId: targetId ?? null,
    };
  }

  const targetId = assertUuid(input.targetId);
  const expectedUpdatedAt = assertRevision(input.expectedUpdatedAt);
  if (
    (typedOperation === "category_archive" || typedOperation === "supplier_archive") &&
    isRecord(payload) &&
    payload.replacementId === targetId
  ) {
    validationFailure();
  }
  return {
    body: {
      expectedUpdatedAt,
      operation: typedOperation,
      payload,
      schemaVersion: 1,
      shopId,
      targetId,
    } as CatalogMutationRequestBody,
    expectedTargetId: targetId,
  };
}

function invalidBackendResponse(): never {
  throw new CatalogMutationContractError("backend_temporary");
}

function parseMutationResult(
  value: unknown,
  prepared: PreparedCatalogMutation,
  identifiers: CatalogMutationAttemptIdentifiers,
): CatalogMutationResult {
  if (!isRecord(value)) invalidBackendResponse();
  assertBackendKeys(value, ["mutation", "ok"]);
  if (value.ok !== true || !isRecord(value.mutation)) invalidBackendResponse();
  const mutation = value.mutation;
  assertBackendKeys(mutation, [
    "code",
    "correlationId",
    "replayed",
    "shopId",
    "targetId",
    "updatedAt",
  ]);
  if (
    mutation.code !== "success" ||
    mutation.correlationId !== identifiers.correlationId ||
    typeof mutation.replayed !== "boolean" ||
    mutation.shopId !== prepared.body.shopId ||
    typeof mutation.targetId !== "string" ||
    !uuidPattern.test(mutation.targetId) ||
    (prepared.expectedTargetId !== null && mutation.targetId !== prepared.expectedTargetId) ||
    typeof mutation.updatedAt !== "string" ||
    !timestampPattern.test(mutation.updatedAt) ||
    !Number.isFinite(Date.parse(mutation.updatedAt))
  ) {
    invalidBackendResponse();
  }
  return mutation as unknown as CatalogMutationResult;
}

function assertBackendKeys(record: Record<string, unknown>, expectedKeys: readonly string[]): void {
  const keys = Object.keys(record);
  if (keys.length !== expectedKeys.length || keys.some((key) => !expectedKeys.includes(key))) {
    invalidBackendResponse();
  }
}

function uuidFromBytes(bytes: Uint8Array, offset: number): string {
  const value = bytes.slice(offset, offset + 16);
  value[6] = ((value[6] ?? 0) & 0x0f) | 0x40;
  value[8] = ((value[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...value].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function createCatalogMutationAttemptIdentifiers(
  platform: MiniProgramPlatform,
): Promise<CatalogMutationAttemptIdentifiers> {
  let bytes: Uint8Array;
  try {
    bytes = await platform.randomBytes(32);
  } catch {
    throw new CatalogMutationContractError("backend_temporary");
  }
  if (bytes.length !== 32) throw new CatalogMutationContractError("backend_temporary");
  const idempotencyKey = uuidFromBytes(bytes, 0);
  const correlationId = uuidFromBytes(bytes, 16);
  if (idempotencyKey === correlationId) {
    throw new CatalogMutationContractError("backend_temporary");
  }
  return { correlationId, idempotencyKey };
}

export function validateCatalogMutationAttemptIdentifiers(
  identifiers: CatalogMutationAttemptIdentifiers,
): CatalogMutationAttemptIdentifiers {
  if (
    !generatedUuidPattern.test(identifiers.correlationId) ||
    !generatedUuidPattern.test(identifiers.idempotencyKey) ||
    identifiers.correlationId === identifiers.idempotencyKey
  ) {
    validationFailure();
  }
  return identifiers;
}

export class CatalogMutationClient {
  readonly #http: HttpClient;
  readonly #sessions: SessionStore;

  constructor(http: HttpClient, sessions: SessionStore) {
    this.#http = http;
    this.#sessions = sessions;
  }

  async mutate(
    input: CatalogMutationInput,
    attemptIdentifiers: CatalogMutationAttemptIdentifiers,
  ): Promise<CatalogMutationResult> {
    const prepared = prepareCatalogMutation(input);
    const identifiers = validateCatalogMutationAttemptIdentifiers(attemptIdentifiers);
    const session = this.#sessions.load();
    if (session === null) throw new CatalogMutationContractError("session_expired");

    const response = await this.#http.post<CatalogMutationSuccessResponse>(
      mutationPath,
      prepared.body,
      session,
      {
        correlationId: identifiers.correlationId,
        errorDomain: "catalog_mutation",
        idempotencyKey: identifiers.idempotencyKey,
      },
    );
    return parseMutationResult(response, prepared, identifiers);
  }
}

function normalizedMutationError(error: unknown): CatalogMutationContractError {
  return error instanceof CatalogMutationContractError
    ? error
    : new CatalogMutationContractError("backend_temporary");
}

function isAmbiguousMutationError(
  code: CatalogMutationErrorCode,
): code is "backend_temporary" | "offline" | "retryable_error" {
  return code === "backend_temporary" || code === "offline" || code === "retryable_error";
}

export class CatalogMutationAttemptController {
  readonly #client: CatalogMutationClient;
  readonly #platform: MiniProgramPlatform;
  readonly #outbox:
    | {
        enqueue(
          input: CatalogMutationInput,
          identifiers: CatalogMutationAttemptIdentifiers,
        ): string;
        recordFailure(entryId: string, code: CatalogMutationErrorCode): void;
        recordSending(entryId: string): void;
        recordSuccess(entryId: string): void;
      }
    | undefined;
  readonly #onSucceeded: ((mutation: CatalogMutationResult) => void) | undefined;
  #outboxEntryId: string | null = null;
  #identifiers: CatalogMutationAttemptIdentifiers | null = null;
  #inFlight: Promise<CatalogMutationResult> | null = null;
  #input: CatalogMutationInput | null = null;
  #state: CatalogMutationAttemptState = { lifecycle: "idle" };

  constructor(
    client: CatalogMutationClient,
    platform: MiniProgramPlatform,
    outbox?: {
      enqueue(input: CatalogMutationInput, identifiers: CatalogMutationAttemptIdentifiers): string;
      recordFailure(entryId: string, code: CatalogMutationErrorCode): void;
      recordSending(entryId: string): void;
      recordSuccess(entryId: string): void;
    },
    onSucceeded?: (mutation: CatalogMutationResult) => void,
  ) {
    this.#client = client;
    this.#outbox = outbox;
    this.#onSucceeded = onSucceeded;
    this.#platform = platform;
  }

  get state(): CatalogMutationAttemptState {
    return this.#state;
  }

  start(input: CatalogMutationInput): Promise<CatalogMutationResult> {
    if (this.#inFlight !== null) return this.#inFlight;
    if (this.#state.lifecycle !== "idle") {
      return Promise.reject(new CatalogMutationContractError("invalid_state"));
    }
    let canonicalInput: CatalogMutationInput;
    try {
      canonicalInput = inputFromPrepared(prepareCatalogMutation(input));
    } catch (error) {
      const normalized = normalizedMutationError(error);
      this.#state = { errorCode: normalized.code, lifecycle: "failed" };
      return Promise.reject(normalized);
    }

    this.#input = canonicalInput;
    this.#state = { lifecycle: "preparing" };
    const request = this.#runInitial(canonicalInput);
    this.#inFlight = request;
    return request;
  }

  retry(): Promise<CatalogMutationResult> {
    if (this.#inFlight !== null) return this.#inFlight;
    if (
      this.#state.lifecycle !== "retryable_error" ||
      this.#input === null ||
      this.#identifiers === null
    ) {
      return Promise.reject(new CatalogMutationContractError("invalid_state"));
    }
    const request = this.#runWithIdentifiers(this.#input, this.#identifiers);
    this.#inFlight = request;
    return request;
  }

  reset(): void {
    if (this.#inFlight !== null) throw new CatalogMutationContractError("invalid_state");
    this.#identifiers = null;
    this.#input = null;
    this.#outboxEntryId = null;
    this.#state = { lifecycle: "idle" };
  }

  async #runInitial(input: CatalogMutationInput): Promise<CatalogMutationResult> {
    try {
      const identifiers = await createCatalogMutationAttemptIdentifiers(this.#platform);
      this.#identifiers = identifiers;
      const durableInput =
        isCreateOperation(input.operation) && !("targetId" in input)
          ? canonicalizeCatalogMutationInput({
              ...input,
              targetId: identifiers.idempotencyKey,
            } as CatalogMutationInput)
          : input;
      this.#input = durableInput;
      this.#outboxEntryId = this.#outbox?.enqueue(durableInput, identifiers) ?? null;
      return await this.#submit(durableInput, identifiers);
    } catch (error) {
      return this.#fail(error);
    } finally {
      this.#inFlight = null;
    }
  }

  async #runWithIdentifiers(
    input: CatalogMutationInput,
    identifiers: CatalogMutationAttemptIdentifiers,
  ): Promise<CatalogMutationResult> {
    try {
      return await this.#submit(input, identifiers);
    } catch (error) {
      return this.#fail(error);
    } finally {
      this.#inFlight = null;
    }
  }

  async #submit(
    input: CatalogMutationInput,
    identifiers: CatalogMutationAttemptIdentifiers,
  ): Promise<CatalogMutationResult> {
    this.#state = {
      correlationId: identifiers.correlationId,
      lifecycle: "submitting",
    };
    if (this.#outboxEntryId) this.#outbox?.recordSending(this.#outboxEntryId);
    const mutation = await this.#client.mutate(input, identifiers);
    if (this.#outboxEntryId) this.#outbox?.recordSuccess(this.#outboxEntryId);
    this.#onSucceeded?.(mutation);
    this.#state = {
      correlationId: identifiers.correlationId,
      lifecycle: "succeeded",
      mutation,
    };
    return mutation;
  }

  #fail(error: unknown): never {
    const normalized = normalizedMutationError(error);
    if (this.#outboxEntryId) {
      this.#outbox?.recordFailure(this.#outboxEntryId, normalized.code);
    }
    const identifiers = this.#identifiers;
    if (identifiers !== null && isAmbiguousMutationError(normalized.code)) {
      this.#state = {
        correlationId: identifiers.correlationId,
        errorCode: normalized.code,
        lifecycle: "retryable_error",
      };
    } else {
      this.#state = { errorCode: normalized.code, lifecycle: "failed" };
    }
    throw normalized;
  }
}
