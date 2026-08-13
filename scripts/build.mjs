import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
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
