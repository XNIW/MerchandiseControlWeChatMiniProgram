# WECHAT-007 — Assisted registration, shared-staging live activation and E2E

- Status: `EXECUTION`
- Classification: `ASSISTED_REGISTRATION_AND_SHARED_STAGING_ACTIVATION; PRODUCTION_AND_PUBLICATION_EXCLUDED`
- Parent/epic: successor to `WECHAT-006`; prior evidence remains historical
- Owner: Codex coordinates; the authorized operator owns portal/QR/2FA/legal/payment actions; each repository has one writer
- Opened / updated: 2026-08-14 / 2026-08-14
- Commit / PR, if any: branch `codex/wechat-007-assisted-activation` from Mini `origin/main` `4b3a3152a95f15042492ea44fcd341349a115767`

## Context and objective

Complete the official public application inventory through an operator-assisted
handoff, activate only a real provider and verified public configuration on the
authorized shared staging, then prove live Auth and the essential Mini catalog,
image, sales and sync workflows with factual evidence. Reuse the verified
WECHAT-006 schema/deployment baseline and do not repeat backup, migrations, full
suites or deploy unless drift or a bounded fix makes them necessary.

## Dependencies and files to read

- The WECHAT-007 mandate, repository guides, WECHAT-006 closeout and canonical Admin Auth ADR.
- Current `origin/main` in Admin, Mini, Android and iOS.
- Operator-supplied public configuration and redacted portal screenshots.
- Official WeChat/Supabase/Apple/Android documentation only when a live configuration exists.

## In scope

- WMP-047…WMP-052; private operator packet outside repositories; provider and
  callback validation; allowlisted one-surface-at-a-time flags; live Auth,
  identity/linking/isolation; DevTools/runtime QA; catalog/images/history/sales/
  sync/outbox/reconcile/conflict/performance; bounded fixes and normal GitHub integration.

## Out of scope

- Production, Mini publication/review, store submissions, staff/PIN, Mini Excel,
  client sales/refund/void/payment writes, source changes in Win7POS,
  ClientMerchandiseControl or cashregistersystem, improvised identity providers,
  and private push unless bounded polling is first proven insufficient.

## Files potentially involved

- Mini public runtime/build configuration, tests and governance.
- Owning Admin/Android/iOS repositories only for a reproduced in-scope defect.
- Restricted operator/evidence files outside repositories; no secrets or full identifiers.

## Acceptance criteria

- [x] FAST BASELINE confirms the four heads, no open PRs, green main CI, migration head, Worker version/status/flags, devices and private-untracked state without repeating activation work.
- [x] Restricted 0700/0600 operator packet exists with the exact value-free public template and redaction/portal instructions.
- [ ] Official Website/Android/iOS/Mini inventory and public configuration are supplied by the operator without secrets.
- [ ] A real OIDC/bridge path validates issuer/discovery/JWKS/client/callback semantics before provider configuration; otherwise Auth remains external.
- [ ] Flags use a test allowlist and one surface at a time; general public flags return OFF after each test.
- [ ] Every claimed Auth surface proves live positive/negative flows, canonical identity, linking, revocation and shop isolation.
- [ ] Official Mini DevTools/runtime visual QA and essential catalog/image/history/sales/sync E2E are factual.
- [ ] Polling, payload, request-count, cache and outbox measurements meet bounded targets or a scoped fix is integrated.
- [ ] Required fixes use normal commit/PR/CI/merge; production/publication and out-of-scope repositories remain unchanged.
- [ ] The mandatory 50-field report uses only strict PASS/PARTIAL/BLOCKED/NOT_RUN classifications and is not self-approved DONE.

## Checks and evidence

| Check | Command/method | Result | Duration | Evidence |
|---|---|---|---|---|
| Four-repository FAST BASELINE | Git/GitHub, Supabase connector, Wrangler, public smoke, device/private-path inventory | `FAST_BASELINE_PASS_WITH_NOTES` | Recorded | WMP-047 and append-only worklog |
| Operator registration packet | restricted local files, mode/template/JSON validation | `PASS` | Recorded | `/Users/minxiang/Projects/_codex-private/wechat-007/` |
| Provider and live Auth | official public config plus staged runtime | `NOT_RUN — OPERATOR_ACTION_REQUIRED` | — | WMP-048/049 |
| Mini runtime and essential E2E | official DevTools plus shared staging | `NOT_RUN — APPID/PROVIDER_REQUIRED` | — | WMP-050/051 |
| Independent Mini corrections | public build substitution, Sales polling, sync failure backoff and cache-miss regression | `PASS — verify 63/63; TARGETED_SECURITY_NO_FINDINGS` | Recorded | WMP-050/052 |
| Performance/GitHub closeout | bounded live measurements and repository-native gates | `PARTIAL_PASS; LIVE_MEASUREMENT_PENDING` | Recorded | WMP-052 |

## Risks and remaining problems

All official AppIDs and OIDC bridge values are absent. The Admin `/auth/callback`
is a post-OAuth application redirect, not a proven WeChat portal callback.
DevTools is installed and running but Computer Use cannot read its UI. Source
inventory also found 3-second Home polling amplification, catalog delta N+1
detail loads and a sync payload-limit mismatch. The Sales automatic-refresh and
sync error-backoff gaps are fixed with regression tests; the remaining findings
require a bounded Admin contract change or live measurement before performance PASS.

## Execution notes and worklog links

See `docs/TASK_HISTORY.md`, `docs/AI_WORKLOG.md` and the private activation
ledger. The Mac is unlocked, but `open.weixin.qq.com` remains an operator-only
action under the Computer Use policy. One consolidated handoff is used.

## Review decision

`PENDING`

## Next step and handoff

Operator completes the value-only template and redacted portal screenshots,
then replies exactly `Configurazione pubblica compilata`. Independent source,
QA and performance inventory continues without enabling flags.
