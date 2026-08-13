import test from "node:test";
import {
  isProductImageRuntimeConfigReady,
  isRuntimeConfigReady,
  type RuntimeConfig,
} from "../miniprogram/config/runtime-config";
import { CatalogMutationContractError } from "../miniprogram/lib/contracts";
import { HttpClient } from "../miniprogram/lib/http-client";
import { createWeChatPlatform, type PlatformResponse } from "../miniprogram/lib/platform";
import {
  isProductImageMutationError,
  ProductImageMutationClient,
} from "../miniprogram/lib/product-image-mutation-client";
import { SessionStore } from "../miniprogram/lib/session-store";
import { assert, assertEqual, expectReject, FakePlatform } from "./fakes";

const ADMIN_ORIGIN = "https://admin.example.test";
const STORAGE_ORIGIN = "https://project.supabase.co";
const SHOP_ID = "10000000-0000-4000-8000-000000000003";
const PRODUCT_ID = "20000000-0000-4000-8000-000000000003";
const VERSION_ID = "30000000-0000-4000-8000-000000000003";
const NEW_VERSION_ID = "40000000-0000-4000-8000-000000000003";
const CACHE_SCOPE = "c".repeat(64);
const ACCESS_TOKEN = "a".repeat(43);
const SECOND_ACCESS_TOKEN = "b".repeat(43);
const DEVICE_ID = "00000000-0000-4000-8000-000000000901";
const MAIN_PATH = "/tmp/main.jpg";
const THUMB_PATH = "/tmp/thumb.jpg";
const NOW = Date.parse("2026-08-13T12:00:00Z");
const EXPIRES_AT = "2026-08-13T12:05:00Z";

function jpegBytes(length = 8): ArrayBuffer {
  const bytes = new Uint8Array(length);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[length - 2] = 0xff;
  bytes[length - 1] = 0xd9;
  return bytes.buffer;
}

function imageInfo(width: number, height: number) {
  return { height, orientation: "up" as const, type: "jpeg" as const, width };
}

function uploadUrl(variant: "main" | "thumb", versionId = VERSION_ID, origin = STORAGE_ORIGIN) {
  return `${origin}/storage/v1/object/upload/sign/product-images/shops/${SHOP_ID}/products/${PRODUCT_ID}/primary/${versionId}/${variant}.jpg?token=${"t".repeat(32)}`;
}

function readUrl(variant: "main" | "thumb", versionId = VERSION_ID, origin = STORAGE_ORIGIN) {
  return `${origin}/storage/v1/object/sign/product-images/shops/${SHOP_ID}/products/${PRODUCT_ID}/primary/${versionId}/${variant}.jpg?token=${"r".repeat(32)}`;
}

function activeClient(platform: FakePlatform) {
  const sessions = new SessionStore(platform, () => 1_000);
  saveSession(sessions, ACCESS_TOKEN);
  return {
    client: new ProductImageMutationClient(
      new HttpClient(ADMIN_ORIGIN, platform),
      sessions,
      platform,
      { adminBaseUrl: ADMIN_ORIGIN, supabaseStorageBaseUrl: STORAGE_ORIGIN },
      () => NOW,
    ),
    sessions,
  };
}

function saveSession(
  sessions: SessionStore,
  sessionToken: string,
  accountFingerprint = "f".repeat(64),
): void {
  sessions.save(
    {
      accountFingerprint,
      expiresAt: 4_600,
      expiresIn: 3_600,
      sessionToken,
      tokenType: "bearer",
      user: { provider: "custom:wechat" },
    },
    DEVICE_ID,
  );
}

function prepareJpeg(platform: FakePlatform): void {
  platform.selectedImage = {
    fileType: "image",
    height: 1200,
    size: 500_000,
    tempFilePath: "/tmp/source.jpg",
    width: 1600,
  };
  platform.imageInfos.set("/tmp/source.jpg", imageInfo(1600, 1200));
  platform.compressedImagePaths.push(MAIN_PATH, THUMB_PATH);
  platform.imageInfos.set(MAIN_PATH, imageInfo(1600, 1200));
  platform.imageInfos.set(THUMB_PATH, imageInfo(384, 288));
  platform.fileInfos.set(MAIN_PATH, { sha256: "a".repeat(64), size: 8 });
  platform.fileInfos.set(THUMB_PATH, { sha256: "b".repeat(64), size: 8 });
  platform.fileBytes.set(MAIN_PATH, jpegBytes());
  platform.fileBytes.set(THUMB_PATH, jpegBytes());
}

function prepareSecondSessionJpeg(platform: FakePlatform): void {
  const sourcePath = "/tmp/second-source.jpg";
  const mainPath = "/tmp/second-main.jpg";
  const thumbPath = "/tmp/second-thumb.jpg";
  platform.selectedImage = {
    fileType: "image",
    height: 900,
    size: 400_000,
    tempFilePath: sourcePath,
    width: 1200,
  };
  platform.imageInfos.set(sourcePath, imageInfo(1200, 900));
  platform.compressedImagePaths.push(mainPath, thumbPath);
  platform.imageInfos.set(mainPath, imageInfo(1200, 900));
  platform.imageInfos.set(thumbPath, imageInfo(384, 288));
  platform.fileInfos.set(mainPath, { sha256: "c".repeat(64), size: 10 });
  platform.fileInfos.set(thumbPath, { sha256: "d".repeat(64), size: 12 });
  platform.fileBytes.set(mainPath, jpegBytes(10));
  platform.fileBytes.set(thumbPath, jpegBytes(12));
}

function intentUploadResponse(mainUrl = uploadUrl("main"), thumbUrl = uploadUrl("thumb")) {
  return {
    data: {
      cacheScope: CACHE_SCOPE,
      expiresAt: EXPIRES_AT,
      mainUploadUrl: mainUrl,
      ok: true,
      status: "upload_required",
      thumbUploadUrl: thumbUrl,
      versionId: VERSION_ID,
    },
    statusCode: 201,
  };
}

function finalizeResponse(versionId = VERSION_ID) {
  return {
    data: {
      imageUpdatedAt: "2026-08-13T12:01:00Z",
      ok: true,
      status: "finalized",
      versionId,
    },
    statusCode: 200,
  };
}

test("image selection prepares bounded JPEG variants and uploads without bearer", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push(
    intentUploadResponse(),
    { data: "", statusCode: 200 },
    { data: "", statusCode: 201 },
    finalizeResponse(),
  );
  const { client } = activeClient(platform);

  const result = await client.selectAndReplace(SHOP_ID, PRODUCT_ID);

  assertEqual(result.status, "finalized", "final status");
  assertEqual(result.versionId, VERSION_ID, "version is bound");
  assertEqual(platform.compressionRequests.length, 2, "main and thumb compression");
  assertEqual(platform.compressionRequests[0]?.compressedWidth, 1600, "main width cap");
  assertEqual(platform.compressionRequests[0]?.quality, 82, "main first quality");
  assertEqual(platform.compressionRequests[1]?.sourcePath, MAIN_PATH, "thumb derives from main");
  assertEqual(platform.compressionRequests[1]?.compressedWidth, 384, "thumb width cap");
  assertEqual(platform.compressionRequests[1]?.quality, 75, "thumb first quality");

  const intent = platform.requests[0];
  assertEqual(
    intent?.url,
    `${ADMIN_ORIGIN}/api/mini-program/v1/product-images/intent`,
    "Mini intent path",
  );
  assertEqual(intent?.headers?.Authorization, `Bearer ${ACCESS_TOKEN}`, "gateway bearer");
  assert(
    /^[0-9a-f-]{36}$/.test(intent?.headers?.["Idempotency-Key"] ?? ""),
    "intent carries an idempotency key",
  );
  assert(
    /^[0-9a-f-]{36}$/.test(intent?.headers?.["X-Correlation-ID"] ?? ""),
    "intent carries a correlation ID",
  );
  assert(
    intent?.headers?.["Idempotency-Key"] !== intent?.headers?.["X-Correlation-ID"],
    "intent identifiers differ",
  );
  assertEqual(
    (intent?.data as { main?: { sha256?: string } } | undefined)?.main?.sha256,
    "a".repeat(64),
    "main digest metadata",
  );
  const uploads = platform.requests.slice(1, 3);
  for (const upload of uploads) {
    assertEqual(upload?.method, "PUT", "signed upload method");
    assertEqual(upload?.redirect, "manual", "signed upload cannot follow redirects");
    assertEqual(upload?.headers?.Authorization, undefined, "no bearer at Storage");
    assertEqual(upload?.headers?.["Content-Type"], "image/jpeg", "wire MIME");
    assertEqual(upload?.headers?.["x-upsert"], "false", "no overwrite");
    assertEqual(upload?.headers?.["Cache-Control"], "max-age=3600", "Storage cache header");
    assert(upload?.data instanceof ArrayBuffer, "raw immutable bytes sent to Storage");
  }
  assertEqual(
    platform.requests[3]?.url,
    `${ADMIN_ORIGIN}/api/mini-program/v1/product-images/finalize`,
    "Mini finalize path",
  );
});

test("noop replay does not upload or finalize", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push({
    data: { cacheScope: CACHE_SCOPE, ok: true, status: "noop", versionId: VERSION_ID },
    statusCode: 200,
  });
  const { client } = activeClient(platform);

  const result = await client.selectAndReplace(SHOP_ID, PRODUCT_ID);

  assertEqual(result.status, "noop", "noop preserved");
  assertEqual(platform.requests.length, 1, "only intent is sent");
});

test("same-product double submit coalesces one non-durable in-memory flow", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push(
    intentUploadResponse(),
    { data: "", statusCode: 200 },
    { data: "", statusCode: 200 },
    finalizeResponse(),
  );
  const { client } = activeClient(platform);

  const first = client.selectAndReplace(SHOP_ID, PRODUCT_ID);
  const second = client.selectAndReplace(SHOP_ID, PRODUCT_ID);

  assertEqual(first, second, "concurrent UI submissions share one promise");
  await Promise.all([first, second]);
  assertEqual(platform.chooseImageCalls, 1, "picker opens once");
  assertEqual(platform.requests.length, 4, "single intent/upload/finalize flow");
});

test("ambiguous intent retry reuses the same durable identifiers and prepared bytes", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push(
    new Error("ambiguous timeout"),
    intentUploadResponse(),
    { data: "", statusCode: 200 },
    { data: "", statusCode: 200 },
    finalizeResponse(),
  );
  const { client } = activeClient(platform);

  await expectReject(
    () => client.selectAndReplace(SHOP_ID, PRODUCT_ID),
    (error) => error instanceof CatalogMutationContractError && error.code === "offline",
  );
  const firstIntent = platform.requests[0];
  const result = await client.selectAndReplace(SHOP_ID, PRODUCT_ID);
  const secondIntent = platform.requests[1];

  assertEqual(result.status, "finalized", "retry completes");
  assertEqual(platform.chooseImageCalls, 1, "retry does not reopen the picker");
  assertEqual(
    firstIntent?.headers?.["Idempotency-Key"],
    secondIntent?.headers?.["Idempotency-Key"],
    "same idempotency key",
  );
  assertEqual(
    firstIntent?.headers?.["X-Correlation-ID"],
    secondIntent?.headers?.["X-Correlation-ID"],
    "same correlation ID",
  );
  assertEqual(
    JSON.stringify(firstIntent?.data),
    JSON.stringify(secondIntent?.data),
    "same canonical intent body",
  );
});

test("ambiguous image intent survives client restart using validated saved files only", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push(new Error("ambiguous timeout"));
  const sessions = new SessionStore(platform, () => 1_000);
  saveSession(sessions, ACCESS_TOKEN);
  const http = new HttpClient(ADMIN_ORIGIN, platform);
  const firstClient = new ProductImageMutationClient(
    http,
    sessions,
    platform,
    { adminBaseUrl: ADMIN_ORIGIN, supabaseStorageBaseUrl: STORAGE_ORIGIN },
    () => NOW,
  );

  await expectReject(
    () => firstClient.selectAndReplace(SHOP_ID, PRODUCT_ID),
    (error) => error instanceof CatalogMutationContractError && error.code === "offline",
  );
  const firstIntent = platform.requests[0];
  const storedAttempt = [...platform.storage.entries()].find(([key]) =>
    key.startsWith("mc.productImageAttempts.v1.f"),
  );
  assert(storedAttempt !== undefined, "durable attempt metadata exists after ambiguous result");
  const encoded = String(storedAttempt[1]);
  const storedShape = JSON.parse(encoded) as Record<string, unknown>;
  assertEqual("sessionToken" in storedShape, false, "journal excludes bearer field");
  assertEqual("accessToken" in storedShape, false, "journal excludes Supabase bearer field");
  assertEqual(encoded.includes("token="), false, "journal excludes signed capability");
  assertEqual(encoded.includes(STORAGE_ORIGIN), false, "journal excludes Storage origin and URL");

  const restartedClient = new ProductImageMutationClient(
    http,
    sessions,
    platform,
    { adminBaseUrl: ADMIN_ORIGIN, supabaseStorageBaseUrl: STORAGE_ORIGIN },
    () => NOW,
  );
  platform.queuedResponses.push(
    intentUploadResponse(),
    { data: "", statusCode: 200 },
    { data: "", statusCode: 200 },
    finalizeResponse(),
  );
  const result = await restartedClient.selectAndReplace(SHOP_ID, PRODUCT_ID);
  const secondIntent = platform.requests[1];

  assertEqual(result.status, "finalized", "restarted flow completes");
  assertEqual(platform.chooseImageCalls, 1, "restart does not reopen the picker");
  assertEqual(platform.savedFileCount, 2, "only one persisted main/thumb pair is created");
  assertEqual(
    firstIntent?.headers?.["Idempotency-Key"],
    secondIntent?.headers?.["Idempotency-Key"],
    "restart reuses exact idempotency identity",
  );
  assertEqual(
    JSON.stringify(firstIntent?.data),
    JSON.stringify(secondIntent?.data),
    "restart reuses exact intent body",
  );
  assertEqual(
    [...platform.storage.keys()].some((key) => key.startsWith("mc.productImageAttempts.v1.f")),
    false,
    "successful finalize removes durable attempt metadata",
  );
  assertEqual(platform.removedSavedFiles.length, 2, "successful finalize cleans sandbox files");
});

test("logout and replacement login discard retained image bytes, body, and identifiers", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  const preparedBytes: ArrayBuffer[] = [];
  const originalReadFile = platform.readFile.bind(platform);
  platform.readFile = async (filePath: string) => {
    const bytes = await originalReadFile(filePath);
    preparedBytes.push(bytes);
    return bytes;
  };
  platform.queuedResponses.push(new Error("ambiguous timeout"));
  const { client, sessions } = activeClient(platform);

  await expectReject(
    () => client.selectAndReplace(SHOP_ID, PRODUCT_ID),
    (error) => error instanceof CatalogMutationContractError && error.code === "offline",
  );
  const firstIntent = platform.requests[0];

  sessions.clear();
  saveSession(sessions, SECOND_ACCESS_TOKEN, "e".repeat(64));
  platform.randomBytes = async (length: number) =>
    Uint8Array.from({ length }, (_, index) => (index * 19 + 11) % 256);
  prepareSecondSessionJpeg(platform);
  platform.queuedResponses.push(
    intentUploadResponse(),
    { data: "", statusCode: 200 },
    { data: "", statusCode: 200 },
    finalizeResponse(),
  );

  await client.selectAndReplace(SHOP_ID, PRODUCT_ID);
  const secondIntent = platform.requests[1];
  const secondMainUpload = platform.requests[2];

  assertEqual(platform.chooseImageCalls, 2, "replacement login opens a new picker flow");
  assertEqual(
    secondIntent?.headers?.Authorization,
    `Bearer ${SECOND_ACCESS_TOKEN}`,
    "replacement login uses only its bearer",
  );
  assert(
    firstIntent?.headers?.["Idempotency-Key"] !== secondIntent?.headers?.["Idempotency-Key"],
    "replacement login creates a new idempotency key",
  );
  assert(
    firstIntent?.headers?.["X-Correlation-ID"] !== secondIntent?.headers?.["X-Correlation-ID"],
    "replacement login creates a new correlation ID",
  );
  assertEqual(
    (firstIntent?.data as { main?: { sha256?: string } } | undefined)?.main?.sha256,
    "a".repeat(64),
    "first session body uses the first selection",
  );
  assertEqual(
    (secondIntent?.data as { main?: { sha256?: string } } | undefined)?.main?.sha256,
    "c".repeat(64),
    "replacement session body uses the new selection",
  );
  assertEqual(
    (secondMainUpload?.data as ArrayBuffer | undefined)?.byteLength,
    10,
    "new session uploads newly prepared bytes",
  );
  assert(
    secondMainUpload?.data !== preparedBytes[0],
    "new session cannot upload the retained first-session buffer",
  );
});

test("replacement login never coalesces with an unresolved prior-session image flow", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  const { client, sessions } = activeClient(platform);
  const heldIntentControl: {
    resolve?: (response: ReturnType<typeof intentUploadResponse>) => void;
  } = {};
  const heldIntent = new Promise<ReturnType<typeof intentUploadResponse>>((resolve) => {
    heldIntentControl.resolve = resolve;
  });
  let shouldHoldIntent = true;
  const originalRequest = platform.request.bind(platform);
  platform.request = async <T>(request: Parameters<FakePlatform["request"]>[0]) => {
    if (shouldHoldIntent && request.url.endsWith("/product-images/intent")) {
      shouldHoldIntent = false;
      platform.requests.push(request);
      return (await heldIntent) as PlatformResponse<T>;
    }
    return originalRequest<T>(request);
  };

  const priorSessionRequest = client.selectAndReplace(SHOP_ID, PRODUCT_ID);
  for (let turn = 0; turn < 64 && platform.requests.length === 0; turn += 1) {
    await Promise.resolve();
  }
  assertEqual(platform.requests.length, 1, "prior session reaches its held intent request");

  sessions.clear();
  saveSession(sessions, SECOND_ACCESS_TOKEN, "e".repeat(64));
  platform.randomBytes = async (length: number) =>
    Uint8Array.from({ length }, (_, index) => (index * 23 + 13) % 256);
  prepareSecondSessionJpeg(platform);
  platform.queuedResponses.push(
    intentUploadResponse(),
    { data: "", statusCode: 200 },
    { data: "", statusCode: 200 },
    finalizeResponse(),
  );

  const replacementSessionRequest = client.selectAndReplace(SHOP_ID, PRODUCT_ID);
  assert(
    replacementSessionRequest !== priorSessionRequest,
    "replacement session receives a distinct in-flight flow",
  );
  await replacementSessionRequest;
  const resolveHeldIntent = heldIntentControl.resolve;
  assert(resolveHeldIntent !== undefined, "held intent resolver exists");
  resolveHeldIntent(intentUploadResponse());
  await expectReject(
    () => priorSessionRequest,
    (error) => isProductImageMutationError(error, "session_expired"),
  );

  assertEqual(platform.chooseImageCalls, 2, "each session owns its own picker and prepared image");
  assertEqual(platform.requests.length, 5, "prior flow cannot continue to Storage or finalize");
});

test("upload retries once only for an ambiguous transient failure", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push(
    intentUploadResponse(),
    new Error("offline"),
    { data: "", statusCode: 200 },
    { data: "", statusCode: 200 },
    finalizeResponse(),
  );
  const { client } = activeClient(platform);

  await client.selectAndReplace(SHOP_ID, PRODUCT_ID);

  const mainRequests = platform.requests.filter((request) => request.url === uploadUrl("main"));
  assertEqual(mainRequests.length, 2, "one bounded retry");
  assertEqual(mainRequests[0]?.data, mainRequests[1]?.data, "retry uses the same buffer");
});

test("Storage 5xx retries once with the same bytes and then continues", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push(
    intentUploadResponse(),
    { data: "temporary", statusCode: 503 },
    { data: "", statusCode: 200 },
    { data: "", statusCode: 200 },
    finalizeResponse(),
  );
  const { client } = activeClient(platform);

  await client.selectAndReplace(SHOP_ID, PRODUCT_ID);

  const mainRequests = platform.requests.filter((request) => request.url === uploadUrl("main"));
  assertEqual(mainRequests.length, 2, "one bounded 5xx retry");
  assertEqual(mainRequests[0]?.data, mainRequests[1]?.data, "5xx retry reuses immutable bytes");
});

test("terminal thumbnail failure never finalizes", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push(
    intentUploadResponse(),
    { data: "", statusCode: 200 },
    { data: "temporary", statusCode: 500 },
    { data: "temporary", statusCode: 503 },
  );
  const { client } = activeClient(platform);

  await expectReject(
    () => client.selectAndReplace(SHOP_ID, PRODUCT_ID),
    (error) => isProductImageMutationError(error, "image_upload_failed"),
  );
  assertEqual(platform.requests.length, 4, "intent, main, and exactly two thumbnail attempts");
  assertEqual(
    platform.requests.some((request) => request.url.endsWith("/product-images/finalize")),
    false,
    "failed thumbnail cannot finalize",
  );
});

test("permanent Storage response does not retry or finalize", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.queuedResponses.push(intentUploadResponse(), { data: "denied", statusCode: 403 });
  const { client } = activeClient(platform);

  await expectReject(
    () => client.selectAndReplace(SHOP_ID, PRODUCT_ID),
    (error) => isProductImageMutationError(error, "image_upload_failed"),
  );
  assertEqual(platform.requests.length, 2, "403 is terminal");
});

test("foreign, path-confused, and redirect upload capabilities fail before PUT", async () => {
  for (const mainUrl of [
    uploadUrl("main", VERSION_ID, "https://evil.example.test"),
    uploadUrl("main", VERSION_ID, ADMIN_ORIGIN),
    uploadUrl("main", NEW_VERSION_ID),
    uploadUrl("thumb"),
    `https://user@project.supabase.co${uploadUrl("main").slice(STORAGE_ORIGIN.length)}`,
  ]) {
    const platform = new FakePlatform();
    prepareJpeg(platform);
    platform.queuedResponses.push(intentUploadResponse(mainUrl));
    const { client } = activeClient(platform);
    await expectReject(
      () => client.selectAndReplace(SHOP_ID, PRODUCT_ID),
      (error) => isProductImageMutationError(error, "signed_url_invalid"),
    );
    assertEqual(platform.requests.length, 1, "invalid capability is never requested");
  }
});

test("non-JPEG input fails closed because compressImage cannot guarantee conversion", async () => {
  const platform = new FakePlatform();
  platform.selectedImage = {
    fileType: "image",
    height: 1200,
    size: 500_000,
    tempFilePath: "/tmp/source",
    width: 1600,
  };
  platform.imageInfos.set("/tmp/source", {
    ...imageInfo(1600, 1200),
    type: "png",
  });
  const { client } = activeClient(platform);
  await expectReject(
    () => client.selectAndReplace(SHOP_ID, PRODUCT_ID),
    (error) => isProductImageMutationError(error, "image_invalid"),
  );
  assertEqual(platform.requests.length, 0, "invalid source sends no intent");
});

test("oversized input fails with typed image_too_large before decode or network", async () => {
  const platform = new FakePlatform();
  platform.selectedImage = {
    fileType: "image",
    height: 1200,
    size: 25 * 1024 * 1024 + 1,
    tempFilePath: "/tmp/large.jpg",
    width: 1600,
  };
  const { client } = activeClient(platform);

  await expectReject(
    () => client.selectAndReplace(SHOP_ID, PRODUCT_ID),
    (error) => isProductImageMutationError(error, "image_too_large"),
  );
  assertEqual(platform.requests.length, 0, "oversized input sends no request");
});

test("rotated JPEG uses logical dimensions and requires normalized JPEG outputs", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  platform.selectedImage = {
    fileType: "image",
    height: 1600,
    size: 500_000,
    tempFilePath: "/tmp/source.jpg",
    width: 1200,
  };
  platform.imageInfos.set("/tmp/source.jpg", {
    ...imageInfo(1200, 1600),
    orientation: "right",
  });
  platform.queuedResponses.push({
    data: { cacheScope: CACHE_SCOPE, ok: true, status: "noop", versionId: VERSION_ID },
    statusCode: 200,
  });
  const { client } = activeClient(platform);

  await client.selectAndReplace(SHOP_ID, PRODUCT_ID);

  assertEqual(platform.compressionRequests[0]?.compressedWidth, 1600, "logical width");
  assertEqual(platform.compressionRequests[0]?.compressedHeight, 1200, "logical height");
});

test("remove is version-bound and preserves idempotent already-removed status", async () => {
  const platform = new FakePlatform();
  platform.queuedResponses.push({
    data: {
      currentImageVersionId: null,
      ok: true,
      operation: "remove",
      productId: PRODUCT_ID,
      shopId: SHOP_ID,
      status: "already_removed",
      versionId: VERSION_ID,
    },
    statusCode: 200,
  });
  const { client } = activeClient(platform);

  const result = await client.remove(SHOP_ID, PRODUCT_ID, VERSION_ID);

  assertEqual(result.status, "already_removed", "remove replay preserved");
  assertEqual(
    platform.requests[0]?.url,
    `${ADMIN_ORIGIN}/api/mini-program/v1/product-images/remove`,
    "Mini remove path",
  );
  assertEqual(
    (platform.requests[0]?.data as { expectedVersionId?: string } | undefined)?.expectedVersionId,
    VERSION_ID,
    "expected version sent",
  );
});

test("read URLs use the Mini boundary and bind identity, metadata, expiry, and origin", async () => {
  const platform = new FakePlatform();
  platform.queuedResponses.push({
    data: {
      cacheScope: CACHE_SCOPE,
      items: [
        {
          expiresAt: EXPIRES_AT,
          metadata: {
            bytes: 8,
            height: 288,
            mimeType: "image/jpeg",
            sha256: "b".repeat(64),
            width: 384,
          },
          productId: PRODUCT_ID,
          signedUrl: readUrl("thumb"),
          status: "ready",
          variant: "thumb",
          versionId: VERSION_ID,
        },
      ],
      ok: true,
    },
    statusCode: 200,
  });
  const { client } = activeClient(platform);

  const result = await client.readUrls(SHOP_ID, [
    { productId: PRODUCT_ID, variant: "thumb", versionId: VERSION_ID },
  ]);

  assertEqual(result.items[0]?.status, "ready", "ready item parsed");
  assertEqual(
    platform.requests[0]?.url,
    `${ADMIN_ORIGIN}/api/mini-program/v1/product-images/read-urls`,
    "Mini membership-only read path",
  );
});

test("read URLs reject invalid batch bounds before transport", async () => {
  const platform = new FakePlatform();
  const { client } = activeClient(platform);

  await expectReject(
    () => client.readUrls(SHOP_ID, []),
    (error) => isProductImageMutationError(error, "validation_failed"),
  );
  const tooMany = Array.from({ length: 17 }, () => ({
    productId: PRODUCT_ID,
    variant: "main" as const,
    versionId: VERSION_ID,
  }));
  await expectReject(
    () => client.readUrls(SHOP_ID, tooMany),
    (error) => isProductImageMutationError(error, "validation_failed"),
  );
  assertEqual(platform.requests.length, 0, "invalid batch never reaches the gateway");
});

test("read URL capabilities reject foreign origins before publication", async () => {
  const platform = new FakePlatform();
  platform.queuedResponses.push({
    data: {
      cacheScope: CACHE_SCOPE,
      items: [
        {
          expiresAt: EXPIRES_AT,
          metadata: {
            bytes: 8,
            height: 1200,
            mimeType: "image/jpeg",
            sha256: "a".repeat(64),
            width: 1600,
          },
          productId: PRODUCT_ID,
          signedUrl: readUrl("main", VERSION_ID, "https://evil.example.test"),
          status: "ready",
          variant: "main",
          versionId: VERSION_ID,
        },
      ],
      ok: true,
    },
    statusCode: 200,
  });
  const { client } = activeClient(platform);

  await expectReject(
    () =>
      client.readUrls(SHOP_ID, [{ productId: PRODUCT_ID, variant: "main", versionId: VERSION_ID }]),
    (error) => isProductImageMutationError(error, "signed_url_invalid"),
  );
});

test("session replacement after intent fences every Storage upload", async () => {
  const platform = new FakePlatform();
  prepareJpeg(platform);
  const { client, sessions } = activeClient(platform);
  platform.queuedResponses.push(intentUploadResponse());
  const originalRequest = platform.request.bind(platform);
  platform.request = async <T>(request: Parameters<FakePlatform["request"]>[0]) => {
    const response = await originalRequest<T>(request);
    if (request.url.endsWith("/product-images/intent")) sessions.clear();
    return response;
  };

  await expectReject(
    () => client.selectAndReplace(SHOP_ID, PRODUCT_ID),
    (error) => isProductImageMutationError(error, "session_expired"),
  );
  assertEqual(platform.requests.length, 1, "logout stops before Storage");
});

test("malformed finalize response cannot publish a mismatched version", async () => {
  const platform = new FakePlatform();
  platform.queuedResponses.push(finalizeResponse(NEW_VERSION_ID));
  const { client } = activeClient(platform);

  await expectReject(
    () => client.finalize(SHOP_ID, PRODUCT_ID, VERSION_ID),
    (error) => isProductImageMutationError(error, "backend_contract_invalid"),
  );
});

test("normalized server image and stale-version errors remain typed", async () => {
  for (const code of ["image_invalid", "image_too_large", "stale_version"] as const) {
    const platform = new FakePlatform();
    platform.queuedResponses.push({ data: { code, ok: false }, statusCode: 409 });
    const { client } = activeClient(platform);

    await expectReject(
      () => client.remove(SHOP_ID, PRODUCT_ID, VERSION_ID),
      (error) => error instanceof CatalogMutationContractError && error.code === code,
    );
  }
});

test("runtime activation requires an explicit public HTTPS Storage origin", () => {
  const configured: RuntimeConfig = {
    autoRefreshMaximumMilliseconds: 30_000,
    autoRefreshMilliseconds: 3_000,
    gatewayBaseUrl: ADMIN_ORIGIN,
    privacyUrl: "https://example.test/privacy",
    supabaseStorageBaseUrl: STORAGE_ORIGIN,
    weChatAuthEnabled: true,
  };
  assertEqual(isRuntimeConfigReady(configured), true, "base runtime remains ready");
  assertEqual(
    isProductImageRuntimeConfigReady(configured),
    true,
    "explicit trusted Storage origin",
  );
  assertEqual(
    isRuntimeConfigReady({ ...configured, supabaseStorageBaseUrl: "" }),
    true,
    "missing image config does not disable existing Auth and reads",
  );
  assertEqual(
    isProductImageRuntimeConfigReady({ ...configured, supabaseStorageBaseUrl: "" }),
    false,
    "missing Storage origin disables only images",
  );
  assertEqual(
    isProductImageRuntimeConfigReady({
      ...configured,
      supabaseStorageBaseUrl: "http://project.supabase.co",
    }),
    false,
    "non-HTTPS Storage origin fails closed",
  );
});

test("WeChat adapter uses the exact bounded official image and raw PUT options", async () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previousWx = globals.wx;
  const calls: Record<string, unknown>[] = [];
  const bytes = jpegBytes();
  globals.wx = {
    chooseMedia(options: {
      count?: number;
      mediaType?: string[];
      sizeType?: string[];
      sourceType?: string[];
      success?: (value: unknown) => void;
    }) {
      calls.push({ api: "chooseMedia", ...options });
      options.success?.({
        tempFiles: [
          {
            duration: 0,
            fileType: "image",
            height: 1200,
            size: 8,
            tempFilePath: "/tmp/source.jpg",
            thumbTempFilePath: "",
            width: 1600,
          },
        ],
        type: "image",
      });
    },
    compressImage(options: {
      compressedHeight?: number;
      compressedWidth?: number;
      quality?: number;
      src: string;
      success?: (value: { tempFilePath: string }) => void;
    }) {
      calls.push({ api: "compressImage", ...options });
      options.success?.({ tempFilePath: "/tmp/main.jpg" });
    },
    getFileSystemManager() {
      return {
        getFileInfo(options: {
          digestAlgorithm?: string;
          filePath: string;
          success?: (value: { digest: string; size: number }) => void;
        }) {
          calls.push({ api: "getFileInfo", ...options });
          options.success?.({ digest: "a".repeat(64), size: 8 });
        },
        readFile(options: { filePath: string; success?: (value: { data: ArrayBuffer }) => void }) {
          calls.push({ api: "readFile", ...options });
          options.success?.({ data: bytes });
        },
      };
    },
    getImageInfo(options: {
      src: string;
      success?: (value: { height: number; orientation: "up"; type: "jpeg"; width: number }) => void;
    }) {
      calls.push({ api: "getImageInfo", ...options });
      options.success?.({ height: 1200, orientation: "up", type: "jpeg", width: 1600 });
    },
    request(options: {
      data?: unknown;
      header?: Record<string, string>;
      method?: string;
      redirect?: string;
      success?: (value: { data: unknown; statusCode: number }) => void;
    }) {
      calls.push({ api: "request", ...options });
      options.success?.({ data: "", statusCode: 200 });
    },
  };

  try {
    const platform = createWeChatPlatform();
    await platform.chooseImage();
    await platform.compressImage({
      compressedHeight: 1200,
      compressedWidth: 1600,
      quality: 82,
      sourcePath: "/tmp/source.jpg",
    });
    await platform.getImageInfo("/tmp/main.jpg");
    await platform.getFileInfo("/tmp/main.jpg");
    await platform.readFile("/tmp/main.jpg");
    await platform.request({
      data: bytes,
      headers: { "Content-Type": "image/jpeg", "x-upsert": "false" },
      method: "PUT",
      redirect: "manual",
      timeoutMilliseconds: 15_000,
      url: uploadUrl("main"),
    });
  } finally {
    if (previousWx === undefined) delete globals.wx;
    else globals.wx = previousWx;
  }

  const choose = calls.find((call) => call.api === "chooseMedia");
  assertEqual(choose?.count, 1, "one image");
  assertEqual(JSON.stringify(choose?.mediaType), '["image"]', "image-only picker");
  assertEqual(JSON.stringify(choose?.sizeType), '["original"]', "original source preflight");
  assertEqual(JSON.stringify(choose?.sourceType), '["album","camera"]', "album and camera sources");
  const compression = calls.find((call) => call.api === "compressImage");
  assertEqual(compression?.compressedWidth, 1600, "official resize width");
  assertEqual(compression?.quality, 82, "official percentage quality");
  const fileInfo = calls.find((call) => call.api === "getFileInfo");
  assertEqual(fileInfo?.digestAlgorithm, "sha256", "official SHA-256 digest");
  const upload = calls.find((call) => call.api === "request");
  assertEqual(upload?.data, bytes, "raw ArrayBuffer forwarded");
  assertEqual(upload?.method, "PUT", "official wx.request PUT");
  assertEqual(upload?.redirect, "manual", "redirects are rejected by the caller");
  assertEqual(
    (upload?.header as Record<string, string> | undefined)?.Authorization,
    undefined,
    "Storage request receives no bearer",
  );
});
