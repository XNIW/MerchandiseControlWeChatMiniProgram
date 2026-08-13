# Test matrix

## Automated before review

- Deterministic install, typecheck, lint, unit tests, build, governance and secret scans.
- `wx.login` adapter success/cancel/deny/missing-code/duplicate/expired/state-mismatch/not-configured fixtures.
- Backend temporary/conflict/suspended/session-expired error mapping.
- Session restore, refresh, local logout, offline/retry, bounded polling, dedupe/debounce.
- Authorized-shop and cross-shop denial contracts; daily timezone/currency/net/refund/pagination fixtures.

## Live only with external prerequisites

Official WeChat DevTools/device login, same canonical identity across web/Android/iOS/Mini Program, domain/approval checks, removed membership/suspended user denial, sale/refund refresh, and verification that logs/bundles contain no credentials. Record these as `NOT RUN — external prerequisite` until evidenced; fixtures are not live tests.

See [TEST_MATRIX.md](TEST_MATRIX.md) for the current evidence boundary.
