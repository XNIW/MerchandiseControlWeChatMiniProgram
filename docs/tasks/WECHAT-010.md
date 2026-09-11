# WECHAT-010 — Test-account domains and first-live prerequisites

- Status: `REVIEW / EXTERNAL_ACTIVATION_REQUIRED`
- Owner: Codex, sole Mini writer; independent agents read/review only.
- Opened: 2026-09-11
- Branch: `codex/wechat-010-mini-staging`
- Base: current `origin/main` `2732868cf8a246b37cca4ef617d6310900fd5a8d`, clean, zero drift.
- Mandate: user-authorized staged verification, bounded fixes, full gates,
  security review, commit/push/PR/CI/normal merge; staging only.

## Scope and acceptance

Accept the operator's manual TEST-account domain evidence. Reuse the private
WECHAT-007 inventory/build script. Keep AppID in private DevTools configuration
only and every Auth/mutation/linking flag OFF. The exposed test AppSecret must
never be copied or used; rotation and verified vendor/provider readiness precede
any real code exchange. Do not automate the WeChat portal.

Verify build, official DevTools domain validation and OFF network behavior;
inspect actual staging Worker/migrations rather than counts alone. Qualify the
existing Tencent OneID recommendation and, if needed, Authing against ADR-002,
without buying a tenant or changing identity architecture. Complete independent
fail-closed preparation. Live authenticated behavior remains NOT_RUN until proven.

## Evidence and handoff

Execution report: `docs/testing/WECHAT-010-REPORT.md` (created at review handoff).
Private operator packet: `/Users/minxiang/Projects/_codex-private/wechat-007/`.
Operator owns credential rotation and DevTools QR login. Admin owns the canonical
bridge/session decision and migrations. No self-approved DONE; no production,
publication, native checkout changes or invented live fixtures.

## Verified handoff

Mini full pinned-toolchain gates pass 84/84; DevTools TEST import, refreshed
domains, bypass OFF, five-tab OFF audit and four public HTTPS runtime probes pass.
Auth expiry, asynchronous success/error cancellation, Home session/lifecycle
cleanup and gateway redirect refusal are fixed with deterministic regressions.
Security scan has complete four-source coverage and no findings; the final
lifecycle guard/test delta was independently reviewed separately. GitHub
integration and isolated Admin staging delivery are recorded in the report.
