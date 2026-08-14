# Planned tasks

| ID | Title | Dependency | Initial status |
|---|---|---|---|
| WMP-009 | WeChat DevTools physical/live validation | AppID, domains, approval, authorized test identity | SUPERSEDED_IN_PLANNING_BY_WMP-025 / history preserved |
| WMP-010 | Final review and release readiness | WMP-001…WMP-009 | SUPERSEDED_IN_PLANNING_BY_WMP-025 / history preserved |
| WMP-043 | Mini Program DevTools runtime and visual QA | WMP-040 and WMP-041 | PLANNING / AUTOMATED_PASS / DEVTOOLS_BLOCKED_EXTERNAL |
| WMP-044 | Cross-platform identity and Auth live E2E | WMP-040…WMP-043 | PLANNING |
| WMP-045 | Catalog, images, sales and sync staging E2E | WMP-040, WMP-042…WMP-044 | PLANNING |
| WMP-046 | GitHub integration and staging closeout | WMP-039…WMP-045 | PLANNING |

Each task must be expanded from the template before activation. Do not activate tasks in parallel for the same writer.

WMP-011 through WMP-022 and WMP-024 retain their historical `REVIEW` state;
WMP-023 and WMP-025 retain external activation blockers. WECHAT-004 and
WMP-026…WMP-031 are `DONE`, so they are not duplicated in the planned backlog.
WMP-021 is deferred by its architecture decision, not queued for implementation.
WECHAT-005/WMP-032…038 are no longer planning backlog: the parent and WMP-038
are in `REVIEW / CHANGES_REQUIRED`, while WMP-032…037 are individually
`BLOCKED_EXTERNAL`. See `REVIEW.md` and the activation ledger.

WECHAT-006 is active with WMP-041 in `EXECUTION / PHYSICAL_ACTION_REQUIRED`.
WMP-039/040/042 are in REVIEW; WMP-043 retains its automated result while its
portal/runtime dependencies remain unmet; WMP-044…046 stay ordered.
