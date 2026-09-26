import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const { createWeChatPlatform } = require("../dist-test/miniprogram/lib/platform.js");

async function readNativeResult(data) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "wx");
  Object.defineProperty(globalThis, "wx", {
    configurable: true,
    value: {
      getFileSystemManager: () => ({
        readFile: ({ success }) => success({ data, errMsg: "readFile:ok" }),
      }),
    },
  });
  try {
    return await createWeChatPlatform().readFile("/tmp/owned-image.jpg");
  } finally {
    if (previous) Object.defineProperty(globalThis, "wx", previous);
    else delete globalThis.wx;
  }
}

test("native file buffer from another realm preserves its JPEG bytes", async () => {
  const foreign = runInNewContext("new Uint8Array([255,216,1,2,255,217]).buffer");
  assert.equal(foreign instanceof ArrayBuffer, false);
  const bytes = await readNativeResult(foreign);
  assert.deepEqual([...new Uint8Array(bytes)], [255, 216, 1, 2, 255, 217]);
  assert.equal(bytes.byteLength, 6);
});

test("native file buffer from the current realm remains supported", async () => {
  const bytes = new Uint8Array([255, 216, 255, 217]).buffer;
  assert.equal(await readNativeResult(bytes), bytes);
});

test("native file result rejects strings, views and forged ArrayBuffer tags", async () => {
  for (const data of [
    "jpeg",
    null,
    undefined,
    new Uint8Array(4),
    new DataView(new ArrayBuffer(4)),
    new SharedArrayBuffer(4),
    { byteLength: 4, [Symbol.toStringTag]: "ArrayBuffer" },
    Object.create(ArrayBuffer.prototype),
    new Proxy(new ArrayBuffer(4), {}),
  ]) {
    await assert.rejects(readNativeResult(data), /image_read_failed/);
  }
});
