# MerchandiseControl WeChat Mini Program — Master Plan

**WECHAT-007** is in `EXECUTION` for assisted official registration and live
validation on the user-authorized `SHARED_PUBLIC_STAGING` target. `WMP-047` is
the single active Mini lane with `OPERATOR_ACTION_REQUIRED —
WECHAT_PORTAL_REGISTRATION_PACKET`; WMP-048…052 are ordered. FAST BASELINE and
the restricted operator packet pass, while all AppIDs and real OIDC bridge
values remain absent and every WeChat flag stays OFF. No different production
environment or public application publication is in scope.

**WECHAT-006** is in `REVIEW / EXTERNAL_ACTION_HANDOFF_COMPLETE`; its verified
backup/schema/Worker/native evidence remains historical and is not repeated.

**WECHAT-005** remains historical `REVIEW / CHANGES_REQUIRED`; its external
blockers are superseded only where the WECHAT-006 mandate supplies specific
authorization or new evidence. Its factual gate results are not rewritten.

**WECHAT-004** is `DONE` with classification
`MERGED_CODE_COMPLETE_EXTERNAL_ACTIVATION_REQUIRED` and result
`INTEGRATED_SYNC_POLICY_PARITY_PASS`. Corrective parents **WECHAT-001**,
**WECHAT-002** and **WECHAT-003** retain their historical review states.

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
| M16 | Opaque Mini session and legacy-sink closure | WECHAT-004; Admin BFF/session migration | No general Supabase bearer; controlled service-only reads/mutations and revocation | External provider activation | DONE |
| M17 | Durable outbox and incremental sync parity | M16; canonical sync_events | Restart-safe ordered outbox, watermark/delta/gap/epoch/reconcile and explicit conflicts | Private push not proven; polling limitation | DONE |
| M18 | Local cross-platform E2E and security closeout | M16–M17; Android/iOS apply engines | Real local Supabase mutation/event/readback, production apply tests, targeted security scan | Staging/device/provider external | DONE |
| M19 | Four-repository GitHub integration | M16–M18; green local gates | Normal PR/CI/merge, post-merge verification, clean published heads | External activation only | DONE |
| M20 | Staging activation and live cross-platform validation | M19; verified non-production environments; official apps/provider/devices | Staging schema/deploy, progressive flags, factual live identity/sync/Storage/sales evidence and closeout | Target is labelled Production/no backup; writer, apps, provider and devices absent | REVIEW / CHANGES_REQUIRED |
| M21 | Shared public staging activation and live closeout | M19–M20; explicit staging designation and writer/deploy mandate | Manual restorable backup, current schema/Worker, official adapters, progressive E2E, normal GitHub integration and factual 54-field closeout | External WeChat registration and physical devices may bound live coverage | REVIEW / EXTERNAL_ACTION_HANDOFF_COMPLETE |
| M22 | Assisted official registration and essential live staging E2E | M21; operator public config; real provider/apps/devices | Operator packet, progressive Auth, official DevTools, essential catalog/image/sales/sync proof, performance and factual closeout | Portal/provider approvals and measured polling defects | EXECUTION |

## Task sequence

WMP-001 through WMP-008 retain their historical `REVIEW_READY` state under WECHAT-001, which now has changes requested. WMP-011, WMP-013, WMP-014 and WMP-015 remain in `REVIEW`; WMP-012 and WMP-016 remain `REVIEW / CHANGES_REQUIRED` under WECHAT-002.

WECHAT-003 and WMP-017…WMP-025 retain their historical `REVIEW` states. WMP-017…WMP-020 and WMP-022 are `CHANGES_REQUIRED`; WMP-021 records `DEFERRED_BY_ARCHITECTURE_DECISION`; WMP-023 records `EXTERNAL_ACTIVATION_REQUIRED / CHANGES_REQUIRED`; WMP-024 records `REVIEW_WITH_LIMITATION / CHANGES_REQUIRED`; WMP-025 is `CHANGES_REQUIRED`. The older unstarted WMP-009/WMP-010 backlog is preserved but superseded in planning by WMP-025 for the expanded scope. None of these older tasks is retroactively promoted to `DONE`.

WECHAT-004 supersedes the repository-controlled blockers without rewriting that
history. WMP-026…WMP-031 are `DONE` after normal merges and post-merge gates.
Auth remains `DONE_CODE / EXTERNAL_ACTIVATION_REQUIRED`, Excel remains deferred
and DevTools/live evidence remains externally blocked.

WECHAT-005 adds WMP-032…WMP-038 without rewriting WECHAT-001…004. The target,
migrations, staging deployment, official runtime and client prerequisites were
fully inventoried; independent Mini/Admin/local DB/Android/iOS gates pass and
official WeChat DevTools is installed. WMP-032…WMP-037 are now
`BLOCKED_EXTERNAL`; WMP-038 and the parent are `REVIEW / CHANGES_REQUIRED`.
No unavailable surface is presented as live.

WECHAT-006 adds WMP-039…WMP-046 under an explicit user mandate that designates
the exact Supabase project and Worker as `SHARED_PUBLIC_STAGING`, authorizes the
stale Admin writer handoff, a restricted manual backup, staging migration/deploy
and normal GitHub integration. Backup, seven migrations, Admin PR/merge, Worker
deploy, Mini automated gates, Android audit/gates and iOS device-free provider
gates are complete. Admin #86/#87 and iOS #7/#8 are merged normally; WMP-042
is in REVIEW. Portal/DevTools/live E2E remain exact external work; all
flags are OFF. The production/publication boundary remains unchanged.

WECHAT-007 adds WMP-047…WMP-052 without repeating the stable WECHAT-006
baseline. WMP-047 is active for operator-assisted application inventory;
WMP-048…052 cover real provider activation, live Auth, official Mini runtime,
essential live E2E, performance and normal GitHub closeout. Direct portal
automation is not attempted, and missing OIDC data never produces an invented IdP.

## Completion criteria

The repository may become release-ready only after the canonical identity contract, authorized shop isolation, financial semantics, controlled catalog mutation permissions/concurrency/idempotency, audit/outbox/sync convergence, private image lifecycle, deterministic build/tests, security review and official WeChat live/DevTools checks are all evidenced. Missing external approval is reported explicitly; it is never replaced by fixture evidence. No task becomes `DONE` without explicit user/designated-reviewer approval.
