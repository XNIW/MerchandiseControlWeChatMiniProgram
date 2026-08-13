import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const required = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "docs/MASTER_PLAN.md",
  "docs/WORKFLOW.md",
  "docs/AI_WORKLOG.md",
  "docs/TASK_HISTORY.md",
  "docs/tasks/ACTIVE.md",
  "docs/tasks/PLANNED.md",
  "docs/tasks/REVIEW.md",
  "docs/tasks/DONE.md",
];

const missing = required.filter((path) => !existsSync(join(root, path)));
if (missing.length > 0) {
  throw new Error(`Missing governance files: ${missing.join(", ")}`);
}
const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
for (const marker of [
  "PLANNING",
  "EXECUTION",
  "REVIEW",
  "DONE",
  "Sales/POS/staff capabilities remain read-only",
  "controlled catalog mutations",
]) {
  if (!agents.includes(marker)) throw new Error(`AGENTS.md is missing marker: ${marker}`);
}
