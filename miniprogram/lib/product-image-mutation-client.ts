import { createCatalogMutationAttemptIdentifiers } from "./catalog-mutation-client";
import { CatalogMutationContractError } from "./contracts";
import type { HttpClient } from "./http-client";
import type { MiniProgramPlatform, PlatformImageInfo, PlatformResponse } from "./platform";
import type { SessionStore } from "./session-store";

const inputMaximumBytes = 25 * 1024 * 1024;
const inputMaximumPixels = 64_000_000;
const mainMaximumBytes = 1024 * 1024;
const mainMaximumSide = 1600;
const mainTargetBytes = 768_000;
const thumbMaximumBytes = 90 * 1024;
const thumbMaximumSide = 384;
const uploadTimeoutMilliseconds = 15_000;
const signedUrlSafetyWindowMilliseconds = 30_000;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256Pattern = /^[0-9a-f]{64}$/;
const cacheScopePattern = /^[0-9a-f]{64}$/;
const configuredOriginPattern =
  /^(https:\/\/[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::[1-9][0-9]{0,4})?)\/?$/;
const absoluteSignedUrlPattern =
  /^(https:\/\/[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::[1-9][0-9]{0,4})?)(\/[^?#]*)(\?[^#]+)$/;
const signedTokenPattern = /^token=[A-Za-z0-9._~%+=-]{16,4096}$/;
const sideFactors = [1, 0.85, 0.72, 0.61, 0.52, 0.44, 0.4] as const;
const durableAttemptIndexKey = "mc.productImageAttempts.v1.scopes";
const durableAttemptMaximumBytes = 8 * 1024;
const durableAttemptIndexMaximumBytes = 16 * 1024;

export type ProductImageMutationErrorCode =
  | "backend_contract_invalid"
  | "image_invalid"
  | "image_operation_cancelled"
  | "image_output_budget_exceeded"
  | "image_too_large"
  | "image_upload_failed"
  | "session_expired"
  | "signed_url_invalid"
  | "validation_failed";

export class ProductImageMutationError extends Error {
  readonly code: ProductImageMutationErrorCode;

  constructor(code: ProductImageMutationErrorCode) {
    super(code);
    this.name = "ProductImageMutationError";
    this.code = code;
  }
}

export interface ProductImageMutationClientOrigins {
  readonly adminBaseUrl: string;
  readonly supabaseStorageBaseUrl: string;
}

export interface ProductImageMetadata {
  readonly bytes: number;
  readonly height: number;
  readonly mimeType: "image/jpeg";
  readonly sha256: string;
  readonly width: number;
}

export interface ProductImageMutationResult {
  readonly imageUpdatedAt?: string;
  readonly status: "already_finalized" | "finalized" | "noop";
  readonly versionId: string;
}

export interface ProductImageRemoveResult {
  readonly cleanupStatus?: "complete" | "pending";
  readonly currentImageVersionId: null;
  readonly imageUpdatedAt?: string;
  readonly productId: string;
  readonly shopId: string;
  readonly status: "already_removed" | "removed";
  readonly versionId: string;
}

export interface ProductImageReadReference {
  readonly productId: string;
  readonly variant: "main" | "thumb";
  readonly versionId: string;
}

export type ProductImageReadItem =
  | (ProductImageReadReference & { readonly status: "not_found" })
  | (ProductImageReadReference & {
      readonly expiresAt: string;
      readonly metadata: ProductImageMetadata;
      readonly signedUrl: string;
      readonly status: "ready";
    });

export interface ProductImageReadResult {
  readonly cacheScope: string;
  readonly items: readonly ProductImageReadItem[];
}

interface PreparedVariant {
  readonly bytes: ArrayBuffer;
  readonly filePath: string;
  readonly imageInfo: PlatformImageInfo;
  readonly metadata: ProductImageMetadata;
}

interface ProductImageIntentAttempt {
  readonly accountFingerprint: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly main: PreparedVariant;
  readonly thumb: PreparedVariant;
}

interface StoredPreparedVariant {
  readonly filePath: string;
  readonly metadata: ProductImageMetadata;
}

interface StoredProductImageIntentAttempt {
  readonly accountFingerprint: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly main: StoredPreparedVariant;
  readonly productId: string;
  readonly schemaVersion: 1;
  readonly shopId: string;
  readonly thumb: StoredPreparedVariant;
}

interface ProductImageInFlightAttempt {
  readonly promise: Promise<ProductImageMutationResult>;
  readonly sessionGeneration: number;
}

interface SessionSnapshot {
  readonly accountFingerprint: string;
  readonly deviceId: string;
  readonly generation: number;
  readonly sessionToken: string;
}

interface EncodingPolicy {
  readonly hardMaximumBytes: number;
  readonly maximumSide: number;
  readonly minimumSide: number;
  readonly qualities: readonly number[];
  readonly targetBytes: number;
}

function fail(code: ProductImageMutationErrorCode): never {
  throw new ProductImageMutationError(code);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(record: Record<string, unknown>, expected: readonly string[]): boolean {
  const keys = Object.keys(record);
  return keys.length === expected.length && keys.every((key) => expected.includes(key));
}

function assertUuid(value: unknown): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) fail("validation_failed");
  return value;
}

function isTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function checkedPixelCount(width: number, height: number): boolean {
  return (
    Number.isSafeInteger(width) &&
    Number.isSafeInteger(height) &&
    width > 0 &&
    height > 0 &&
    height <= Math.floor(inputMaximumPixels / width)
  );
}

function outputDimensions(width: number, height: number, maximumSide: number) {
  if (!checkedPixelCount(width, height)) fail("image_invalid");
  const scale = Math.min(1, maximumSide / Math.max(width, height));
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

function outputSideSchedule(
  sourceLongestSide: number,
  initialMaximumSide: number,
  minimumSide: number,
) {
  const maximum = Math.min(sourceLongestSide, initialMaximumSide);
  if (maximum <= minimumSide || sourceLongestSide < minimumSide) return [maximum];
  return Array.from(
    new Set([
      ...sideFactors.map((factor) => Math.max(minimumSide, Math.floor(maximum * factor))),
      minimumSide,
    ]),
  ).filter((side) => side <= maximum);
}

function configuredOrigin(value: string): string {
  const match = configuredOriginPattern.exec(value);
  if (!match?.[1]) fail("validation_failed");
  return match[1].toLowerCase();
}

function expectedStoragePath(input: {
  operation: "sign" | "upload/sign";
  productId: string;
  shopId: string;
  variant: "main" | "thumb";
  versionId: string;
}) {
  return `/storage/v1/object/${input.operation}/product-images/shops/${input.shopId}/products/${input.productId}/primary/${input.versionId}/${input.variant}.jpg`;
}

function validatedSignedUrl(
  value: unknown,
  trustedOrigins: ReadonlySet<string>,
  expectedPath: string,
) {
  if (typeof value !== "string" || value.length > 8192) fail("signed_url_invalid");
  const match = absoluteSignedUrlPattern.exec(value);
  const origin = match?.[1]?.toLowerCase();
  const path = match?.[2];
  const query = match?.[3]?.slice(1);
  if (
    origin === undefined ||
    !trustedOrigins.has(origin) ||
    path !== expectedPath ||
    query === undefined ||
    query.includes("&") ||
    !signedTokenPattern.test(query)
  ) {
    fail("signed_url_invalid");
  }
  return value;
}

function parseMetadata(
  value: unknown,
  variant: ProductImageReadReference["variant"],
): ProductImageMetadata {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["bytes", "height", "mimeType", "sha256", "width"])
  ) {
    fail("backend_contract_invalid");
  }
  if (
    value.mimeType !== "image/jpeg" ||
    typeof value.sha256 !== "string" ||
    !sha256Pattern.test(value.sha256) ||
    typeof value.bytes !== "number" ||
    !Number.isSafeInteger(value.bytes) ||
    value.bytes < 1 ||
    typeof value.width !== "number" ||
    typeof value.height !== "number" ||
    !checkedPixelCount(value.width, value.height) ||
    value.bytes > (variant === "main" ? mainMaximumBytes : thumbMaximumBytes) ||
    Math.max(value.width, value.height) > (variant === "main" ? mainMaximumSide : thumbMaximumSide)
  ) {
    fail("backend_contract_invalid");
  }
  return value as unknown as ProductImageMetadata;
}

function isJpegBytes(bytes: ArrayBuffer): boolean {
  if (bytes.byteLength < 4) return false;
  const view = new Uint8Array(bytes);
  return (
    view[0] === 0xff &&
    view[1] === 0xd8 &&
    view[view.length - 2] === 0xff &&
    view[view.length - 1] === 0xd9
  );
}

function logicalImageInfo(imageInfo: PlatformImageInfo): PlatformImageInfo {
  const swapsDimensions =
    imageInfo.orientation === "left" ||
    imageInfo.orientation === "left-mirrored" ||
    imageInfo.orientation === "right" ||
    imageInfo.orientation === "right-mirrored";
  return swapsDimensions
    ? { ...imageInfo, height: imageInfo.width, width: imageInfo.height }
    : imageInfo;
}

function durableAttemptStorageKey(accountFingerprint: string, shopId: string, productId: string) {
  return `mc.productImageAttempts.v1.${accountFingerprint}.${shopId}.${productId}`;
}

function durableAttemptScope(accountFingerprint: string, shopId: string, productId: string) {
  return `${accountFingerprint}:${shopId}:${productId}`;
}

export class ProductImageMutationClient {
  readonly #http: HttpClient;
  readonly #nowMilliseconds: () => number;
  readonly #platform: MiniProgramPlatform;
  readonly #replaceInFlight = new Map<string, ProductImageInFlightAttempt>();
  readonly #retainedIntentAttempts = new Map<string, ProductImageIntentAttempt>();
  readonly #sessions: SessionStore;
  readonly #trustedOrigins: ReadonlySet<string>;

  constructor(
    http: HttpClient,
    sessions: SessionStore,
    platform: MiniProgramPlatform,
    origins: ProductImageMutationClientOrigins,
    nowMilliseconds = () => Date.now(),
  ) {
    this.#http = http;
    this.#sessions = sessions;
    this.#platform = platform;
    this.#nowMilliseconds = nowMilliseconds;
    configuredOrigin(origins.adminBaseUrl);
    this.#trustedOrigins = new Set([configuredOrigin(origins.supabaseStorageBaseUrl)]);
    this.#sessions.subscribe(() => {
      this.#replaceInFlight.clear();
      this.#retainedIntentAttempts.clear();
    });
  }

  selectAndReplace(shopId: string, productId: string): Promise<ProductImageMutationResult> {
    const validatedShopId = assertUuid(shopId);
    const validatedProductId = assertUuid(productId);
    const session = this.#sessionSnapshot();
    const targetKey = `${validatedShopId}:${validatedProductId}`;
    const active = this.#replaceInFlight.get(targetKey);
    if (active?.sessionGeneration === session.generation) return active.promise;
    if (active !== undefined) this.#replaceInFlight.delete(targetKey);
    const request = this.#selectAndReplace(validatedShopId, validatedProductId).finally(() => {
      if (this.#replaceInFlight.get(targetKey)?.promise === request) {
        this.#replaceInFlight.delete(targetKey);
      }
    });
    this.#replaceInFlight.set(targetKey, {
      promise: request,
      sessionGeneration: session.generation,
    });
    return request;
  }

  async #selectAndReplace(
    validatedShopId: string,
    validatedProductId: string,
  ): Promise<ProductImageMutationResult> {
    const session = this.#sessionSnapshot();
    const targetKey = `${validatedShopId}:${validatedProductId}`;
    let attempt = this.#retainedIntentAttempts.get(targetKey);
    if (attempt !== undefined && attempt.accountFingerprint !== session.accountFingerprint) {
      this.#retainedIntentAttempts.delete(targetKey);
      attempt = undefined;
    }
    if (attempt === undefined) {
      attempt = await this.#loadDurableAttempt(
        session.accountFingerprint,
        validatedShopId,
        validatedProductId,
      );
      this.#assertSession(session);
      if (attempt !== undefined) this.#retainedIntentAttempts.set(targetKey, attempt);
    }
    if (attempt === undefined) {
      const prepared = await this.#prepareSelectedImage();
      this.#assertSession(session);
      const identifiers = await createCatalogMutationAttemptIdentifiers(this.#platform);
      this.#assertSession(session);
      attempt = await this.#persistAttempt(
        session.accountFingerprint,
        validatedShopId,
        validatedProductId,
        identifiers,
        prepared,
      );
      this.#assertSession(session);
      this.#retainedIntentAttempts.set(targetKey, attempt);
    }

    try {
      const intentValue = await this.#http.post<unknown>(
        "/api/mini-program/v1/product-images/intent",
        {
          main: attempt.main.metadata,
          productId: validatedProductId,
          shopId: validatedShopId,
          thumb: attempt.thumb.metadata,
        },
        session,
        {
          correlationId: attempt.correlationId,
          errorDomain: "catalog_mutation",
          idempotencyKey: attempt.idempotencyKey,
        },
      );
      const intent = this.#parseIntent(intentValue, validatedShopId, validatedProductId);
      this.#assertSession(session);

      if (intent.status === "noop") {
        await this.#deleteRetainedAttempt(targetKey, validatedShopId, validatedProductId, attempt);
        return { status: "noop", versionId: intent.versionId };
      }

      await this.#upload(intent.mainUploadUrl, attempt.main.bytes, session);
      await this.#upload(intent.thumbUploadUrl, attempt.thumb.bytes, session);
      const result = await this.#finalize(
        validatedShopId,
        validatedProductId,
        intent.versionId,
        session,
      );
      await this.#deleteRetainedAttempt(targetKey, validatedShopId, validatedProductId, attempt);
      return result;
    } catch (error) {
      const retryable =
        (error instanceof CatalogMutationContractError &&
          ["backend_temporary", "offline", "retryable_error"].includes(error.code)) ||
        (error instanceof ProductImageMutationError && error.code === "image_upload_failed");
      if (!retryable) {
        await this.#deleteRetainedAttempt(targetKey, validatedShopId, validatedProductId, attempt);
      }
      throw error;
    }
  }

  async #deleteRetainedAttempt(
    targetKey: string,
    shopId: string,
    productId: string,
    attempt: ProductImageIntentAttempt,
  ): Promise<void> {
    if (this.#retainedIntentAttempts.get(targetKey) === attempt) {
      this.#retainedIntentAttempts.delete(targetKey);
    }
    const key = durableAttemptStorageKey(attempt.accountFingerprint, shopId, productId);
    this.#platform.removeStorage(key);
    this.#removeDurableAttemptScope(
      durableAttemptScope(attempt.accountFingerprint, shopId, productId),
    );
    await Promise.all([
      this.#removeSavedFile(attempt.main.filePath),
      this.#removeSavedFile(attempt.thumb.filePath),
    ]);
  }

  hasDurableAttempt(accountFingerprint: string, shopId: string): boolean {
    if (!cacheScopePattern.test(accountFingerprint) || !uuidPattern.test(shopId)) return false;
    const prefix = `${accountFingerprint}:${shopId}:`;
    return this.#durableAttemptScopes().some((scope) => scope.startsWith(prefix));
  }

  async discardDurableAttempts(accountFingerprint: string, shopId: string): Promise<void> {
    if (!cacheScopePattern.test(accountFingerprint) || !uuidPattern.test(shopId)) return;
    const prefix = `${accountFingerprint}:${shopId}:`;
    const scopes = this.#durableAttemptScopes();
    const removed = scopes.filter((scope) => scope.startsWith(prefix));
    for (const scope of removed) {
      const productId = scope.slice(prefix.length);
      if (!uuidPattern.test(productId)) continue;
      const key = durableAttemptStorageKey(accountFingerprint, shopId, productId);
      const stored = this.#parseStoredAttempt(this.#platform.getStorage(key));
      this.#platform.removeStorage(key);
      if (stored !== null) {
        await Promise.all([
          this.#removeSavedFile(stored.main.filePath),
          this.#removeSavedFile(stored.thumb.filePath),
        ]);
      }
      this.#retainedIntentAttempts.delete(`${shopId}:${productId}`);
    }
    this.#platform.setStorage(
      durableAttemptIndexKey,
      JSON.stringify(scopes.filter((scope) => !scope.startsWith(prefix))),
    );
  }

  async finalize(
    shopId: string,
    productId: string,
    versionId: string,
  ): Promise<ProductImageMutationResult> {
    const session = this.#sessionSnapshot();
    return this.#finalize(
      assertUuid(shopId),
      assertUuid(productId),
      assertUuid(versionId),
      session,
    );
  }

  async remove(
    shopId: string,
    productId: string,
    expectedVersionId: string,
  ): Promise<ProductImageRemoveResult> {
    const validatedShopId = assertUuid(shopId);
    const validatedProductId = assertUuid(productId);
    const validatedVersionId = assertUuid(expectedVersionId);
    const session = this.#sessionSnapshot();
    const value = await this.#http.post<unknown>(
      "/api/mini-program/v1/product-images/remove",
      {
        expectedVersionId: validatedVersionId,
        productId: validatedProductId,
        shopId: validatedShopId,
      },
      session,
      { errorDomain: "catalog_mutation" },
    );
    this.#assertSession(session);
    return this.#parseRemove(value, validatedShopId, validatedProductId, validatedVersionId);
  }

  async readUrls(
    shopId: string,
    refs: readonly ProductImageReadReference[],
  ): Promise<ProductImageReadResult> {
    const validatedShopId = assertUuid(shopId);
    if (refs.length < 1 || refs.length > 16) fail("validation_failed");
    const validatedRefs = refs.map((ref) => ({
      productId: assertUuid(ref.productId),
      variant:
        ref.variant === "main" || ref.variant === "thumb" ? ref.variant : fail("validation_failed"),
      versionId: assertUuid(ref.versionId),
    }));
    const session = this.#sessionSnapshot();
    const value = await this.#http.post<unknown>(
      "/api/mini-program/v1/product-images/read-urls",
      { refs: validatedRefs, shopId: validatedShopId },
      session,
      { errorDomain: "catalog_mutation" },
    );
    this.#assertSession(session);
    return this.#parseRead(value, validatedShopId, validatedRefs);
  }

  #sessionSnapshot(): SessionSnapshot {
    const session = this.#sessions.load();
    if (session === null) fail("session_expired");
    return {
      accountFingerprint: session.accountFingerprint,
      deviceId: session.deviceId,
      generation: this.#sessions.generation,
      sessionToken: session.sessionToken,
    };
  }

  #assertSession(snapshot: SessionSnapshot): void {
    const current = this.#sessions.load();
    if (
      current === null ||
      current.accountFingerprint !== snapshot.accountFingerprint ||
      current.sessionToken !== snapshot.sessionToken ||
      current.deviceId !== snapshot.deviceId ||
      this.#sessions.generation !== snapshot.generation
    ) {
      fail("session_expired");
    }
  }

  async #persistAttempt(
    accountFingerprint: string,
    shopId: string,
    productId: string,
    identifiers: { readonly correlationId: string; readonly idempotencyKey: string },
    prepared: { readonly main: PreparedVariant; readonly thumb: PreparedVariant },
  ): Promise<ProductImageIntentAttempt> {
    let mainPath: string | null = null;
    let thumbPath: string | null = null;
    try {
      mainPath = await this.#platform.saveFile(prepared.main.filePath);
      thumbPath = await this.#platform.saveFile(prepared.thumb.filePath);
      const main = await this.#rehydrateVariant(mainPath, prepared.main.metadata, "main");
      const thumb = await this.#rehydrateVariant(thumbPath, prepared.thumb.metadata, "thumb");
      const stored: StoredProductImageIntentAttempt = {
        accountFingerprint,
        correlationId: identifiers.correlationId,
        idempotencyKey: identifiers.idempotencyKey,
        main: { filePath: main.filePath, metadata: main.metadata },
        productId,
        schemaVersion: 1,
        shopId,
        thumb: { filePath: thumb.filePath, metadata: thumb.metadata },
      };
      const encoded = JSON.stringify(stored);
      if (encoded.length > durableAttemptMaximumBytes) fail("image_invalid");
      this.#platform.setStorage(
        durableAttemptStorageKey(accountFingerprint, shopId, productId),
        encoded,
      );
      this.#addDurableAttemptScope(durableAttemptScope(accountFingerprint, shopId, productId));
      return { accountFingerprint, ...identifiers, main, thumb };
    } catch (error) {
      if (mainPath !== null) await this.#removeSavedFile(mainPath);
      if (thumbPath !== null) await this.#removeSavedFile(thumbPath);
      if (error instanceof ProductImageMutationError) throw error;
      fail("image_invalid");
    }
  }

  async #loadDurableAttempt(
    accountFingerprint: string,
    shopId: string,
    productId: string,
  ): Promise<ProductImageIntentAttempt | undefined> {
    const key = durableAttemptStorageKey(accountFingerprint, shopId, productId);
    const stored = this.#parseStoredAttempt(this.#platform.getStorage(key));
    if (
      stored === null ||
      stored.accountFingerprint !== accountFingerprint ||
      stored.shopId !== shopId ||
      stored.productId !== productId
    ) {
      if (this.#platform.getStorage(key) !== undefined) this.#platform.removeStorage(key);
      this.#removeDurableAttemptScope(durableAttemptScope(accountFingerprint, shopId, productId));
      return undefined;
    }
    try {
      const [main, thumb] = await Promise.all([
        this.#rehydrateVariant(stored.main.filePath, stored.main.metadata, "main"),
        this.#rehydrateVariant(stored.thumb.filePath, stored.thumb.metadata, "thumb"),
      ]);
      return {
        accountFingerprint,
        correlationId: stored.correlationId,
        idempotencyKey: stored.idempotencyKey,
        main,
        thumb,
      };
    } catch {
      this.#platform.removeStorage(key);
      this.#removeDurableAttemptScope(durableAttemptScope(accountFingerprint, shopId, productId));
      await Promise.all([
        this.#removeSavedFile(stored.main.filePath),
        this.#removeSavedFile(stored.thumb.filePath),
      ]);
      return undefined;
    }
  }

  #parseStoredAttempt(value: unknown): StoredProductImageIntentAttempt | null {
    if (typeof value !== "string" || value.length > durableAttemptMaximumBytes) return null;
    try {
      const parsed = JSON.parse(value) as unknown;
      if (
        !isRecord(parsed) ||
        !hasExactKeys(parsed, [
          "accountFingerprint",
          "correlationId",
          "idempotencyKey",
          "main",
          "productId",
          "schemaVersion",
          "shopId",
          "thumb",
        ]) ||
        parsed.schemaVersion !== 1 ||
        typeof parsed.accountFingerprint !== "string" ||
        !cacheScopePattern.test(parsed.accountFingerprint) ||
        typeof parsed.correlationId !== "string" ||
        !uuidPattern.test(parsed.correlationId) ||
        typeof parsed.idempotencyKey !== "string" ||
        !uuidPattern.test(parsed.idempotencyKey) ||
        typeof parsed.shopId !== "string" ||
        !uuidPattern.test(parsed.shopId) ||
        typeof parsed.productId !== "string" ||
        !uuidPattern.test(parsed.productId)
      ) {
        return null;
      }
      const parseVariant = (value: unknown, variant: "main" | "thumb") => {
        if (
          !isRecord(value) ||
          !hasExactKeys(value, ["filePath", "metadata"]) ||
          typeof value.filePath !== "string" ||
          value.filePath.length < 1 ||
          value.filePath.length > 1024
        ) {
          fail("image_invalid");
        }
        return { filePath: value.filePath, metadata: parseMetadata(value.metadata, variant) };
      };
      return {
        accountFingerprint: parsed.accountFingerprint,
        correlationId: parsed.correlationId,
        idempotencyKey: parsed.idempotencyKey,
        main: parseVariant(parsed.main, "main"),
        productId: parsed.productId,
        schemaVersion: 1,
        shopId: parsed.shopId,
        thumb: parseVariant(parsed.thumb, "thumb"),
      };
    } catch {
      return null;
    }
  }

  async #rehydrateVariant(
    filePath: string,
    expected: ProductImageMetadata,
    variant: "main" | "thumb",
  ): Promise<PreparedVariant> {
    const [imageInfo, fileInfo, bytes] = await Promise.all([
      this.#platform.getImageInfo(filePath),
      this.#platform.getFileInfo(filePath),
      this.#platform.readFile(filePath),
    ]);
    const actual = parseMetadata(
      {
        bytes: fileInfo.size,
        height: imageInfo.height,
        mimeType: "image/jpeg",
        sha256: fileInfo.sha256.toLowerCase(),
        width: imageInfo.width,
      },
      variant,
    );
    if (
      imageInfo.type !== "jpeg" ||
      imageInfo.orientation !== "up" ||
      bytes.byteLength !== actual.bytes ||
      !isJpegBytes(bytes) ||
      JSON.stringify(actual) !== JSON.stringify(expected)
    ) {
      fail("image_invalid");
    }
    return { bytes, filePath, imageInfo, metadata: actual };
  }

  async #removeSavedFile(filePath: string): Promise<void> {
    try {
      await this.#platform.removeSavedFile(filePath);
    } catch {
      // A missing or already-cleaned sandbox file is safe and must not turn a
      // successful server mutation into an apparent failure.
    }
  }

  #durableAttemptScopes(): string[] {
    const value = this.#platform.getStorage(durableAttemptIndexKey);
    if (typeof value !== "string" || value.length > durableAttemptIndexMaximumBytes) return [];
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter(
            (entry): entry is string =>
              typeof entry === "string" && /^[0-9a-f]{64}:[0-9a-f-]{36}:[0-9a-f-]{36}$/.test(entry),
          )
        : [];
    } catch {
      return [];
    }
  }

  #addDurableAttemptScope(scope: string): void {
    const scopes = this.#durableAttemptScopes();
    if (scopes.includes(scope)) return;
    const encoded = JSON.stringify([...scopes, scope]);
    if (encoded.length > durableAttemptIndexMaximumBytes) fail("image_invalid");
    this.#platform.setStorage(durableAttemptIndexKey, encoded);
  }

  #removeDurableAttemptScope(scope: string): void {
    this.#platform.setStorage(
      durableAttemptIndexKey,
      JSON.stringify(this.#durableAttemptScopes().filter((entry) => entry !== scope)),
    );
  }

  async #prepareSelectedImage() {
    let selected: Awaited<ReturnType<MiniProgramPlatform["chooseImage"]>>;
    try {
      selected = await this.#platform.chooseImage();
    } catch (error) {
      if (error instanceof Error && error.message === "image_selection_cancelled") {
        fail("image_operation_cancelled");
      }
      fail("image_invalid");
    }
    if (
      selected.fileType !== "image" ||
      !Number.isSafeInteger(selected.size) ||
      selected.size < 1 ||
      selected.tempFilePath.length < 1
    ) {
      fail("image_invalid");
    }
    if (selected.size > inputMaximumBytes) fail("image_too_large");

    let sourceInfo: PlatformImageInfo;
    try {
      sourceInfo = await this.#platform.getImageInfo(selected.tempFilePath);
    } catch {
      fail("image_invalid");
    }
    if (sourceInfo.type !== "jpeg" || !checkedPixelCount(sourceInfo.width, sourceInfo.height)) {
      // wx.compressImage does not guarantee conversion of non-JPEG sources on
      // every supported platform (notably iOS), so unsupported input fails closed.
      fail("image_invalid");
    }

    const main = await this.#encodeWithinBudget(
      selected.tempFilePath,
      logicalImageInfo(sourceInfo),
      {
        hardMaximumBytes: mainMaximumBytes,
        maximumSide: mainMaximumSide,
        minimumSide: 640,
        qualities: [82, 76, 70],
        targetBytes: mainTargetBytes,
      },
    );
    const thumb = await this.#encodeWithinBudget(main.filePath, main.imageInfo, {
      hardMaximumBytes: thumbMaximumBytes,
      maximumSide: thumbMaximumSide,
      minimumSide: 128,
      qualities: [75, 68, 60, 52],
      targetBytes: thumbMaximumBytes,
    });
    if (
      Math.abs(
        main.metadata.width / main.metadata.height - thumb.metadata.width / thumb.metadata.height,
      ) > 0.02
    ) {
      fail("image_invalid");
    }
    return { main, thumb };
  }

  async #encodeWithinBudget(
    sourcePath: string,
    sourceInfo: PlatformImageInfo,
    policy: EncodingPolicy,
  ): Promise<PreparedVariant> {
    const sourceLongestSide = Math.max(sourceInfo.width, sourceInfo.height);
    const sides = outputSideSchedule(sourceLongestSide, policy.maximumSide, policy.minimumSide);
    let fallback: PreparedVariant | null = null;

    for (const side of sides) {
      const dimensions = outputDimensions(sourceInfo.width, sourceInfo.height, side);
      for (const quality of policy.qualities) {
        let filePath: string;
        let imageInfo: PlatformImageInfo;
        let fileInfo: Awaited<ReturnType<MiniProgramPlatform["getFileInfo"]>>;
        try {
          filePath = await this.#platform.compressImage({
            compressedHeight: dimensions.height,
            compressedWidth: dimensions.width,
            quality,
            sourcePath,
          });
          [imageInfo, fileInfo] = await Promise.all([
            this.#platform.getImageInfo(filePath),
            this.#platform.getFileInfo(filePath),
          ]);
        } catch {
          fail("image_invalid");
        }
        const aspectDifference = Math.abs(
          sourceInfo.width / sourceInfo.height - imageInfo.width / imageInfo.height,
        );
        if (
          imageInfo.type !== "jpeg" ||
          imageInfo.orientation !== "up" ||
          !checkedPixelCount(imageInfo.width, imageInfo.height) ||
          Math.max(imageInfo.width, imageInfo.height) > policy.maximumSide ||
          imageInfo.width > dimensions.width ||
          imageInfo.height > dimensions.height ||
          aspectDifference > 0.02 ||
          !Number.isSafeInteger(fileInfo.size) ||
          fileInfo.size < 1 ||
          typeof fileInfo.sha256 !== "string" ||
          !sha256Pattern.test(fileInfo.sha256.toLowerCase())
        ) {
          fail("image_invalid");
        }
        if (fileInfo.size > policy.hardMaximumBytes) continue;

        let bytes: ArrayBuffer;
        try {
          bytes = await this.#platform.readFile(filePath);
        } catch {
          fail("image_invalid");
        }
        if (bytes.byteLength !== fileInfo.size || !isJpegBytes(bytes)) {
          fail("image_invalid");
        }
        const candidate: PreparedVariant = {
          bytes,
          filePath,
          imageInfo,
          metadata: {
            bytes: fileInfo.size,
            height: imageInfo.height,
            mimeType: "image/jpeg",
            sha256: fileInfo.sha256.toLowerCase(),
            width: imageInfo.width,
          },
        };
        if (fallback === null || candidate.metadata.bytes < fallback.metadata.bytes) {
          fallback = candidate;
        }
        if (fileInfo.size <= policy.targetBytes) return candidate;
      }
    }
    if (fallback !== null) return fallback;
    fail("image_output_budget_exceeded");
  }

  #parseIntent(value: unknown, shopId: string, productId: string) {
    if (!isRecord(value) || value.ok !== true || typeof value.status !== "string") {
      fail("backend_contract_invalid");
    }
    const versionId = assertUuidFromBackend(value.versionId);
    if (value.status === "noop") {
      if (!hasExactKeys(value, ["cacheScope", "ok", "status", "versionId"])) {
        fail("backend_contract_invalid");
      }
      assertCacheScope(value.cacheScope);
      return { status: "noop" as const, versionId };
    }
    if (
      value.status !== "upload_required" ||
      !hasExactKeys(value, [
        "cacheScope",
        "expiresAt",
        "mainUploadUrl",
        "ok",
        "status",
        "thumbUploadUrl",
        "versionId",
      ]) ||
      !isTimestamp(value.expiresAt) ||
      Date.parse(value.expiresAt) <= this.#nowMilliseconds() + signedUrlSafetyWindowMilliseconds
    ) {
      fail("backend_contract_invalid");
    }
    assertCacheScope(value.cacheScope);
    return {
      mainUploadUrl: validatedSignedUrl(
        value.mainUploadUrl,
        this.#trustedOrigins,
        expectedStoragePath({
          operation: "upload/sign",
          productId,
          shopId,
          variant: "main",
          versionId,
        }),
      ),
      status: "upload_required" as const,
      thumbUploadUrl: validatedSignedUrl(
        value.thumbUploadUrl,
        this.#trustedOrigins,
        expectedStoragePath({
          operation: "upload/sign",
          productId,
          shopId,
          variant: "thumb",
          versionId,
        }),
      ),
      versionId,
    };
  }

  async #upload(url: string, bytes: ArrayBuffer, session: SessionSnapshot): Promise<void> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      this.#assertSession(session);
      let response: PlatformResponse<unknown>;
      try {
        response = await this.#platform.request<unknown>({
          data: bytes,
          headers: {
            "Cache-Control": "max-age=3600",
            "Content-Type": "image/jpeg",
            "x-upsert": "false",
          },
          method: "PUT",
          redirect: "manual",
          timeoutMilliseconds: uploadTimeoutMilliseconds,
          url,
        });
      } catch {
        if (attempt === 0) continue;
        fail("image_upload_failed");
      }
      this.#assertSession(session);
      if (response.statusCode >= 200 && response.statusCode < 300) return;
      if (response.statusCode >= 500 && response.statusCode < 600 && attempt === 0) continue;
      fail("image_upload_failed");
    }
    fail("image_upload_failed");
  }

  async #finalize(
    shopId: string,
    productId: string,
    versionId: string,
    session: SessionSnapshot,
  ): Promise<ProductImageMutationResult> {
    this.#assertSession(session);
    const value = await this.#http.post<unknown>(
      "/api/mini-program/v1/product-images/finalize",
      { productId, shopId, versionId },
      session,
      { errorDomain: "catalog_mutation" },
    );
    this.#assertSession(session);
    if (
      !isRecord(value) ||
      !hasExactKeys(value, ["imageUpdatedAt", "ok", "status", "versionId"]) ||
      value.ok !== true ||
      (value.status !== "finalized" && value.status !== "already_finalized") ||
      value.versionId !== versionId ||
      !isTimestamp(value.imageUpdatedAt)
    ) {
      fail("backend_contract_invalid");
    }
    return {
      imageUpdatedAt: value.imageUpdatedAt,
      status: value.status,
      versionId,
    };
  }

  #parseRemove(
    value: unknown,
    shopId: string,
    productId: string,
    versionId: string,
  ): ProductImageRemoveResult {
    if (
      !isRecord(value) ||
      value.ok !== true ||
      value.operation !== "remove" ||
      value.productId !== productId ||
      value.shopId !== shopId ||
      value.versionId !== versionId ||
      value.currentImageVersionId !== null
    ) {
      fail("backend_contract_invalid");
    }
    if (value.status === "already_removed") {
      if (
        !hasExactKeys(value, [
          "currentImageVersionId",
          "ok",
          "operation",
          "productId",
          "shopId",
          "status",
          "versionId",
        ])
      ) {
        fail("backend_contract_invalid");
      }
      return {
        currentImageVersionId: null,
        productId,
        shopId,
        status: "already_removed",
        versionId,
      };
    }
    if (
      value.status !== "removed" ||
      !hasExactKeys(value, [
        "cleanupStatus",
        "currentImageVersionId",
        "imageUpdatedAt",
        "ok",
        "operation",
        "productId",
        "shopId",
        "status",
        "versionId",
      ]) ||
      (value.cleanupStatus !== "complete" && value.cleanupStatus !== "pending") ||
      !isTimestamp(value.imageUpdatedAt)
    ) {
      fail("backend_contract_invalid");
    }
    return {
      cleanupStatus: value.cleanupStatus,
      currentImageVersionId: null,
      imageUpdatedAt: value.imageUpdatedAt,
      productId,
      shopId,
      status: "removed",
      versionId,
    };
  }

  #parseRead(
    value: unknown,
    shopId: string,
    refs: readonly ProductImageReadReference[],
  ): ProductImageReadResult {
    if (
      !isRecord(value) ||
      !hasExactKeys(value, ["cacheScope", "items", "ok"]) ||
      value.ok !== true ||
      !Array.isArray(value.items) ||
      value.items.length !== refs.length
    ) {
      fail("backend_contract_invalid");
    }
    const cacheScope = assertCacheScope(value.cacheScope);
    const items = value.items.map((item, index): ProductImageReadItem => {
      const ref = refs[index];
      if (
        ref === undefined ||
        !isRecord(item) ||
        item.productId !== ref.productId ||
        item.variant !== ref.variant ||
        item.versionId !== ref.versionId
      ) {
        fail("backend_contract_invalid");
      }
      if (item.status === "not_found") {
        if (!hasExactKeys(item, ["productId", "status", "variant", "versionId"])) {
          fail("backend_contract_invalid");
        }
        return { ...ref, status: "not_found" };
      }
      if (
        item.status !== "ready" ||
        !hasExactKeys(item, [
          "expiresAt",
          "metadata",
          "productId",
          "signedUrl",
          "status",
          "variant",
          "versionId",
        ]) ||
        !isTimestamp(item.expiresAt) ||
        Date.parse(item.expiresAt) <= this.#nowMilliseconds() + signedUrlSafetyWindowMilliseconds
      ) {
        fail("backend_contract_invalid");
      }
      const metadata = parseMetadata(item.metadata, ref.variant);
      const signedUrl = validatedSignedUrl(
        item.signedUrl,
        this.#trustedOrigins,
        expectedStoragePath({ operation: "sign", shopId, ...ref }),
      );
      return { ...ref, expiresAt: item.expiresAt, metadata, signedUrl, status: "ready" };
    });
    return { cacheScope, items };
  }
}

function assertUuidFromBackend(value: unknown): string {
  if (typeof value !== "string" || !uuidPattern.test(value)) {
    fail("backend_contract_invalid");
  }
  return value;
}

function assertCacheScope(value: unknown): string {
  if (typeof value !== "string" || !cacheScopePattern.test(value)) {
    fail("backend_contract_invalid");
  }
  return value;
}

export function isProductImageMutationError(
  error: unknown,
  code: ProductImageMutationErrorCode,
): boolean {
  return error instanceof ProductImageMutationError && error.code === code;
}

export function isCatalogImageRequestError(error: unknown): boolean {
  return error instanceof CatalogMutationContractError;
}
