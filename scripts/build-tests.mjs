import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

const repositoryRoot = new URL("..", import.meta.url).pathname;
rmSync(join(repositoryRoot, "dist-test"), { force: true, recursive: true });
const result = spawnSync(
  process.execPath,
  [join(repositoryRoot, "node_modules/typescript/bin/tsc"), "-p", "tsconfig.test.json"],
  { cwd: repositoryRoot, stdio: "inherit" },
);
process.exit(result.status ?? 1);
