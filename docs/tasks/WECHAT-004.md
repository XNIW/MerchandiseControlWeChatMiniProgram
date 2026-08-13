# WECHAT-004 — Final sync policy parity and integration closeout

- Status: `DONE`
- Classification: `MERGED_CODE_COMPLETE_EXTERNAL_ACTIVATION_REQUIRED`
- Parent/epic: final successor to `WECHAT-001`, `WECHAT-002` and `WECHAT-003`
- Owner: Admin Web owns identity/session/API/migrations; Mini owns durable client state; Android/iOS own native adapters and apply engines; authorized operator owns activation
- Opened / updated: 2026-08-13 / 2026-08-13
- Commit / PR, if any: Admin `4b325980` / PR #85; Mini `a76dd18e` / PR #1; Android `bf11e8ca` / PR #8; iOS `1f63b071` / PR #6; all merged normally

## Context and objective

Close every repository-controlled security and synchronization gap, prove
semantic parity with real local Supabase data and production apply engines,
then integrate the feature-gated code through normal GitHub pull requests. Live
WeChat authentication remains a separate external gate.

## Dependencies and files to read

- WECHAT-001/002/003 history and WMP-011…WMP-025.
- Admin ADR-002, ADR-003, WECHAT activation runbook, migrations and pgTAP.
- Mini API/parity/threat/test matrices and WMP-026…WMP-031.
- Android/iOS Auth contracts and incremental apply-engine tests.

## In scope

- Opaque Mini BFF sessions, legacy-sink closure and recoverable identity-link audit saga.
- Durable bounded per-user/shop outbox; delta, watermark, gap, epoch and reconcile policy.
- Explicit CAS conflicts, bounded automatic polling and authoritative targeted refresh.
- Real local Supabase mutation/event/readback plus Android/iOS production apply-engine fixtures.
- Targeted security diff review, complete local gates, normal PR/CI/merge and post-merge verification.

## Out of scope

- Production/staging mutation without a verified non-production allowlist; feature activation; Mini/store publication.
- Provider contracts/payments; client secrets; staff/PIN/shop-code; sales/refund/void writes.
- Changes to ClientMerchandiseControl, Win7POS or cashregistersystem.

## Files potentially involved

- Mini source/tests/governance in this repository.
- Admin BFF/Auth/catalog/image/sync/migrations/tests/docs.
- Android/iOS WeChat adapters and convergence tests.

## Acceptance criteria

- [x] Opaque Mini sessions cannot authenticate to legacy tables/RPCs.
- [x] Link state is idempotent, recoverable and audit-finalized or terminal.
- [x] Durable outbox, same-key retry, ordering, account/shop isolation and conflict states pass.
- [x] Delta/watermark/gap/epoch/reconcile semantics match Android/iOS.
- [x] Real local Supabase mutation/event/readback is consumed by Android/iOS production apply engines.
- [x] Targeted security review has no unresolved P0/P1 and all reportable snapshot findings are fixed.
- [x] Four feature PRs are merged normally with green CI; the governance-only closeout PR records the final state.
- [x] Final repository heads and clean states are recorded in WMP-031.
- [x] Flags remain OFF and staging/production remain unchanged.

## Checks and evidence

| Check | Command/method | Result | Duration | Evidence |
|---|---|---|---|---|
| Security diff | Codex targeted diff review | PASS after fixes — 66/66 rows; 5 Medium + 2 Low snapshot findings fixed | 44m26s scan goal | Canonical external scan report |
| Real local convergence | Rollback-only Supabase fixture plus Android/iOS production apply tests | PASS | Recorded local runs | External forensic evidence bundle |
| Admin/Supabase | Foundation/pgTAP/reset/lint/build gates | PASS before final rerun | Recorded | Admin WECHAT-004 matrix |
| Mini | Typecheck/lint/tests/build/governance/secrets | PASS before final rerun | Recorded | Mini `npm run verify` |
| GitHub integration | Feature PRs, CI, normal merge, post-merge gates | PASS | Admin #85, Mini #1, Android #8, iOS #6 | WMP-031 |

## Risks and remaining problems

- Official bridge/AppID/domains/iOS provider/DevTools/devices are unavailable;
  `WECHAT_AUTH_LIVE_E2E_PASS` is not claimed.
- Private push invalidation is not proven. Adaptive minimal delta polling is the
  accepted transport and is not labelled realtime.
- A Low follow-up remains for measuring repeated bounded pre-CAS image finalize
  work under concurrent load; it is not an unresolved P0/P1 merge blocker.

## Execution notes and worklog links

See `docs/AI_WORKLOG.md`, `docs/TASK_HISTORY.md`, WMP-026…WMP-031 and the
forensic evidence bundle outside the repository.

## Review decision

`APPROVED_FOR_NORMAL_PR_MERGE_WITH_FLAGS_OFF`

## Next step and handoff

The repository-controlled work is merged and closed as
`INTEGRATED_SYNC_POLICY_PARITY_PASS`. The sole next phase is the separately
authorized external activation runbook; live WeChat evidence is not claimed.
