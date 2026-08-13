# WECHAT-005 — Staging activation and live cross-platform validation

- Status: `REVIEW`
- Classification: `CHANGES_REQUIRED; STAGING_ACTIVATION_PARTIAL; PHYSICAL_ACTION_REQUIRED; PRODUCTION_UNCHANGED`
- Parent/epic: successor to `WECHAT-004`; prior epics retain their historical states
- Owner: Codex coordinates; Admin owns server/migrations; each client owns its official adapter; the authorized operator owns identity/legal/2FA actions
- Opened / updated: 2026-08-13 / 2026-08-13
- Commit / PR, if any: `197dd64` / Mini PR #3 on `codex/wechat-005-mini-staging`

## Context and objective

Activate and validate the completed WECHAT-004 code as far as safely possible in
verified non-production staging. Apply only reviewed staging migrations and
configuration, activate one surface at a time, collect live evidence where real
official credentials/apps/devices exist, and keep every unavailable surface
fail-closed with a precise physical-action checklist.

## Dependencies and files to read

- WECHAT-004 and WMP-026…WMP-031; Admin ADR-002/ADR-003 and activation runbook.
- Current `origin/main` in Admin, Mini, Android and iOS after `fetch --prune`.
- Official Supabase, WeChat and Apple documentation current on the execution date.
- WMP-032…WMP-038 and the external activation ledger.

## In scope

- GitHub/staging inventory; non-production Supabase verification/migration;
  Admin staging deployment/configuration; official provider/app/DevTools
  inventory; progressive staging flags; available live Auth, catalog, sync,
  image, sales, offline and isolation tests; targeted WECHAT-005 diff security
  review; normal PR integration of necessary fixes.

## Out of scope

- Production changes or flags; Mini/store publication; payments, legal/company
  declarations, 2FA bypass, invented identity providers or credentials; POS/staff
  login changes; sales/payment/refund writes from clients; Excel import; changes
  to ClientMerchandiseControl, Win7POS or cashregistersystem; general Deep Scan.

## Files potentially involved

- Mini governance/runbooks/evidence and, only if defects are proven, bounded
  source/tests in the owning repositories through dedicated branches and PRs.

## Acceptance criteria

- [x] Git/GitHub and external platform baselines are redacted and reproducible.
- [ ] Supabase target is positively proven non-production before any schema write.
- [ ] Expected migrations are inventoried, dry-run reviewed, backed up and applied safely or blocked with exact cause.
- [ ] Admin staging is configured/deployed and smoke-tested without exposing secrets, or the exact external action is recorded.
- [ ] WeChat provider/app/domain/SDK/DevTools readiness is verified from official sources and real portals.
- [ ] Each available staging surface is enabled progressively and tested; unavailable surfaces remain OFF.
- [ ] Live identity, shop isolation, revocation, sync, Storage, sales and offline claims are made only where actually observed.
- [ ] Any code fix passes repository gates and normal PR/CI/merge; production and public publication remain unchanged.
- [x] WMP-032…WMP-038 and the final 50-point report distinguish PASS, partial, blocked and not-run results.

## Checks and evidence

| Check | Command/method | Result | Duration | Evidence |
|---|---|---|---|---|
| Four-repository Git/GitHub baseline | fetch, ancestry, PR and workflow inspection | PASS_WITH_NOTES | Recorded | external WECHAT-005 evidence bundle |
| Staging/platform/live gates | WMP-032…WMP-038 | PARTIAL / BLOCKED_EXTERNAL | Recorded | runbook ledger and redacted external evidence bundle |
| Mini full gate | `npm ci && npm run verify` | PASS — 62/62 | Recorded | local output and external test summary |
| Admin/DB/native independent gates | repository-native commands | PASS_WITH_EXTERNAL_LIMITS | Recorded | external test summary |

## Risks and remaining problems

- Admin currently records TASK-150 as the sole active execution lane; WECHAT-005
  must not become a concurrent Admin writer or migration/deploy actor until this
  ownership conflict is resolved by current state/evidence.
- Official apps, provider, secrets, account membership, DevTools and devices may
  require physical action. Missing gates remain OFF and are never simulated.

## Execution notes and worklog links

See `docs/TASK_HISTORY.md`, `docs/AI_WORKLOG.md` and the redacted external
evidence directory named in the WECHAT-005 worklog entry.

## Review decision

`CHANGES_REQUIRED`

## Next step and handoff

Resolve the single manual environment/writer handoff recorded in the ledger,
then resume WMP-032. All flags remain OFF. `DONE` still requires explicit
user/designated-reviewer confirmation after live evidence.
