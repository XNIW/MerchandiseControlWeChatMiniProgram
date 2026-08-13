# Tasks in review

## WECHAT-003 — Controlled catalog management corrective review

- Status: `REVIEW`
- Review decision: `CHANGES_REQUIRED`
- Classification: `MINI_IMPLEMENTATION_VERIFIED_AUTOMATICALLY; LIVE_AND_CROSS_SURFACE_EVIDENCE_REQUIRED`
- Contract: [WECHAT-003](WECHAT-003.md)

### WECHAT-003 child tasks

- `WMP-017`: Status `REVIEW`; classification `MINI_CONSUMER_IMPLEMENTED; ADMIN_BOUNDARY_REVIEW_REQUIRED`; decision `CHANGES_REQUIRED` — Mini typed operation/capability/retry tests pass, while Admin permission/concurrency/durable-idempotency evidence requires independent review.
- `WMP-018`: Status `REVIEW`; classification `MINI_IMPLEMENTED; SERVER_AND_LIVE_VALIDATION_REQUIRED`; decision `CHANGES_REQUIRED` — native product create/edit/archive/restore and focused state tests pass; Admin RLS/transaction and DevTools evidence remain.
- `WMP-019`: Status `REVIEW`; classification `MINI_IMPLEMENTED; TRANSACTION_AND_LIVE_VALIDATION_REQUIRED`; decision `CHANGES_REQUIRED` — native category/supplier lifecycle and one-request replacement UX pass; atomic server rollback/sync proof remains.
- `WMP-020`: Status `REVIEW`; classification `MINI_IMPLEMENTED; STORAGE_SERVER_AND_LIVE_VALIDATION_REQUIRED`; decision `CHANGES_REQUIRED` — separate price operations and strict image client/UX tests pass; Storage/server/DevTools proof remains.
- `WMP-021`: Status `REVIEW`; classification `DEFERRED_BY_ARCHITECTURE_DECISION`; decision `CHANGES_REQUIRED` — Admin DEC-002 rejects Mini Excel import until bearer context, resource bounds and indeterminate-apply recovery are safe; the implemented Mini remains import-free.
- `WMP-022`: Status `REVIEW`; classification `MINI_HISTORY_IMPLEMENTED; CROSS_SURFACE_CONVERGENCE_REQUIRED`; decision `CHANGES_REQUIRED` — exact lifecycle/catalog-history routes, filters and cursors pass Mini tests; Admin audit and Android/iOS convergence remain.
- `WMP-023`: Status `BLOCKED_EXTERNAL`; classification `EXTERNAL_ACTIVATION_REQUIRED`; decision `CHANGES_REQUIRED` — approved OIDC bridge/configuration/test identities are absent and the iOS main path retains `UnconfiguredWeChatAuthorizationCodeProvider`; all flags stay OFF.
- `WMP-024`: Status `REVIEW`; classification `REVIEW_WITH_LIMITATION`; decision `CHANGES_REQUIRED` — bounded adaptive polling and cache fencing pass, but no private compatible invalidation channel or measured live latency is proven.
- `WMP-025`: Status `BLOCKED_EXTERNAL`; classification `DEVTOOLS_AND_AUTHORIZED_RUNTIME_EVIDENCE_REQUIRED`; decision `CHANGES_REQUIRED` — Mini `npm run verify` passes 48/48 tests, while registered AppID/domains/DevTools identities/device and integrated live evidence are absent.

No WECHAT-003 task is `DONE`. Automated Mini evidence is recorded, but independent cross-repository and live approval is absent.

## WECHAT-002 child tasks

- `WMP-011`: `REVIEW` — bounded sales history/date/detail client and backend contract implemented.
- `WMP-012`: `REVIEW / CHANGES_REQUIRED` — adaptive 3–30 second polling fallback implemented; private live invalidation and measured live latency absent.
- `WMP-013`: `REVIEW` — bounded catalog and private-image consumer implemented.
- `WMP-014`: `REVIEW` — categories, suppliers and price history implemented.
- `WMP-015`: `REVIEW` — account, shop, locale, offline and sanitized history UX implemented.
- `WMP-016`: `REVIEW / CHANGES_REQUIRED` — matrix and gates complete; live/device/DevTools evidence and global legacy pgTAP stability absent.

None is `DONE`; live/device/visual evidence remains outstanding.

## WECHAT-002 — Corrective review

- Status: `REVIEW / CHANGES_REQUIRED`
- Classification: `FOUNDATION_IMPLEMENTED, LIVE AUTH AND MINI PROGRAM PARITY INCOMPLETE`
- Evidence: [WECHAT-002 test evidence](../testing/WECHAT-002-EVIDENCE.md) and [capability matrix](../PARITY_MATRIX.md).

## WECHAT-001 — Changes requested

- Status: `REVIEW / CHANGES_REQUIRED`
- Classification: `FOUNDATION_IMPLEMENTED, LIVE AUTH AND MINI PROGRAM PARITY INCOMPLETE`
- Successor: `WECHAT-002`; the historical evidence below is retained and not promoted to `DONE`.

## WMP-001 — Repository foundation, governance and GitHub bootstrap

- Status: `REVIEW_READY`
- Parent: `WECHAT-001`
- Bootstrap commit: `cf3a28b2541cddc5eb13a1e195ebe521b615f69a`
- Remote: `https://github.com/XNIW/MerchandiseControlWeChatMiniProgram`
- Evidence: required files and links present; scoped secret scan and `git diff --check` passed; public remote/default `main`/topics/HEAD verified; exactly one bootstrap push; feature branch `codex/wechat-001-mini-program` created locally.
- Review boundary: bootstrap contains governance/documentation only. No application code, AppID, secret, CI, deployment, or publication.
- Required reviewer action: inspect the root commit and confirm or request changes. Do not mark `DONE` without explicit approval.

## WMP-002…WMP-008 — Technical vertical slice

- Status: `REVIEW_READY`
- Parent: `WECHAT-001`
- Scope delivered sequentially: pinned native TypeScript foundation; default-OFF configuration and CI; `wx.login`/gateway adapter; memory-only bounded session; authorized shop selection; daily summary and keyset-paginated sales client/UI; 10-second visible polling and pull-to-refresh; localized loading/empty/offline/error/expiry states; threat model and cross-shop contract tests.
- Evidence: `npm run verify`, six adapter/session/API tests, Admin 26-test pgTAP contract and repository-level platform gates.
- External boundary: official AppID/AppSecret, domains, bridge/provider activation, DevTools/device and same-identity live evidence are absent. WMP-009 is not started.
- Review action: inspect source, generated build boundary and security evidence. Do not mark `DONE` without explicit reviewer/user confirmation.
