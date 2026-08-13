# MerchandiseControl WeChat Mini Program — Master Plan

Corrective parent **WECHAT-003** is in `REVIEW / CHANGES_REQUIRED`. **WECHAT-001** and **WECHAT-002** remain in `REVIEW / CHANGES_REQUIRED`; their history is preserved.

This is the source of truth for the Mini Program vision, scope, milestones, tasks, dependencies, risks, and completion criteria. The canonical WeChat identity decision belongs to the Admin Web ADR; this repository consumes it and must not create a competing Auth architecture.

## Vision and boundaries

Deliver a native TypeScript Mini Program that lets a canonical MerchandiseControl personal account consult authorized shops, sales history, catalog/images, categories, suppliers, prices, sync history and account state. Sales, payments, refunds, voids, POS history and staff operations remain read-only. WECHAT-003 additionally permits controlled catalog/product/category/supplier/price/image mutations for authorized personal users, exclusively through the canonical Admin-owned server boundary. The client never owns WeChat AppSecret/code exchange, Supabase migrations, role assignment, direct database writes, trusted audit creation or sync-event construction.

Non-goals include POS staff login, staff/device/role writes, sales/refund/void/payment operations, direct Supabase-table access, platform administration, publication or production rollout. Camera barcode scanning remains excluded. Excel import is `DEFERRED_BY_ARCHITECTURE_DECISION` under WMP-021; no parser or placeholder UI belongs in the Mini Program.

## Cross-repository dependencies

- Admin Web: selected identity/session contract, server boundary, Supabase configuration, canonical migrations, shop-scoped read APIs, mutation services, permissions, audit/outbox/sync and private image Storage boundary.
- WeChat Open Platform: AppID, account association/UnionID eligibility, request domains, privacy configuration, review and approval.
- Supabase: custom OIDC provider and verified official session handoff.
- Android/iOS: behavior and UX consistency; neither defines a separate identity contract.

## Milestones

| Milestone | Objective | Dependencies | Acceptance/checks | Main risk | Status |
|---|---|---|---|---|---|
| M0 | Repository foundation and governance | User authorization | Governance, ledgers, remote/main, one bootstrap commit, secret/diff checks | Independent review pending | REVIEW_READY |
| M1 | Official WeChat technical feasibility | Official docs; WECHAT-001 | Evidence-backed Mini Program constraints and contract fit | External docs/approval unavailable | IN PROGRESS (parent) |
| M2 | Mini Program application foundation | M0, M1 decision gate | Pinned toolchain, deterministic scripts, CI, build | DevTools live proof pending | REVIEW_READY |
| M3 | Secure identity/session integration | Canonical Admin ADR/API | `wx.login` adapter, replay-safe backend handoff, session lifecycle tests | Bridge/device proof pending | REVIEW_READY |
| M4 | Authorized shop selection | M3, shop RPC | Only active authorized shops visible | Live cross-shop proof pending | REVIEW_READY |
| M5 | Daily sales read model | Admin migration/RPC | Correct timezone/currency/net/refunds/pagination | Live financial fixture pending | REVIEW_READY |
| M6 | Dashboard and paginated list | M4, M5 | Loading/empty/error/offline/session states; zh-Hans complete | Visual DevTools QA pending | REVIEW_READY |
| M7 | Automatic refresh/realtime fallback | Runtime feasibility | Adaptive bounded 3–30s polling, stop/resume, backoff | No private invalidation or measured live latency | REVIEW / CHANGES_REQUIRED |
| M8 | Security, privacy, cross-shop validation | M3–M7 | Threat model, secret scan, cross-shop contract tests | External activation gates remain | REVIEW_READY |
| M9 | WeChat DevTools and external activation | AppID/domains/approval/test account | Authorized DevTools/live evidence | External prerequisites | EXTERNAL_PREREQUISITES_REQUIRED |
| M10 | Final review and release readiness | M0–M9 | Full gates, evidence, review decision | Unproven live behavior and global legacy pgTAP crash | REVIEW / CHANGES_REQUIRED |
| M11 | Controlled mutation contract and permissions | WECHAT-003; Admin ADR/service/schema | Typed idempotent revision-guarded service; viewer/shop A-B denial | Canonical ADR/evidence under review | REVIEW / CHANGES_REQUIRED |
| M12 | Product, category, supplier, price and image management | M11; shared text/image contracts | Authorized UX, archive/restore, replacement, price history, private images | Live/visual and full integration evidence absent | REVIEW / CHANGES_REQUIRED |
| M13 | Catalog history and cross-platform convergence | M12; audit/outbox/sync | Safe history projection; complete idempotent events; Android/iOS fixtures | Live convergence unproved | REVIEW / CHANGES_REQUIRED |
| M14 | Excel import decision | Admin canonical import pipeline | Evidence-based thin-adapter gate | Public upload/recovery boundary insufficient | DEFERRED_BY_ARCHITECTURE_DECISION |
| M15 | Remaining Auth, refresh and integrated QA | M3, M7, M11–M14; external activation | Official adapters/bridge, private invalidation or declared fallback, DevTools/full gates | Bridge/iOS provider/AppID/domains/live QA absent | REVIEW / CHANGES_REQUIRED |
| M16 | Opaque Mini session and legacy-sink closure | WECHAT-004; Admin BFF/session migration | No general Supabase bearer; controlled service-only reads/mutations and revocation | External provider activation | REVIEW / READY_TO_MERGE |
| M17 | Durable outbox and incremental sync parity | M16; canonical sync_events | Restart-safe ordered outbox, watermark/delta/gap/epoch/reconcile and explicit conflicts | Private push not proven; polling limitation | REVIEW / READY_TO_MERGE |
| M18 | Local cross-platform E2E and security closeout | M16–M17; Android/iOS apply engines | Real local Supabase mutation/event/readback, production apply tests, targeted security scan | Staging/device/provider external | REVIEW / READY_TO_MERGE |
| M19 | Four-repository GitHub integration | M16–M18; green local gates | Normal PR/CI/merge, post-merge verification, clean published heads | Pending remote workflow | REVIEW |

## Task sequence

WMP-001 through WMP-008 retain their historical `REVIEW_READY` state under WECHAT-001, which now has changes requested. WMP-011, WMP-013, WMP-014 and WMP-015 remain in `REVIEW`; WMP-012 and WMP-016 remain `REVIEW / CHANGES_REQUIRED` under WECHAT-002.

WECHAT-003 and WMP-017…WMP-025 are handed to `REVIEW`. WMP-017…WMP-020 and WMP-022 are `CHANGES_REQUIRED`; WMP-021 records `DEFERRED_BY_ARCHITECTURE_DECISION`; WMP-023 records `EXTERNAL_ACTIVATION_REQUIRED / CHANGES_REQUIRED`; WMP-024 records `REVIEW_WITH_LIMITATION / CHANGES_REQUIRED`; WMP-025 is `CHANGES_REQUIRED`. The older unstarted WMP-009/WMP-010 backlog is preserved but superseded in planning by WMP-025 for the expanded scope. No task is in `EXECUTION` or `DONE`.

WECHAT-004 supersedes the repository-controlled blockers without rewriting that
history. WMP-026…WMP-030 are code-complete in `REVIEW`; WMP-031 performs the
authorized GitHub integration. After real normal merges and post-merge gates,
the explicitly authorized governance closeout may mark code-complete tasks
`DONE`, while Auth remains `DONE_CODE / EXTERNAL_ACTIVATION_REQUIRED`, Excel
remains deferred and DevTools/live evidence remains externally blocked.

## Completion criteria

The repository may become release-ready only after the canonical identity contract, authorized shop isolation, financial semantics, controlled catalog mutation permissions/concurrency/idempotency, audit/outbox/sync convergence, private image lifecycle, deterministic build/tests, security review and official WeChat live/DevTools checks are all evidenced. Missing external approval is reported explicitly; it is never replaced by fixture evidence. No task becomes `DONE` without explicit user/designated-reviewer approval.
