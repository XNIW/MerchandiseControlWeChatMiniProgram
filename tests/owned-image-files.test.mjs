import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { createWeChatPlatform } = require("../dist-test/miniprogram/lib/platform.js");
const root = "wxfile://usr",
  name = (n) => `mc-product-image-${n.repeat(32)}.jpg`;
async function withWx(fs, run) {
  const old = globalThis.wx;
  globalThis.wx = {
    env: { USER_DATA_PATH: root },
    getRandomValues: (o) => o.success({ randomValues: new Uint8Array(16).fill(17).buffer }),
    getFileSystemManager: () => fs,
  };
  try {
    await run(createWeChatPlatform());
  } finally {
    globalThis.wx = old;
  }
}
test("owned binary writes use raw ArrayBuffer and confirmation adopts the same path", async () => {
  let write;
  const removed = [];
  await withWx(
    {
      writeFile: (o) => {
        write = o;
        o.success({});
      },
      unlink: (o) => {
        removed.push(o.filePath);
        o.success({});
      },
    },
    async (p) => {
      const bytes = new Uint8Array([255, 216, 255, 217]).buffer;
      const path = await p.writeImageFile(bytes);
      assert.equal(path, `${root}/${name("1")}`);
      assert.equal(write.data, bytes);
      assert.equal(write.encoding, undefined);
      assert.equal(await p.saveFile(path), path);
      await p.removeSavedFile(path);
      assert.deepEqual(removed, [path]);
    },
  );
});
test("partial write failure unlinks only its own target; startup sweep preserves references and foreign files", async () => {
  const removed = [];
  await withWx(
    {
      writeFile: (o) => o.fail({ errMsg: "quota" }),
      unlink: (o) => {
        removed.push(o.filePath);
        o.success({});
      },
      readdir: (o) =>
        o.success({
          files: [
            name("1"),
            name("2"),
            "original.jpg",
            `../${name("3")}`,
            "mc-product-image-invalid.jpg",
          ],
        }),
    },
    async (p) => {
      await assert.rejects(p.writeImageFile(new ArrayBuffer(8)), /image_file_write_failed/);
      assert.deepEqual(removed, [`${root}/${name("1")}`]);
      removed.length = 0;
      await p.cleanImageFiles([`${root}/${name("2")}`]);
      assert.deepEqual(removed, [`${root}/${name("1")}`]);
    },
  );
});
test("legacy native saved files retain official save/remove behavior", async () => {
  let saved, removed;
  await withWx(
    {
      saveFile: (o) => {
        saved = o.tempFilePath;
        o.success({ savedFilePath: "/native/saved" });
      },
      removeSavedFile: (o) => {
        removed = o.filePath;
        o.success({});
      },
    },
    async (p) => {
      assert.equal(await p.saveFile("/native/temp"), "/native/saved");
      await p.removeSavedFile("/native/saved");
      assert.equal(saved, "/native/temp");
      assert.equal(removed, "/native/saved");
    },
  );
});
