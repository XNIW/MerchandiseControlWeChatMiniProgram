# WECHAT-003 test evidence matrix

## Automated locally

- Mini clean install `npm ci` PASS in 0.47 s; final `npm run verify` PASS in 2.68 s with governance, scoped secret scan, typecheck, Biome, 53/53 tests and build.
- Admin clean install `npm ci` PASS in 8.41 s; final verify PASS in 24.13 s together with typecheck, lint, i18n, security and production build; focused foundation suites PASS 47/47.
- `wx.login` success, cancel, missing code, malformed challenge, provider confusion, and backend denial fixtures.
- Memory-only session expiry and logout behavior; no refresh-token persistence.
- HTTPS/fixed-path API boundary, explicit shop scope, page limit, cursor pairing, and membership denial mapping.
- Admin pgTAP: one-time challenge/replay, authorized viewer, cross-shop/anon denial, disabled profile, suspended membership/shop, empty summary and page bounds.
- WECHAT-002 pgTAP: account identity state, sales ranges, catalog/detail, categories, suppliers, price history, sanitized sync history, owner/manager sales metadata gate, anonymous/cross-shop/revoked membership denial.
- WECHAT-002 client: date presets, LRU eviction, adaptive polling backoff/stop, HTTPS bearer routing, bounded catalog/image batch, plus existing login/session expiry/shop/page fixtures.
- Performance: rolled-back local fixture of approximately 20k products, 10k price rows, 10k sales and 20k ledger rows; no production data is touched.
- Supabase local reset PASS in 25.75 s; combined scoped database evidence PASS 474/474, catalog mutation pgTAP PASS 81/81, image intent/mutation pgTAP PASS 35/35 and standalone POS image task_149 PASS 162/162 in 1.76 s. Database lint for `public` and `app_private` at error level reported 0 findings in 2.84 s.
- The global multi-file pgTAP harness was also run transparently and reproduced the known path crash after 312 passing assertions; this does not invalidate the independently passing scoped files and is not hidden by them.
- Android convergence and regression: full JVM suite PASS with 908 total, 5 skipped and 0 failed; lint and assemble PASS.
- iOS convergence and regression: convergence 4/4, focused 76/76, full 1296 passed plus 35 expected skips and 0 failed; Release simulator build PASS. The main WeChat provider remains unconfigured.
- WECHAT-003 Mini cache safety: session-generation fencing, logout/shop/account invalidation, signed-image URL expiry/scope and stop-during-in-flight polling.
- WECHAT-003 Admin Auth runtime smoke: canonical readiness, challenge/exchange/replay/callback/linking without bridge credentials; feature remains OFF.
- WECHAT-003 Mini image server boundary: personal membership only, viewer read/write split, no platform-admin bypass, durable intent replay/admission controls, shared parsers/service and secure response headers.
- Dependency audits: Admin and Mini production/full trees now report 0. Admin
  lock updates `nanoid` to 3.3.18 and the compatible `wrangler` chain to a
  release carrying `undici` 7.29.0.

## Automated foundation now evidenced

- Scoped database assertions cover product/group/price operations, viewer/platform-admin denial, shop A/B isolation, suspension/revocation, stale CAS, receipt replay/mismatch/concurrency, atomic replacement, price history, audit History and standard sync events.
- Mini tests cover exact schemas, double-submit, ambiguous retry key reuse, conflict preservation, offline/error mapping, archive confirmation, replacement, price refresh, image intent/finalize/remove, session-generation fencing and mutation cache invalidation.
- Android/iOS catalog-text, sync-event, price and image fixtures provide device-free protocol convergence; they do not claim a live device.

## Still required before activation

- Revoke or scope ordinary WeChat Supabase bearer access to legacy/table same-shop catalog write sinks so the controlled adapter and OFF feature flag cannot be bypassed.
- Operate the approved OIDC bridge and replace the iOS `UnconfiguredWeChatAuthorizationCodeProvider` with an authorized official provider/callback configuration.
- Run authorized WeChat DevTools visual/network QA; screenshots must exclude tokens, signed URLs and real sensitive data.

## Not live evidence

Fixtures do not prove `wx.login`, code2Session, UnionID, OIDC bridge operation, Supabase provider activation, approved domains, same identity across four surfaces, DevTools/device behavior, real upload cleanup, or live sale/refund refresh latency. Those remain `NOT RUN — EXTERNAL ACTIVATION REQUIRED` until an authorized AppID, approved bridge, staging configuration and test identities exist.

Global classification: `CHANGES_REQUIRED — FOUNDATION_IMPLEMENTED, LIVE AUTH AND MUTATING CATALOG WORKFLOWS INCOMPLETE`.

## WECHAT-004 final local matrix

- Opaque session: issuance/import, device binding, generation, expiry, logout,
  revocation, feature OFF and service-only dispatch covered.
- Legacy denial: opaque Mini token cannot execute direct catalog tables/RPCs;
  Android/iOS/Admin personal-auth regressions remain green.
- Durable outbox: restart persistence, bounded bytes/count, same-key retry,
  multi-entity ordering, conflict, pending logout, membership revocation,
  image local-file lifecycle and foreground/online flush covered.
- Incremental sync: 3–30 second scheduler, minimal delta, burst dedupe,
  watermark, gap recovery, reconcile, epoch bootstrap, cache invalidation and
  account/shop fencing covered.
- Local E2E: rollback-only real Supabase product/category/supplier/two prices,
  complete catalog/prices events and Admin readback; Android/iOS production
  apply engines consume the fixture and reject foreign shop scope.
- Security: targeted Admin diff review 66/66; five Medium plus two Low snapshot
  findings fixed; no unresolved P0/P1. One Low concurrency measurement remains.
- External: staging, approved bridge/AppID/domains/iOS provider, DevTools and
  physical-device same-identity login are `NOT RUN` and are not represented by
  fixtures.

WMP-031 records green pre-commit, GitHub CI and post-merge gates. Feature PRs
Admin #85, Mini #1, Android #8 and iOS #6 are merged normally; external staging,
DevTools and live Auth remain explicitly not run.
