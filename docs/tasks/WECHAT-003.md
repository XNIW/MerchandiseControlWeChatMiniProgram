# WECHAT-003 — Mini Program controlled catalog management and remaining WeChat integration completion

- Status: `REVIEW`
- Classification: `FOUNDATION_IMPLEMENTED; LIVE_AUTH_AND_MUTATING_CATALOG_WORKFLOWS_INCOMPLETE`
- Parent/epic: corrective successor to `WECHAT-002`; controlled-catalog scope override for the Mini Program
- Owner: Admin Web owns Auth, mutations, migrations, permissions, audit, outbox/sync and Storage; the Mini Program owns only the typed client and UX; independent reviewer/user owns approval
- Opened / updated: 2026-08-12 / 2026-08-13
- Commit / PR, if any: none; no commit, push or PR is authorized

## Context and objective

Extend the existing WECHAT-001/002 foundation without discarding or rewriting it. Sales, payments, refunds, voids, POS history and staff operations remain read-only, while an authorized personal account may manage catalog entities only through the canonical Admin-owned server boundary. Complete the remaining Auth work that can be implemented safely, preserve the feature flags OFF until external activation, decide the Excel import gate, and obtain cross-platform, security and WeChat DevTools evidence.

The Mini Program now contains the native controlled-catalog UX and typed read/mutation clients, and its complete automated gate passes. Admin transaction/RLS evidence and Android/iOS device-free convergence suites now pass as well. This does not complete the parent: an ordinary WeChat Supabase bearer can still reach legacy/table same-shop catalog write sinks outside the controlled, flag-gated lane; external Auth activation, the iOS official provider/bridge, private invalidation and authorized WeChat DevTools/device QA also remain independent acceptance gates.

## Dependencies and files to read

- Mandatory WECHAT-003 addendum and retained WECHAT-001/002 task history.
- `AGENTS.md`, `CLAUDE.md`, `docs/MASTER_PLAN.md`, `docs/PARITY_MATRIX.md`, `docs/architecture/API_CONTRACT.md`, `docs/security/THREAT_MODEL.md`, `docs/testing/TEST_MATRIX.md` and WMP-017…WMP-025.
- Admin Web canonical Auth ADR-002, required catalog-mutation ADR-003, Excel decision DEC-002, real schema/migrations, RLS, mutation services, audit, sync/outbox and product-image contract.
- Android/iOS canonical catalog-text, mutation, image, price, tombstone, conflict and convergence behavior.
- Official WeChat Mini Program documentation and authorized DevTools/runtime configuration.

## Child sequence

`WMP-017` → `WMP-018` → `WMP-019` → `WMP-020` → `WMP-021` → `WMP-022` → `WMP-023` → `WMP-024` → `WMP-025`.

## In scope

- Controlled product create/update/archive/restore, current-price changes and category/supplier assignment.
- Category and supplier create/update/archive/restore and transactional replacement when referenced.
- Private product image intent/upload/finalize/replace/remove/read flows.
- Safe catalog mutation history, audit and standard cross-platform sync events.
- Real permission, validation, idempotency, concurrency, cache invalidation and error contracts.
- Remaining WeChat Auth client completion, live-invalidation evaluation, bounded polling fallback and DevTools QA.
- A formal decision gate for Excel import; implementation only if the canonical Admin service is safely reusable through a thin adapter.

## Out of scope

- Sale creation, refund, void, payment, cash-register, ledger or POS-history writes.
- Staff/PIN/password/device/role administration and the Platform Admin Console.
- Direct Mini Program writes to Supabase, client service-role/AppSecret use, client-authored audit/sync payloads or hard delete outside the canonical model.
- Camera barcode scanning, duplicated workbook parsing, publication, production rollout, commit, push, PR or merge.

## Files potentially involved

- Mini Program: typed contracts/clients, catalog/history pages, localization, cache/refresh controllers and focused tests.
- Admin Web: ADR-003, thin Mini API adapters, canonical mutation services, migrations/RLS, audit/outbox/sync and image boundary.
- Android/iOS: fixture and convergence tests only where required by their repository owners.
- Governance/evidence: this task, WMP-017…WMP-025, ledgers and external evidence directories.

## Acceptance criteria

- [ ] WMP-017 proves one Admin-owned, typed, shop-scoped mutation and permission contract with no direct Mini database write.
- [ ] WMP-018 proves product create/edit/archive/restore, exact barcode policy, numeric price handling, stale-version conflicts and cache refresh.
- [ ] WMP-019 proves category/supplier management and atomic replacement without partial cross-entity states.
- [ ] WMP-020 proves current-price history and private versioned image upload/replace/remove using the shared contract.
- [ ] WMP-021 records the Excel decision without a fake button, duplicated parser or client-side workbook processing.
- [ ] WMP-022 proves authorized catalog history, fail-closed audit and standard Admin/Android/iOS convergence without duplicate events.
- [ ] WMP-023 removes technically avoidable Auth placeholders or explicitly records the remaining code gap and exact external activation owner.
- [ ] WMP-024 proves a safe private invalidation path or retains the bounded fallback under the explicit `REVIEW_WITH_LIMITATION` classification.
- [ ] WMP-025 records full repository gates, authorized DevTools visual QA, performance, security, secrets and residual-risk evidence.
- [ ] Viewer, cross-shop, suspended profile/shop, revoked membership, replay, conflict and idempotency tests fail closed.
- [ ] No child is marked `DONE`; independent reviewer/user approval remains mandatory.

## Checks and evidence

| Check | Command/method | Result | Duration | Evidence |
|---|---|---|---|---|
| Mini clean install and complete automated gate | `npm ci`; `npm run verify` | PASS — install; governance, scoped secret scan, typecheck, Biome, 53/53 tests and build | 0.47 s; 2.68 s | Mini implementation execution; `tests/catalog-mutation-client.test.ts`, `tests/catalog-page-state.test.ts`, `tests/product-image-mutation-client.test.ts` |
| Mini controlled-catalog source review | Typed client/page review against the 13-operation contract and capability fields | PASS for implemented Mini slice | Not timed | Product/category/supplier/price/image/lifecycle/history pages and clients |
| Admin clean install and application gates | `npm ci`; `npm run verify`; typecheck, lint, i18n, security and production build; focused foundation suites | PASS — install and all named gates; focused foundation 47/47 | 8.41 s install; 24.13 s verify | Admin review logs; no deployment |
| Supabase local schema and scoped database suites | Local reset; catalog/image/standalone image pgTAP; database lint | PASS — reset 25.75 s; combined scoped 474/474; catalog 81/81; image 35/35; standalone POS image 162/162; lint 0 findings | 1.76 s standalone; 2.84 s lint | Global multi-file harness separately reproduced the known path crash after 312 passing assertions |
| Android convergence and regression | Convergence fixture, full JVM suite, lint and assemble | PASS — convergence; full 908 total, 5 skipped, 0 failed; lint/assemble PASS | Recorded Android run | Device-free evidence only |
| iOS convergence and regression | Convergence/focused/full suites and Release simulator build | PASS — convergence 4/4; focused 76/76; full 1296 passed plus 35 expected skips, 0 failed; Release simulator build PASS | Recorded iOS run | Main WeChat provider remains unconfigured; no live/device claim |
| Live Auth, convergence and DevTools QA | Authorized staging, devices and WeChat DevTools | NOT RUN — external configuration/evidence absent | — | WMP-023 and WMP-025 |
| Diff hygiene | `git diff --check` | PASS after Mini implementation | <1 s | Local worktree; no commit/push/PR/deploy |

## Risks and remaining problems

- An ordinary WeChat Supabase bearer can still directly reach legacy/table same-shop catalog write sinks, bypassing the controlled adapter, its feature flag and its policy envelope. All WeChat catalog-write flags therefore remain OFF pending coordinated revocation/scoping of those alternate sinks.
- The approved OIDC bridge is not operational and the iOS main path still contains an unconfigured authorization-code provider; Auth is not code-complete or live.
- A safe private Mini Program invalidation channel and measured latency are not proven; polling remains a declared limitation.
- DevTools/device visual QA and real image upload are unavailable without authorized AppID/domains/test identities.
- Durable server image-intent replay/idempotency and admission/rate controls now pass focused database evidence; real upload/finalize/cleanup behavior remains unproved in an authorized runtime.
- Active category/supplier selector responses are bounded to 100 entries and require product-scale/DevTools review.
- Existing top-level read-only governance text requires a separate, coordinated scope reconciliation; this task does not silently rewrite `AGENTS.md` or `README.md`.
- Concurrent cross-repository work must be reviewed as one complete system; automated Mini evidence is not independent approval.

## Execution notes and worklog links

- Created from the mandatory WECHAT-003 addendum without altering WECHAT-001/002 history.
- Native Mini product/category/supplier/price/image/history/lifecycle surfaces and focused state/contract tests were implemented before this governance reconciliation.
- The final Mini `npm run verify` passed with 53/53 tests. Admin, scoped database, Android and iOS automated evidence was reconciled as recorded above; no live provider, DevTools/device, deployment or production action was performed. See `docs/TASK_HISTORY.md` and `docs/AI_WORKLOG.md`.

## Review decision

`CHANGES_REQUIRED — FOUNDATION_IMPLEMENTED, LIVE AUTH AND MUTATING CATALOG WORKFLOWS INCOMPLETE`

## Next step and handoff

Independently review WMP-017 through WMP-025 against the complete cross-repository diffs. Supply the external prerequisites recorded in WMP-023 and WMP-025 before live evidence, and keep every WeChat feature flag OFF.

`DONE` requires explicit user/designated-reviewer confirmation.
