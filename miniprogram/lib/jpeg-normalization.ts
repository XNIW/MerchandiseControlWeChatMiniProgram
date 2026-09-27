// Exact Skia sRGB profile emitted by the native DevTools JPEG encoder. Comparing
// the entire profile (not its name) preserves color semantics. See the provenance
// and compatibility limits in docs/testing/WECHAT-010-JPEG.md.
const srgbProfileHex = [
  "000001c800000000043000006d6e74725247422058595a2007e000010001000000000000616373700000000000000000",
  "00000000000000000000000000000000000000010000f6d6000100000000d32d00000000000000000000000000000000",
  "00000000000000000000000000000000000000000000000000000000000000000000000964657363000000f000000024",
  "7258595a00000114000000146758595a00000128000000146258595a0000013c00000014777470740000015000000014",
  "725452430000016400000028675452430000016400000028625452430000016400000028637072740000018c0000003c",
  "6d6c756300000000000000010000000c656e5553000000080000001c007300520047004258595a200000000000006fa2",
  "000038f50000039058595a2000000000000062990000b785000018da58595a2000000000000024a000000f840000b6cf",
  "58595a20000000000000f6d6000100000000d32d706172610000000000040000000266660000f2a700000d59000013d0",
  "00000a5b00000000000000006d6c756300000000000000010000000c656e5553000000200000001c0047006f006f0067",
  "006c006500200049006e0063002e00200032003000310036",
].join("");
const srgbProfile = Uint8Array.from(srgbProfileHex.match(/../g) ?? [], (byte) =>
  Number.parseInt(byte, 16),
);
const iccPrefix = [73, 67, 67, 95, 80, 82, 79, 70, 73, 76, 69, 0, 1, 1];

function invalid(): never {
  throw new Error("image_jpeg_normalization_failed");
}

/** Bounded metadata normalization; the server still performs full JPEG validation.
 * Call only after native decode reports orientation=up. Unknown color profiles and
 * all other metadata fail closed. Entropy, frames, tables and scans are unchanged.
 */
export function normalizeJpeg(buffer: ArrayBuffer): ArrayBuffer {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4 || bytes.length > 1024 * 1024 || bytes[0] !== 255 || bytes[1] !== 216)
    invalid();
  let offset = 2;
  let frame = false;
  let components = 0;
  let scan = false;
  let jfif = false;
  let removed: { start: number; end: number } | undefined;
  while (offset < bytes.length) {
    const start = offset;
    if (bytes[offset++] !== 255) invalid();
    while (bytes[offset] === 255) offset++;
    const marker = bytes[offset++];
    if (marker === 217) {
      if (offset !== bytes.length || !frame || !scan || (removed && components !== 3)) invalid();
      if (!removed) return buffer;
      const output = new Uint8Array(bytes.length - (removed.end - removed.start));
      output.set(bytes.subarray(0, removed.start));
      output.set(bytes.subarray(removed.end), removed.start);
      return output.buffer;
    }
    const high = bytes[offset],
      low = bytes[offset + 1];
    if (high === undefined || low === undefined) invalid();
    const length = (high << 8) | low;
    const data = offset + 2,
      end = offset + length;
    if (length < 2 || end > bytes.length) invalid();
    if (marker === 226) {
      if (
        removed ||
        length !== 472 ||
        !iccPrefix.every((v, i) => bytes[data + i] === v) ||
        !srgbProfile.every((v, i) => bytes[data + iccPrefix.length + i] === v)
      )
        invalid();
      removed = { start, end };
    } else if (marker === 224) {
      if (
        jfif ||
        frame ||
        scan ||
        length !== 16 ||
        ![74, 70, 73, 70, 0, 1].every((v, i) => bytes[data + i] === v) ||
        (bytes[data + 7] ?? 255) > 2 ||
        bytes[data + 12] !== 0 ||
        bytes[data + 13] !== 0
      )
        invalid();
      jfif = true;
    } else if (marker === 192 || marker === 194) {
      components = bytes[data + 5] ?? 0;
      if (
        frame ||
        scan ||
        components < 1 ||
        components > 4 ||
        length !== 8 + components * 3 ||
        bytes[data] !== 8
      )
        invalid();
      frame = true;
    } else if (marker === 218) {
      if (!frame || length < 6) invalid();
      scan = true;
    } else if (marker !== 196 && marker !== 219 && marker !== 221) {
      invalid();
    }
    offset = end;
    if (marker === 218) {
      // Metadata can occur between progressive scans. Stuffed FF00 and restart
      // markers belong to the entropy stream and must remain byte-identical.
      while (offset < bytes.length) {
        if (bytes[offset] !== 255) {
          offset++;
          continue;
        }
        let next = offset + 1;
        while (bytes[next] === 255) next++;
        const code = bytes[next];
        if (code === undefined) invalid();
        if (code === 0 || (code >= 208 && code <= 215)) {
          offset = next + 1;
          continue;
        }
        break;
      }
    }
  }
  return invalid();
}
