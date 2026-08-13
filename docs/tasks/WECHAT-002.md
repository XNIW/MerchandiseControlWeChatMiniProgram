# WECHAT-002 — Complete WeChat authentication and Mini Program functional parity

- Status: `REVIEW / CHANGES_REQUIRED`
- Parent: corrective successor to `WECHAT-001`
- Owner boundaries: Admin Web owns Auth, migrations, RPCs and APIs; the Mini Program is a shop-scoped read-only consumer.
- Current classification: `CHANGES_REQUIRED — FOUNDATION_IMPLEMENTED, LIVE AUTH AND MINI PROGRAM PARITY INCOMPLETE`

## Objective

Close the documented WECHAT-001 gaps without rewriting its history: verify the identity architecture against current primary sources, replace platform placeholders only when an official integration can be proven, and deliver the applicable core read-only Mini Program surfaces.

## Non-goals

Mutating sales, refund/void, staff/PIN, platform administration, direct Supabase table writes, service-role credentials in any client, publication, production deployment, commit, push, pull request, or merge.

## Child sequence

`WMP-011` → `WMP-012` → `WMP-013` → `WMP-014` → `WMP-015` → `WMP-016`.

## Completion gate

No child task may be marked `DONE` by Codex. Live authentication requires real Admin, Android, iOS and Mini Program E2E evidence. Read parity requires the capability matrix and green contract, security, performance and client tests.

Review outcome: read-only surfaces and targeted contracts are implemented, but the external OIDC bridge, iOS OpenSDK adapter, four-surface live E2E, private live invalidation, DevTools visual QA and real-device checks are absent. The global legacy pgTAP run also crashes local PostgreSQL in `cross_platform_sync_recovery_contract.sql`; WECHAT-targeted and image suites pass independently.
