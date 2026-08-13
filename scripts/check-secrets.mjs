import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const listed = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  cwd: root,
  encoding: "utf8",
});
if (listed.status !== 0) throw new Error("Unable to list repository files");

const forbidden = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /sb_secret_[A-Za-z0-9_-]{12,}/,
  /(?:WECHAT|WX)[A-Z0-9_]*SECRET\s*[:=]\s*["'][^"'\s]{8,}["']/i,
  /session_key\s*[:=]\s*["'][^"'\s]{8,}["']/i,
];
const findings = [];
for (const path of listed.stdout.split("\0").filter(Boolean)) {
  if (path === "package-lock.json") continue;
  let content;
  try {
    content = readFileSync(join(root, path), "utf8");
  } catch {
    continue;
  }
  if (forbidden.some((pattern) => pattern.test(content))) findings.push(path);
}
if (findings.length > 0) {
  throw new Error(`Potential secret material found in: ${findings.join(", ")}`);
}
