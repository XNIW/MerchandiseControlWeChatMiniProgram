import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = new URL("../miniprogram/content/policies.ts", import.meta.url);
const sourceIndex = process.argv.indexOf("--source");
const check = process.argv.includes("--check");
const source = sourceIndex < 0 ? null : process.argv[sourceIndex + 1];
const prefix = "export const policyBundle = ";
const suffix = " as const;\n";
const current = () => readFileSync(target, "utf8");
const bundle = source
  ? JSON.parse(readFileSync(resolve(source), "utf8"))
  : JSON.parse(current().split(prefix)[1]?.split(suffix)[0] ?? "null");
if (bundle?.schemaVersion !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(bundle.contentVersion)) {
  throw new Error("Invalid canonical policy source");
}
for (const locale of ["en", "es", "it", "zh-Hans"]) {
  const entry = bundle.locales[locale];
  for (const name of ["privacy", "deletion"]) {
    if (!entry?.[name]?.title || entry[name].sections.length !== (name === "privacy" ? 6 : 4)) {
      throw new Error("Incomplete policy locale");
    }
    entry[name].sections.forEach((section, index) => {
      if (
        !section.title ||
        section.blocks.length !== bundle.locales.en[name].sections[index].blocks.length ||
        section.blocks.some((block) => !["item", "paragraph"].includes(block.kind) || !block.text)
      ) {
        throw new Error("Incomplete policy section");
      }
    });
  }
}
const payload = JSON.stringify(bundle, null, 2);
const hash = createHash("sha256").update(payload).digest("hex");
const expected = `// Generated from merchandise-control-admin-web/src/lib/legal/policies.json.\n// Run scripts/sync-privacy.mjs --source <canonical-file>; do not edit.\nexport const policyContentSha256 =\n  "${hash}";\n// biome-ignore format: Preserve generated canonical JSON for source verification.\n${prefix}${payload}${suffix}`;
if (check) {
  if (current() !== expected) throw new Error("Policy content differs from its pinned source/hash");
} else {
  if (!source) throw new Error("An explicit canonical --source is required to update content");
  mkdirSync(new URL("../miniprogram/content/", import.meta.url), { recursive: true });
  writeFileSync(target, expected);
}
console.log(`PRIVACY_SOURCE_PARITY=${hash}`);
