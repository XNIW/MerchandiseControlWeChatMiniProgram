# WECHAT-009 — Auth prerequisites, bounded performance and staging acceptance

- Status: `REVIEW / EXTERNAL_ACTIVATION_REQUIRED`
- Owner: Codex, sole Mini writer; operator owns external registrations/bridge decision
- Opened: 2026-09-06
- Branch: `codex/wechat-009-mini-performance`
- Mandate: user authorizes bounded fixes, gates, commit/push/PR/normal merge and staging only.

## Scope and acceptance

Resume WECHAT-008 factual private evidence; preserve prior review history. Inventory
public AppIDs, portal approvals, native artifacts, bridge and provider separately.
Research maintained four-surface bridge candidates and prepare one operator packet.
Fix Home duplicate work, catalog delta N+1/truncation, and sync byte/pagination
mismatch, with deterministic failure/retry/account/shop tests. Complete required
Mini/Admin gates and normal GitHub integration. Activate only with verified real
prerequisites; general flags OFF. No production, publication, POS writes, Excel,
native source changes or new provider/infrastructure purchase.

## Evidence and handoff

Evidence is consolidated in `docs/testing/WECHAT-009-REPORT.md`.
Live Auth and essential staging acceptance require actual provider/apps/runtime;
mock/harness results never satisfy those gates. No self-approved DONE.

## Gate risultati

Mini verify Node26.7.0 PASS74/74; Admin verify/foundation996 PASS+2skip,
focused9/9 e UI48/48 PASS. Diff security review manuale senza nuovi P0/P1.
Mini PR8 → `2e1c3fce162f2527aaf2f58dc5770e76e712e531`;
Admin PR101 → `ffafd55e4f10044c0724596871d39117122160f1`;
merge normali dopo CI verde. Admin CI pgTAP2627 PASS, Cloudflare build/smoke PASS.
Closeout documentale separato; nessuna attivazione, migration staging, deploy o DONE.
