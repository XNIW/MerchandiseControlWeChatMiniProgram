# MerchandiseControl WeChat Mini Program — Master Plan

Parent cross-repository task: **WECHAT-001**

This is the source of truth for the Mini Program vision, scope, milestones, tasks, dependencies, risks, and completion criteria. The canonical WeChat identity decision belongs to the Admin Web ADR; this repository consumes it and must not create a competing Auth architecture.

## Vision and boundaries

Deliver a native TypeScript, read-only Mini Program that lets a canonical MerchandiseControl personal account view authorized shops and daily sales. The client never owns WeChat AppSecret/code exchange, Supabase migrations, role assignment, or business-data writes.

Non-goals include POS staff login, product/staff management, sales/refund/void/payment operations, direct POS-table access, platform administration, publication, or production rollout.

## Cross-repository dependencies

- Admin Web: selected identity/session contract, server boundary, Supabase configuration, canonical migrations, shop-scoped read APIs.
- WeChat Open Platform: AppID, account association/UnionID eligibility, request domains, privacy configuration, review and approval.
- Supabase: custom OIDC provider and verified official session handoff.
- Android/iOS: behavior and UX consistency; neither defines a separate identity contract.

## Milestones

| Milestone | Objective | Dependencies | Acceptance/checks | Main risk | Status |
|---|---|---|---|---|---|
| M0 | Repository foundation and governance | User authorization | Governance, ledgers, remote/main, one bootstrap commit, secret/diff checks | Accidental feature code in bootstrap | EXECUTION |
| M1 | Official WeChat technical feasibility | Official docs; WECHAT-001 | Evidence-backed Mini Program constraints and contract fit | External docs/approval unavailable | IN PROGRESS (parent) |
| M2 | Mini Program application foundation | M0, M1 decision gate | Pinned toolchain, deterministic scripts, CI, build | Unsupported DevTools/runtime assumptions | PLANNED |
| M3 | Secure identity/session integration | Canonical Admin ADR/API | `wx.login` adapter, replay-safe backend handoff, session lifecycle tests | Account takeover/token leakage | PLANNED |
| M4 | Authorized shop selection | M3, shop RPC | Only active authorized shops visible | Cross-shop access | PLANNED |
| M5 | Daily sales read model | Admin migration/RPC | Correct timezone/currency/net/refunds/pagination | Financial misstatement | PLANNED |
| M6 | Dashboard and paginated list | M4, M5 | Loading/empty/error/offline/session states; zh-Hans complete | Misleading UX | PLANNED |
| M7 | Automatic refresh/realtime fallback | Runtime feasibility | Bounded 5–15s polling or supported private realtime; dedupe | Request storm/data leakage | PLANNED |
| M8 | Security, privacy, cross-shop validation | M3–M7 | P0/P1 mitigations, secret scan, cross-shop tests | Identity/data isolation failure | PLANNED |
| M9 | WeChat DevTools and external activation | AppID/domains/approval/test account | Authorized DevTools/live evidence | External prerequisites | EXTERNAL_PREREQUISITES_REQUIRED |
| M10 | Final review and release readiness | M0–M9 | Full gates, evidence, review decision | Unproven live behavior | PLANNED |

## Task sequence

WMP-001 is the only active task. WMP-002 through WMP-010 are recorded in `docs/tasks/PLANNED.md` and must be activated one at a time according to dependencies.

## Completion criteria

The repository may become release-ready only after the canonical identity contract, authorized shop isolation, financial semantics, deterministic build/tests, security review, and official WeChat live checks are all evidenced. Missing external approval is reported explicitly; it is never replaced by fixture evidence.
