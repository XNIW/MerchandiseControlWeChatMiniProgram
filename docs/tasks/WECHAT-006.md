# WECHAT-006 — Shared public staging activation and live closeout

- Status: `EXECUTION`
- Classification: `SHARED_PUBLIC_STAGING_AUTHORIZED; PRODUCTION_AND_PUBLICATION_EXCLUDED`
- Parent/epic: successor to `WECHAT-005`; prior evidence and classifications remain historical
- Owner: Codex coordinates; Admin owns schema/server; each client owns its adapter; the authorized operator owns legal/2FA actions
- Opened / updated: 2026-08-13 / 2026-08-13
- Commit / PR, if any: branch `codex/wechat-006-mini-closeout` from current `origin/main`

## Context and objective

Activate the completed WECHAT foundations on the user-authorized shared public
staging target, validate every technically reachable surface with factual live
evidence, integrate necessary fixes normally, and leave general public flags
OFF or test-allowlisted. The Supabase dashboard badge `main / Production` does
not change the user-authorized business classification `SHARED_PUBLIC_STAGING`.

## Dependencies and files to read

- The WECHAT-006 mandate, repository guides, WECHAT-004/005 and WMP-032…038.
- Current `origin/main` in Admin, Mini, Android and iOS.
- Current official Supabase, WeChat, Apple and Cloudflare documentation.

## In scope

- WMP-039…WMP-046; Admin writer handoff; verified manual backup; Supabase
  migrations; staging Worker deploy; official provider/app/client activation;
  progressive flags; live Auth/catalog/image/sync/sales/performance testing;
  targeted security review; normal commit/PR/CI/merge and staging closeout.

## Out of scope

- Any different or real production environment; Mini review/publication or app
  stores; payments/contracts/legal statements/2FA bypass; improvised identity
  providers or fake identities; staff/PIN/sales writes from clients; Excel
  import; source edits in ClientMerchandiseControl, Win7POS or
  cashregistersystem; general Deep Security Scan.

## Files potentially involved

- Mini governance/runtime configuration and bounded defects proven by tests.
- Owning Admin/iOS/Android repositories only through isolated branches.
- Redacted evidence outside repositories; no credentials or private identifiers.

## Acceptance criteria

- [x] Shared staging identity, writer handoff and verified restorable backup are recorded.
- [x] Required migrations and Admin Worker are current with schema/server gates green.
- [ ] Official provider/apps/client adapters are completed as far as real portal credentials allow.
- [ ] Progressive live Auth and cross-platform isolation results are factual, never simulated.
- [ ] Catalog/image/sync/sales/performance matrices are executed or carry exact external prerequisites.
- [ ] Every fix is merged normally with green gates; no P0/P1 remains in enabled staging scope.
- [x] General public flags remain OFF or narrowly test-allowlisted; no other environment changes.
- [ ] WMP-039…046 and the mandatory 54-field closeout contain exact PASS/FAIL/BLOCKED/NOT_RUN results.

## Checks and evidence

| Check | Command/method | Result | Duration | Evidence |
|---|---|---|---|---|
| Four-repository baseline and Admin writer audit | Git/GitHub/process/worktree inspection | `PASS_WITH_NOTES` | Recorded | external WECHAT-006 evidence bundle |
| Shared staging target/backup | WMP-039 | `PASS / REVIEW` | Recorded | verified restricted restorable backup |
| Schema/Admin Worker | WMP-040 | `PASS / REVIEW` | Recorded | seven migrations, pgTAP 260/260, Admin PR #86/merge, Worker smoke |
| Provider/portal | WMP-041 | `PHYSICAL_ACTION_REQUIRED` | Recorded | Mac locked; portal inventory/config not claimed |
| Native/Mini device-free | WMP-042/043 | `PASS_WITH_EXTERNAL_PREREQUISITES` | Recorded | iOS/Android/Mini gates green; iOS PR #7 + closeout #8 merged normally; DevTools/live blocked |

## Risks and remaining problems

Provider/app registration, QR/2FA, company verification and physical devices
may remain external. Those gates do not block independent backup, schema,
deployment, build or device-free test work.

## Execution notes and worklog links

See `docs/TASK_HISTORY.md`, `docs/AI_WORKLOG.md` and the external evidence path
recorded there. Secrets, complete WeChat identifiers and PII are excluded.

## Mandatory 54-field closeout — current factual state

1. Global classification: `PARTIAL / EXTERNAL_WECHAT_REGISTRATION_ACTION_REQUIRED`; schema and Admin deploy pass, live Auth/sync/sales do not.
2. Supabase target: `merchandisecontrol-dev`, ref `jpgoimipbothfgkokyvm`, region `sa-east-1` — confirmed.
3. Portal badge: `main / Production` did not block the explicitly authorized `SHARED_PUBLIC_STAGING` target.
4. TASK-150 handoff: preserved and paused as `PAUSED_FOR_WECHAT_006_STAGING_HANDOFF`; no live writer was found.
5. Manual backup: `PASS`, restricted local bundle outside repositories.
6. Manifest/restore: 226 files covered by SHA-256; pre-activation schema, data and 26 Storage objects restore/hash-validated.
7. Migration baseline: remote `130`, canonical current head `137`; exact delta `7`.
8. Applied migrations: seven checksum-pinned WECHAT migrations in canonical order through guarded run `31759004095`.
9. Repair migration: `NONE_REQUIRED`.
10. Final migration head: `20260813160233_wechat_004_identity_link_saga`; remote count `137`.
11. Worker versions: initial/rollback `83ffe585-8cfe-4c64-bccc-47a482b2397d`; final `f797c513-f617-4941-acf1-6c2062b40fbd`.
12. Staging URL: `https://merchandise-control-admin-web-staging.merchandise-control-admin-web.workers.dev`.
13. Deployed commit: Admin normal merge `728f413d740913145be550e1ffdbf4091dba3676`.
14. Provider/bridge: canonical Admin gateway retained; external provider/bridge `NOT_CONFIGURED`, with no improvised IdP or JWT.
15. WeChat applications: `NOT_INVENTORIED_LIVE`; official portal is blocked by the locked Mac/login prerequisites.
16. Public AppIDs: `NOT_CONFIGURED`; no identifiers were invented.
17. Domains/callbacks: public staging URL is known; WeChat portal domain/callback registration is `NOT_CONFIGURED`.
18. Android: package `com.example.merchandisecontrolsplitview`; AppID/fingerprint/device live proof `NOT_AVAILABLE`; SDK 6.8.34 retained and device-free gates pass.
19. iOS: bundle `com.niwcyber.iOSMerchandiseControl`; official provider merged; AppID/Universal Link/Associated Domains/device live proof `NOT_AVAILABLE`.
20. Mini: AppID/domains/test member `NOT_AVAILABLE`; DevTools compile/preview `BLOCKED_EXTERNAL — UNLOCK_MAC`; automated build passes.
21. Flags: Web, Android, iOS and Mini WeChat activation surfaces all `OFF`.
22. Auth Web: `NOT_RUN`; fail-closed status passes and account route returns `provider_not_configured`.
23. Auth Android: `NOT_RUN`; exact AppID/fingerprint and physical WeChat device required.
24. Auth iOS: `NOT_RUN`; exact AppID/Universal Link/entitlements and physical WeChat device required.
25. Auth Mini: `NOT_RUN`; AppID/test membership/DevTools login required.
26. Same identity: `NOT_RUN` because no official WeChat identity is activated.
27. Linking: automated saga/contract tests `PASS`; live linking `NOT_RUN`.
28. Revocation: database/session automated gates `PASS`; live client revocation `NOT_RUN`.
29. Shop isolation: remote pgTAP/invariants `PASS`; live four-client identity matrix `NOT_RUN`.
30. Catalog sync: automated contracts `PASS`; shared-staging bidirectional client E2E `NOT_RUN`.
31. Outbox: durable automated tests `PASS`; offline live runtime matrix `NOT_RUN`.
32. Watermark: schema/contract tests `PASS`; live delta measurement `NOT_RUN`.
33. Reconcile: schema/contract tests `PASS`; live gap/epoch recovery `NOT_RUN`.
34. Conflict: deterministic automated coverage `PASS`; concurrent live clients `NOT_RUN`.
35. Images/Storage: backup inventory/hash validation and access contracts `PASS`; live upload/replace/remove/expiry matrix `NOT_RUN`.
36. Products/categories/suppliers/prices/History: schema and automated gates `PASS`; authorized cross-client live matrix `NOT_RUN`.
37. Sales/revenue: read-only server regressions `PASS`; marked live cash/card/refund/void/net fixture matrix `NOT_RUN`.
38. Latency: live authenticated staging latency `NOT_MEASURED`.
39. Polling load: live request/payload/cache/outbox load `NOT_MEASURED`; no realtime claim.
40. Visual QA: iOS flag-OFF Simulator launch/screenshot `PASS`; Mini DevTools matrix `BLOCKED_EXTERNAL`.
41. Security review: targeted WECHAT scope `PASS_WITH_NOTES`, no P0/P1 in enabled (OFF) scope; schema-advisor notes nonblocking; no deep scan claim.
42. Repository tests: Mini verify 62/62; Admin verify/foundation 969/969 plus remote pgTAP 260/260; Android 18 focused + lint/assemble; iOS 12 focused, 1,336 + 4 UI, Release/Analyze/secret/launch and CI pass.
43. Fixes: Admin schema/runtime/guarded deployment, official iOS provider, Google callback source-contract repair and governance invariant update; no Android source fix required.
44. Commits: Admin feature `408fb540` and closeout `31dd01b4`/`bc0d9591`; iOS feature `2a632d27` + handoff `d91cb29a`, closeout `60d7f3d8`.
45. PRs: Admin #86/#87 and iOS #7/#8 merged normally; Mini closeout is the current branch integration.
46. Merges: Admin `728f413d740913145be550e1ffdbf4091dba3676` / `13d07e00796f52e9f50850b7b08ebcf1fff0e996`; iOS `6571f4b661c4b815cfad4f6ad9139071b978f76d` / `045d0597e13f6d663547a166f74b4e5f498572ea`.
47. Published heads before Mini closeout: Admin `13d07e00796f52e9f50850b7b08ebcf1fff0e996`; Android `0406264c7299766b05419f306c320032e427ca2b`; iOS `045d0597e13f6d663547a166f74b4e5f498572ea`; Mini baseline `2eca2517449f06b4215b7ebb5b5e0543ab820eea`.
48. Fixtures created: `NONE`; official WeChat identities and dedicated test shop were unavailable.
49. Fixture cleanup/retention: `NOT_APPLICABLE`; no WECHAT-006 staging fixture rows were created.
50. Out-of-scope repositories: Win7POS, ClientMerchandiseControl and cashregistersystem source `NOT_MODIFIED`; pre-existing dirty checkouts preserved.
51. Physical actions executed: `NONE`; Mac unlock/QR/2FA/device actions were not bypassed.
52. Remaining external actions: unlock Mac; portal/QR login; inventory/approve Website, Android, iOS and Mini AppIDs/domains/test membership; provide physical Android/iOS WeChat devices; confirm persistent portal/secret changes at action time.
53. Environment boundary: no environment different from the exact authorized shared staging was modified; no production deploy or publication occurred.
54. Single next step: `PHYSICAL_ACTION_REQUIRED — UNLOCK_MAC` so Codex can perform the read-only official portal and DevTools inventory.

## Review decision

`PENDING`

## Next step and handoff

User unlocks the Mac; continue WMP-041 with read-only portal inventory, then ask
at-action confirmation before any persistent provider/application/domain/secret
change. `DONE` remains reserved for explicit user/designated-reviewer approval.
