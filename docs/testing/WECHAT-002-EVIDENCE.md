# WECHAT-002 local evidence

Recorded 2026-08-12 in a local-only execution. No staging or production mutation was performed.

## Passing gates

- Admin: `npm ci` 10.06s; typecheck 2.42s; lint 10.34s; build 12.30s; final verify 22.34s; Auth/read-contract Node tests 7/7 in 0.21s; local HTTP default-OFF/unauthenticated guard smoke passed.
- Supabase local: final reset from all migrations 30.69s; WECHAT-001/002 pgTAP 69/69 in 1.94s; existing product-image security pgTAP 153/153 in 2.00s; new-function scoped lint emitted no WECHAT findings.
- Performance: rolled-back local fixture with about 20k products, 10k price rows, 10k sales and 20k ledger rows completed in 5.67s. Observed execution: catalog page 33.276ms, catalog search 16.972ms, price page 1.963ms, sales page 1.139ms, 30-day summary 38.939ms.
- Android: targeted WeChat/session tests + assemble passed in 4.06s; full `testDebugUnitTest lintDebug assembleDebug` passed in 88.76s.
- iOS simulator: WeChat contract 8/8 in 29.52s; complete scheme 1,327 unit tests (35 skipped) plus 4 UI tests passed in 340.17s.
- Mini Program: `npm ci` 1.19s; final governance/secret/type/lint/11 unit/build verify passed in 1.27s.

## Non-passing or unavailable gates

- Global legacy pgTAP is not green: after 148 assertions passed, `cross_platform_sync_recovery_contract.sql:2584` terminated local PostgreSQL; subsequent files could not connect. A fresh reset and the targeted WECHAT/image suites then passed. This is outside the WECHAT change set and is not hidden by the targeted result.
- Global database lint exits successfully but reports historical warnings/errors, including extension/pgTAP internals; no new `wechat_*` finding was emitted by the scoped check.
- WeChat DevTools/CLI, AppID test preview, Android/iOS physical devices, registered callback/Universal Link, live bridge/provider, live Realtime latency and four-surface identity E2E were unavailable.
- `npm audit --omit=dev` reports one existing high-severity production dependency advisory for `nanoid <3.3.17`; it is outside this corrective change set and remains a repository risk.

WECHAT-004 follow-up: the Admin lock now resolves `nanoid` 3.3.18 and the
compatible `wrangler`/`miniflare`/`undici` chain without changing runtime source;
final production and full-tree audits report 0 vulnerabilities. The line above
is retained as historical WECHAT-002 evidence.

No result in this file is a production, live-provider, release-readiness or parity-complete claim.
