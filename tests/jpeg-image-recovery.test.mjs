import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { FakePlatform } = require("../dist-test/tests/fakes.js");
const {
  ProductImageMutationClient,
} = require("../dist-test/miniprogram/lib/product-image-mutation-client.js");
const { HttpClient } = require("../dist-test/miniprogram/lib/http-client.js");
const { SessionStore } = require("../dist-test/miniprogram/lib/session-store.js");
const shop = "10000000-0000-4000-8000-000000000003",
  product = "20000000-0000-4000-8000-000000000003",
  version = "30000000-0000-4000-8000-000000000003";
const prefix = "mc.productImageAttempts.v1.",
  index = `${prefix}scopes`,
  admin = "https://admin.example.test",
  storage = "https://project.supabase.co";
const plain = readFileSync(new URL("./fixtures/jpeg/baseline.jpg", import.meta.url));
const profile = readFileSync(new URL("./fixtures/jpeg/skia-srgb.icc", import.meta.url));
const native = Buffer.concat([
  plain.subarray(0, 2),
  Buffer.from([255, 226, 1, 216]),
  Buffer.from("ICC_PROFILE\0\x01\x01", "binary"),
  profile,
  plain.subarray(2),
]);
const ab = (b) => Uint8Array.from(b).buffer;
const hash = (b) => createHash("sha256").update(Buffer.from(b)).digest("hex");
const info = { width: 24, height: 18, orientation: "up", type: "jpeg" };
const noop = {
  statusCode: 200,
  data: { ok: true, status: "noop", cacheScope: "c".repeat(64), versionId: version },
};
const invalid = (e) => e.code === "image_invalid";
function setup() {
  const p = new FakePlatform();
  let n = 0;
  const put = (path, bytes) => {
    p.fileBytes.set(path, ab(bytes));
    p.fileInfos.set(path, { size: bytes.length, sha256: hash(bytes) });
    p.imageInfos.set(path, info);
  };
  put("/tmp/source.jpg", plain);
  put("/tmp/main.jpg", native);
  put("/tmp/thumb.jpg", native);
  p.compressedImagePaths.push("/tmp/main.jpg", "/tmp/thumb.jpg");
  p.selectedImage = {
    fileType: "image",
    height: 18,
    width: 24,
    size: plain.length,
    tempFilePath: "/tmp/source.jpg",
  };
  p.writeImageFile = async (bytes) => {
    const path = `/owned/${++n}.jpg`;
    put(path, Buffer.from(bytes));
    return path;
  };
  p.saveFile = async (path) => path;
  p.cleanCalls = [];
  p.cleanImageFiles = async (retained) => {
    p.cleanCalls.push(retained);
    for (const path of p.fileBytes.keys())
      if (path.startsWith("/owned/") && !retained.includes(path)) await p.removeSavedFile(path);
  };
  return { p, put };
}
function client(p) {
  const sessions = new SessionStore(p, () => 1000);
  sessions.save(
    {
      accountFingerprint: "f".repeat(64),
      expiresAt: 4600,
      expiresIn: 3600,
      sessionToken: "a".repeat(43),
      tokenType: "bearer",
      user: { provider: "custom:wechat" },
    },
    "00000000-0000-4000-8000-000000000901",
  );
  return {
    sessions,
    c: new ProductImageMutationClient(new HttpClient(admin, p), sessions, p, {
      adminBaseUrl: admin,
      supabaseStorageBaseUrl: storage,
    }),
  };
}
const journal = (p) =>
  [...p.storage.entries()].find(([key]) => key.startsWith(prefix) && key !== index);
const owned = (p) => [...p.fileBytes.keys()].filter((path) => path.startsWith("/owned/"));

test("both previews use canonical readback; thumb input and intent hashes match adopted files", async () => {
  const { p } = setup(),
    { c } = client(p);
  p.queuedResponses.push(noop);
  let paths;
  await c.selectAndReplace(shop, product, "camera", async (preview) => {
    paths = preview;
    assert.deepEqual(Buffer.from(p.fileBytes.get(preview.mainPath)), plain);
    assert.deepEqual(Buffer.from(p.fileBytes.get(preview.thumbPath)), plain);
    return true;
  });
  assert.equal(p.compressionRequests[1].sourcePath, paths.mainPath);
  const body = p.requests[0].data;
  assert.equal(body.main.bytes, plain.length);
  assert.equal(body.thumb.bytes, plain.length);
  assert.equal(body.main.sha256, hash(plain));
  assert.equal(body.thumb.sha256, hash(plain));
  assert.equal(owned(p).length, 0);
  assert.equal(journal(p), undefined);
  assert.ok(p.fileBytes.has("/tmp/source.jpg"));
});
test("cancel and logout during preview remove only owned copies with zero requests", async () => {
  for (const mode of ["cancel", "logout"]) {
    const { p } = setup(),
      { c, sessions } = client(p);
    await assert.rejects(
      c.selectAndReplace(shop, product, "camera", async () => {
        if (mode === "logout") sessions.clear();
        return mode === "logout";
      }),
    );
    assert.equal(p.requests.length, 0);
    assert.deepEqual(owned(p), []);
    assert.ok(p.fileBytes.has("/tmp/main.jpg"));
  }
});
test("thumbnail preparation and normalized readback failures clean prior owned copies", async () => {
  for (const mode of ["thumb", "readback", "orientation"]) {
    const { p } = setup(),
      { c } = client(p);
    if (mode === "thumb") p.compressedImagePaths.pop();
    if (mode === "readback") {
      const read = p.readFile.bind(p);
      p.readFile = async (path) => (path.startsWith("/owned/") ? new ArrayBuffer(4) : read(path));
    }
    if (mode === "orientation")
      p.imageInfos.set("/tmp/main.jpg", { ...info, orientation: "right" });
    await assert.rejects(c.selectAndReplace(shop, product), invalid);
    assert.deepEqual(owned(p), []);
    assert.equal(p.requests.length, 0);
  }
});
test("index failure and definitely absent journal failure clean files without requests", async () => {
  for (const stage of ["index", "journal"]) {
    const { p } = setup(),
      { c } = client(p);
    const save = p.setStorage.bind(p);
    p.setStorage = (key, value) => {
      if (
        (stage === "index" && key === index && value !== "[]") ||
        (stage === "journal" && key !== index && key.startsWith(prefix))
      )
        throw Error("quota");
      save(key, value);
    };
    await assert.rejects(c.selectAndReplace(shop, product), invalid);
    assert.deepEqual(owned(p), []);
    assert.equal(p.requests.length, 0);
    assert.equal(journal(p), undefined);
  }
});
test("journal write applied then threw preserves files and resumes the same identity", async () => {
  const { p } = setup(),
    { c } = client(p),
    save = p.setStorage.bind(p);
  p.setStorage = (key, value) => {
    save(key, value);
    if (key.startsWith(prefix) && key !== index) throw Error("lost reply");
  };
  await assert.rejects(c.selectAndReplace(shop, product), invalid);
  assert.equal(p.requests.length, 0);
  assert.equal(owned(p).length, 2);
  const before = JSON.parse(journal(p)[1]);
  p.setStorage = save;
  p.queuedResponses.push(noop);
  await client(p).c.selectAndReplace(shop, product);
  assert.equal(p.chooseImageCalls, 1);
  assert.equal(p.requests[0].headers["Idempotency-Key"], before.idempotencyKey);
  assert.deepEqual(owned(p), []);
});
test("uncertain journal read after write error retains owned files and sends nothing", async () => {
  const { p } = setup(),
    { c } = client(p),
    save = p.setStorage.bind(p),
    get = p.getStorage.bind(p);
  let uncertain = false;
  p.setStorage = (key, value) => {
    save(key, value);
    if (key.startsWith(prefix) && key !== index) {
      uncertain = true;
      throw Error("lost reply");
    }
  };
  p.getStorage = (key) => {
    if (uncertain && key.startsWith(prefix) && key !== index) throw Error("unavailable");
    return get(key);
  };
  await assert.rejects(c.selectAndReplace(shop, product), invalid);
  assert.equal(owned(p).length, 2);
  assert.equal(p.requests.length, 0);
});
test("logout immediately after journal commit preserves owned files and prevents network", async () => {
  const { p } = setup(),
    { c, sessions } = client(p),
    save = p.setStorage.bind(p);
  p.setStorage = (key, value) => {
    save(key, value);
    if (key.startsWith(prefix) && key !== index) sessions.clear();
  };
  await assert.rejects(c.selectAndReplace(shop, product), (e) => e.code === "session_expired");
  assert.equal(owned(p).length, 2);
  assert.ok(journal(p));
  assert.equal(p.requests.length, 0);
});
test("restart with missing index and transient file read failure keeps original journal", async () => {
  const { p } = setup(),
    { c } = client(p);
  p.queuedResponses.push(Error("offline"));
  await assert.rejects(c.selectAndReplace(shop, product));
  const stored = journal(p);
  p.storage.delete(index);
  const read = p.readFile.bind(p);
  p.readFile = async () => {
    throw Error("temporary read failure");
  };
  await assert.rejects(client(p).c.selectAndReplace(shop, product), invalid);
  assert.deepEqual(journal(p), stored);
  assert.equal(owned(p).length, 2);
  assert.equal(p.chooseImageCalls, 1);
  p.readFile = read;
  p.queuedResponses.push(noop);
  await client(p).c.selectAndReplace(shop, product);
  assert.equal(p.requests.at(-1).headers["Idempotency-Key"], JSON.parse(stored[1]).idempotencyKey);
  assert.deepEqual(owned(p), []);
});
test("first preparation sweep uses all raw journal keys and never sweeps corrupt journals", async () => {
  for (const corrupt of [false, true]) {
    const { p, put } = setup(),
      { c } = client(p);
    p.queuedResponses.push(Error("offline"));
    await assert.rejects(c.selectAndReplace(shop, product));
    const saved = journal(p);
    p.storage.delete(index);
    put("/owned/orphan.jpg", plain);
    if (corrupt) p.storage.set(`${prefix}other`, "broken");
    const next = client(p);
    p.compressedImagePaths.push("/tmp/main.jpg", "/tmp/thumb.jpg");
    await assert.rejects(
      next.c.selectAndReplace(
        shop,
        "20000000-0000-4000-8000-000000000004",
        "camera",
        async () => false,
      ),
    );
    assert.deepEqual(journal(p), saved);
    assert.equal(p.fileBytes.has("/owned/orphan.jpg"), corrupt);
    assert.ok(p.fileBytes.has("/owned/1.jpg"));
    assert.ok(p.fileBytes.has("/owned/2.jpg"));
  }
});
test("full uploads use exactly the cleaned bytes and release files after finalize", async () => {
  const { p } = setup(),
    { c } = client(p);
  const url = (kind) =>
    `${storage}/storage/v1/object/upload/sign/product-images/shops/${shop}/products/${product}/primary/${version}/${kind}.jpg?token=${"t".repeat(32)}`;
  p.queuedResponses.push(
    {
      statusCode: 201,
      data: {
        ok: true,
        status: "upload_required",
        cacheScope: "c".repeat(64),
        versionId: version,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        mainUploadUrl: url("main"),
        thumbUploadUrl: url("thumb"),
      },
    },
    { statusCode: 200, data: "" },
    { statusCode: 200, data: "" },
    {
      statusCode: 200,
      data: {
        ok: true,
        status: "finalized",
        versionId: version,
        imageUpdatedAt: "2026-09-27T00:00:00Z",
      },
    },
  );
  await c.selectAndReplace(shop, product);
  const puts = p.requests.filter((r) => r.method === "PUT");
  assert.equal(puts.length, 2);
  for (const request of puts) assert.deepEqual(Buffer.from(request.data), plain);
  assert.deepEqual(owned(p), []);
});

test("bounded encoding candidates are reclaimed after confirmation and failed preparation", async () => {
  for (const confirm of [false, true]) {
    const { p, put } = setup(),
      { c } = client(p);
    const padded = (size) =>
      Buffer.concat([
        native.subarray(0, -2),
        Buffer.alloc(size - native.length),
        native.subarray(-2),
      ]);
    put("/tmp/large1.jpg", padded(820000));
    put("/tmp/large2.jpg", padded(800000));
    p.compressedImagePaths.splice(
      0,
      2,
      "/tmp/large1.jpg",
      "/tmp/large2.jpg",
      "/tmp/main.jpg",
      "/tmp/thumb.jpg",
    );
    if (confirm) p.queuedResponses.push(noop);
    const pending = c.selectAndReplace(shop, product, "camera", async () => confirm);
    if (confirm) await pending;
    else await assert.rejects(pending, (e) => e.code === "image_operation_cancelled");
    assert.deepEqual(owned(p), []);
    assert.equal(p.compressionRequests.length, 4);
  }
});
test("simultaneous preparations wait for one shared sweep before opening either picker", async () => {
  const { p } = setup(),
    { c } = client(p);
  let release;
  const ready = new Promise((r) => {
    release = r;
  });
  let calls = 0;
  p.cleanImageFiles = async () => {
    calls++;
    await ready;
  };
  p.compressedImagePaths.push("/tmp/main.jpg", "/tmp/thumb.jpg");
  const all = Promise.allSettled([
    c.selectAndReplace(shop, product, "camera", async () => false),
    c.selectAndReplace(shop, "20000000-0000-4000-8000-000000000004", "camera", async () => false),
  ]);
  await new Promise((r) => setImmediate(r));
  assert.equal(calls, 1);
  assert.equal(p.chooseImageCalls, 0);
  release();
  const results = await all;
  assert.ok(results.every((r) => r.status === "rejected"));
  assert.equal(p.chooseImageCalls, 2);
  assert.deepEqual(owned(p), []);
});
test("malformed current journal cannot authorize a new picker and changed preview bytes cannot upload", async () => {
  {
    const { p } = setup(),
      { c } = client(p);
    p.storage.set(`${prefix}${"f".repeat(64)}.${shop}.${product}`, "broken");
    await assert.rejects(c.selectAndReplace(shop, product), invalid);
    assert.equal(p.chooseImageCalls, 0);
    assert.equal(p.requests.length, 0);
  }
  {
    const { p, put } = setup(),
      { c } = client(p);
    await assert.rejects(
      c.selectAndReplace(shop, product, "camera", async (preview) => {
        const changed = Buffer.from(plain);
        changed[changed.length - 4] ^= 1;
        put(preview.mainPath, changed);
        return true;
      }),
      invalid,
    );
    assert.equal(p.requests.length, 0);
    assert.deepEqual(owned(p), []);
  }
});

test("a transient sweep failure is typed and the next explicit selection retries cleanup", async () => {
  const { p } = setup(),
    { c } = client(p);
  let sweeps = 0;
  p.cleanImageFiles = async () => {
    if (++sweeps === 1) throw Error("temporary filesystem failure");
  };
  await Promise.all([
    assert.rejects(c.selectAndReplace(shop, product), invalid),
    assert.rejects(c.selectAndReplace(shop, "20000000-0000-4000-8000-000000000004"), invalid),
  ]);
  assert.equal(sweeps, 1);
  assert.equal(p.chooseImageCalls, 0);
  assert.equal(p.requests.length, 0);
  await assert.rejects(
    c.selectAndReplace(shop, product, "camera", async () => false),
    (e) => e.code === "image_operation_cancelled",
  );
  assert.equal(sweeps, 2);
  assert.equal(p.chooseImageCalls, 1);
  assert.equal(p.requests.length, 0);
  assert.deepEqual(owned(p), []);
});
