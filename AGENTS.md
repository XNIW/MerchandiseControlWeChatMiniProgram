# MerchandiseControl WeChat Mini Program — Agent Guide

This repository contains the read-only WeChat Mini Program companion for MerchandiseControl. It is a separate product surface: it is not the Admin Web, Android, iOS, Win7POS, ClientMerchandiseControl, or a POS staff client.

## Initial scope

- Personal WeChat sign-in through the canonical WECHAT-001 identity contract.
- Authorized shop selection.
- Today's net sales summary and paginated sales list.
- Automatic refresh or a documented near-realtime fallback.
- Read-only access throughout.

Product editing, import/export, staff management, staff PIN or POS login, sales creation, refund/void, payments, platform administration, direct database writes, and client-side service-role access are out of scope.

## Architecture boundaries

- `merchandise-control-admin-web` owns the WeChat server boundary, the canonical Auth ADR, and all Supabase migrations.
- This repository never owns Supabase migrations.
- Supabase `auth.users` and the personal profile are the canonical MerchandiseControl identity.
- `shop_id` is the business-data boundary. The client may call only authorized, shop-scoped APIs/RPCs and must never receive indiscriminate POS-table access.
- Personal accounts and POS staff credentials are separate authentication systems.
- Source priority: Admin Web for contracts/backend/Supabase/governance; Android for functional behavior; iOS for mobile UX; official WeChat and Supabase documentation for platform behavior.

## Development rules

- Read this file, `CLAUDE.md`, `docs/MASTER_PLAN.md`, `docs/tasks/ACTIVE.md`, and the active task before changing files.
- Keep changes small and typed. Avoid unjustified `any`, invented data, large refactors, and dependencies without a recorded reason.
- Never present fixtures or a mock dashboard as live data.
- WeChat features remain OFF until external activation and live validation are complete.
- One writer per task/repository. Do not silently expand scope.

## Security invariants

- WeChat AppSecret and Mini Program `session_key` are server-only and never logged.
- OpenID is an external identifier, never a bearer token.
- Do not commit credentials, tokens, certificates, private DevTools configuration, or complete WeChat identifiers in evidence.
- Fail closed on identity conflict, callback confusion, replay, missing membership, suspended user/shop, or cross-shop access.
- Do not store long-lived tokens in unprotected client storage without an approved threat model.
- Never modify production from this repository.

## Workflow

`PLANNING → EXECUTION → REVIEW → DONE`

- ChatGPT/Claude plans and reviews; Codex executes/fixes; the user gives final approval.
- A writer may have only one application task in `EXECUTION`.
- `DONE` requires explicit user or designated-reviewer confirmation and no open P0/P1 issue. Codex never self-approves `DONE`.
- Use `BLOCKED_EXTERNAL` only for a precise external dependency; record owner, unblock procedure, and work that remains possible.
- Append factual events to `docs/TASK_HISTORY.md` and execution evidence to `docs/AI_WORKLOG.md`.

Required checks once the technical scaffold exists: `verify`, `typecheck`, `lint`, `test`, `build`, secret scan, `git diff --check`, and `git status --short`.

## Git rules

- Do not work directly on `main` after the authorized WMP-001 bootstrap.
- Do not commit or push without an explicit mandate.
- Never use `git reset --hard`, `git clean`, or stash changes that are not yours.
- Never delete or overwrite another contributor's work.
