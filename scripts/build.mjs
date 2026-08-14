import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { extname, join, relative } from "node:path";

const repositoryRoot = new URL("..", import.meta.url).pathname;
const sourceRoot = join(repositoryRoot, "miniprogram");
const outputRoot = join(repositoryRoot, "dist");
const copiedExtensions = new Set([".json", ".wxml", ".wxss"]);

rmSync(outputRoot, { force: true, recursive: true });
const typeScript = spawnSync(
  process.execPath,
  [join(repositoryRoot, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.build.json"],
  { cwd: repositoryRoot, stdio: "inherit" },
);
if (typeScript.status !== 0) process.exit(typeScript.status ?? 1);

function copyAssets(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);
    if (entry.isDirectory()) {
      copyAssets(source);
      continue;
    }
    if (!copiedExtensions.has(extname(entry.name))) continue;
    const destination = join(outputRoot, relative(sourceRoot, source));
    mkdirSync(join(destination, ".."), { recursive: true });
    cpSync(source, destination);
  }
}

if (!existsSync(sourceRoot)) throw new Error("miniprogram source directory is missing");
copyAssets(sourceRoot);

function publicHttpsUrl(name, value, originOnly) {
  if (!value) return "";
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL`);
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    (originOnly && parsed.pathname !== "/")
  ) {
    throw new Error(`${name} must be a public HTTPS ${originOnly ? "origin" : "URL"}`);
  }
  return originOnly ? parsed.origin : parsed.toString();
}

const enabled = process.env.WECHAT_AUTH_MINI_PROGRAM_ENABLED ?? "0";
if (enabled !== "0" && enabled !== "1") {
  throw new Error("WECHAT_AUTH_MINI_PROGRAM_ENABLED must be 0 or 1");
}
const gatewayBaseUrl = publicHttpsUrl(
  "WECHAT_AUTH_GATEWAY_BASE_URL",
  process.env.WECHAT_AUTH_GATEWAY_BASE_URL ?? process.env.WECHAT_MINIPROGRAM_REQUEST_DOMAIN ?? "",
  true,
);
const privacyUrl = publicHttpsUrl(
  "WECHAT_MINIPROGRAM_PRIVACY_URL",
  process.env.WECHAT_MINIPROGRAM_PRIVACY_URL ?? "https://example.invalid/privacy",
  false,
);
const storageBaseUrl = publicHttpsUrl(
  "WECHAT_MINIPROGRAM_STORAGE_BASE_URL",
  process.env.WECHAT_MINIPROGRAM_STORAGE_BASE_URL ??
    process.env.WECHAT_MINIPROGRAM_DOWNLOAD_DOMAIN ??
    "",
  true,
);
const runtimeConfigPath = join(outputRoot, "config/runtime-config.js");
let compiledRuntimeConfig = readFileSync(runtimeConfigPath, "utf8");
for (const [placeholder, value] of [
  ["__MC_WECHAT_AUTH_ENABLED__", enabled],
  ["__MC_WECHAT_GATEWAY_BASE_URL__", gatewayBaseUrl],
  ["__MC_WECHAT_PRIVACY_URL__", privacyUrl],
  ["__MC_WECHAT_STORAGE_BASE_URL__", storageBaseUrl],
]) {
  const encodedPlaceholder = JSON.stringify(placeholder);
  if (!compiledRuntimeConfig.includes(encodedPlaceholder)) {
    throw new Error(`missing runtime config placeholder: ${placeholder}`);
  }
  compiledRuntimeConfig = compiledRuntimeConfig.replaceAll(
    encodedPlaceholder,
    JSON.stringify(value),
  );
}
writeFileSync(runtimeConfigPath, compiledRuntimeConfig);
