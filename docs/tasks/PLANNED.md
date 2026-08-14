# Planned tasks

| ID | Title | Dependency | Initial status |
|---|---|---|---|
| WMP-009 | WeChat DevTools physical/live validation | AppID, domains, approval, authorized test identity | SUPERSEDED_IN_PLANNING_BY_WMP-025 / history preserved |
| WMP-010 | Final review and release readiness | WMP-001…WMP-009 | SUPERSEDED_IN_PLANNING_BY_WMP-025 / history preserved |
| WMP-043 | Mini Program DevTools runtime and visual QA | WECHAT-006 | HANDED_OFF_TO_WMP-050 / history preserved |
| WMP-044 | Cross-platform identity and Auth live E2E | WECHAT-006 | HANDED_OFF_TO_WMP-049 / history preserved |
| WMP-045 | Catalog, images, sales and sync staging E2E | WECHAT-006 | HANDED_OFF_TO_WMP-051 / history preserved |
| WMP-046 | GitHub integration and staging closeout | WECHAT-006 | HANDED_OFF_TO_WMP-052 / history preserved |
| WMP-048 | Provider, callback and progressive staging activation | WMP-047 | PLANNING |
| WMP-049 | Live Auth, canonical identity, linking and isolation | WMP-048 | PLANNING |
| WMP-050 | Official Mini DevTools runtime and visual QA | WMP-047…049 | PLANNING |
| WMP-051 | Essential catalog, images, sales and sync live E2E | WMP-049…050 | PLANNING |
| WMP-052 | Performance, GitHub integration and factual closeout | WMP-047…051 | PLANNING |

Each task must be expanded from the template before activation. Do not activate tasks in parallel for the same writer.

WMP-011 through WMP-022 and WMP-024 retain their historical `REVIEW` state;
WMP-023 and WMP-025 retain external activation blockers. WECHAT-004 and
WMP-026…WMP-031 are `DONE`, so they are not duplicated in the planned backlog.
WMP-021 is deferred by its architecture decision, not queued for implementation.
WECHAT-005/WMP-032…038 are no longer planning backlog: the parent and WMP-038
are in `REVIEW / CHANGES_REQUIRED`, while WMP-032…037 are individually
`BLOCKED_EXTERNAL`. See `REVIEW.md` and the activation ledger.

WECHAT-006 is in `REVIEW / EXTERNAL_ACTION_HANDOFF_COMPLETE`; WMP-043…046 are
preserved as historical handoff rows. WECHAT-007 is active with WMP-047 in
`EXECUTION / OPERATOR_ACTION_REQUIRED`; WMP-048…052 stay ordered.
