import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { normalizeJpeg } = require("../dist-test/miniprogram/lib/jpeg-normalization.js");
const profile = readFileSync(new URL("./fixtures/jpeg/skia-srgb.icc", import.meta.url));
const jpg = (name) => readFileSync(new URL(`./fixtures/jpeg/${name}.jpg`, import.meta.url));
const ab = (b) => Uint8Array.from(b).buffer;
const norm = (b) => Buffer.from(normalizeJpeg(ab(b)));
const segment = (marker, data) =>
  Buffer.concat([
    Buffer.from([255, marker, (data.length + 2) >> 8, (data.length + 2) & 255]),
    data,
  ]);
const icc = segment(226, Buffer.concat([Buffer.from("ICC_PROFILE\0\x01\x01", "binary"), profile]));
const add = (b, part = icc, offset = 2) =>
  Buffer.concat([b.subarray(0, offset), part, b.subarray(offset)]);

test("baseline and progressive: remove exactly the verified ICC, preserving every other byte", () => {
  assert.equal(
    createHash("sha256").update(profile).digest("hex"),
    "12afb4d9953adee0607d347daee5b78b18d6b3cab2d572b88970703f5edb37bc",
  );
  for (const kind of ["baseline", "progressive"]) {
    const plain = jpg(kind);
    const original = ab(plain);
    assert.equal(normalizeJpeg(original), original);
    assert.deepEqual(norm(add(plain)), plain);
    assert.equal(add(plain).length - plain.length, 474);
  }
});
test("ICC between progressive scans is inspected and duplicate ICC is rejected across scans", () => {
  const plain = jpg("progressive");
  const first = plain.indexOf(Buffer.from([255, 218]));
  const second = plain.indexOf(Buffer.from([255, 218]), first + 2);
  assert.ok(second > first);
  assert.deepEqual(norm(add(plain, icc, second)), plain);
  assert.throws(() => norm(add(add(plain, icc, second))));
});
test("unknown or malformed metadata and color profiles never pass as sRGB", () => {
  const plain = jpg("baseline");
  for (const offset of [0, 8, 12, 16, 64, 240, 276, 356, 455]) {
    const wrong = Buffer.from(icc);
    wrong[offset + 18] ^= 1;
    assert.throws(() => norm(add(plain, wrong)));
  }
  for (const part of [
    Buffer.concat([icc, icc]),
    segment(225, Buffer.from("Exif\0\0")),
    segment(238, Buffer.from("Adobe")),
    segment(254, Buffer.from("comment")),
    segment(226, Buffer.from("unknown")),
  ])
    assert.throws(() => norm(add(plain, part)));
  for (const offset of [16, 17]) {
    const multipart = Buffer.from(icc);
    multipart[offset] = 2;
    assert.throws(() => norm(add(plain, multipart)));
  }
});
test("truncated envelopes, invalid markers and trailing data fail closed", () => {
  const data = add(jpg("baseline"));
  for (let end = 0; end < data.length; end++) assert.throws(() => norm(data.subarray(0, end)));
  assert.throws(() => norm(Buffer.concat([data, Buffer.from([0])])));
  const bad = Buffer.from(data);
  bad[4] = 255;
  bad[5] = 255;
  assert.throws(() => norm(bad));
  assert.throws(() => norm(add(jpg("baseline"), Buffer.from([255, 0, 0, 2]))));
});
test("RGB ICC is never removed from CMYK or unsupported precision", () => {
  const plain = jpg("baseline");
  const start = plain.indexOf(Buffer.from([255, 192]));
  assert.ok(start > 0);
  const cmyk = Buffer.concat([
    plain.subarray(0, start + 19),
    Buffer.from([4, 17, 0]),
    plain.subarray(start + 19),
  ]);
  cmyk[start + 3] = 20;
  cmyk[start + 9] = 4;
  assert.throws(() => norm(add(cmyk)));
  const precision = Buffer.from(plain);
  precision[start + 4] = 12;
  assert.throws(() => norm(add(precision)));
});
test("stuffed bytes and restart markers in entropy remain identical", () => {
  const plain = jpg("baseline");
  const sos = plain.indexOf(Buffer.from([255, 218]));
  const end = sos + 2 + plain.readUInt16BE(sos + 2);
  const decorated = add(plain, Buffer.from([255, 0, 42, 255, 208, 10]), end);
  assert.deepEqual(norm(add(decorated)), decorated);
});
