# MerchandiseControl WeChat Mini Program

Status: **FOUNDATION / DEVELOPMENT / NOT PRODUCTION READY**

A native TypeScript WeChat Mini Program companion for MerchandiseControl, intended to provide personal WeChat sign-in, a read-only shop-scoped view of sales/POS data, and controlled catalog management for authorized personal shop members.

## What it does

The WECHAT-003 review build extends the retained WECHAT-001/002 foundation. It authenticates a personal account through the canonical external bridge contract, lists only authorized shops, provides today/history sales and detail, and exposes bounded catalog/image/category/supplier/price/history/account views. Authorized owner/manager capabilities may create, edit, archive or restore catalog entities, update canonical current prices, and manage private versioned product images only through Admin-owned APIs. It uses adaptive 3–30 second automatic polling while visible; this is explicitly not Realtime.

It does not mutate staff/POS data, import/export data, scan barcodes with the camera, use POS staff credentials, create sales, issue refunds/voids, take payments, or administer platform roles. Excel import is deferred by its architecture decision and has no fake button.

## Ecosystem and architecture

- Admin Web owns the WeChat backend boundary, identity and mutation ADRs, Supabase migrations, permissions, audit/outbox/sync, private image Storage and every business-data API/RPC.
- Android and iOS remain independent personal-account clients of the same canonical Supabase identity.

The corrective status is `CHANGES_REQUIRED`: the OIDC bridge and iOS provider adapter are missing, live four-surface authentication has not run, private sales invalidation is not implemented, and WeChat DevTools visual/device evidence is unavailable. See [the capability matrix](docs/PARITY_MATRIX.md).
- Supabase `auth.users` remains canonical; WeChat is an identity provider, not a role.
- Win7POS and the POS staff login are outside this project.
- The Mini Program is a thin consumer. `shop_id` membership and server-side permissions govern every read and mutation; the client never writes Supabase tables directly or decides authorization.

See [architecture](docs/architecture/README.md), [Master Plan](docs/MASTER_PLAN.md), and [security](SECURITY.md).

## Prerequisites and local setup

Use Node `26.7.0` (`.nvmrc`) and npm 11. Install an official current WeChat DevTools release for manual builds only after an authorized AppID exists. Do not infer or invent an AppID.

```sh
npm ci
npm run verify
```

Individual checks are `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run check:secrets`, and `npm run check:governance`. `dist/` is generated and ignored. Open the repository in DevTools, which reads `project.config.json` and keeps private settings in ignored `project.private.config.json`.

Environment variable names and feature flags are documented in [the environment matrix](docs/architecture/ENVIRONMENT_MATRIX.md). `.env.example` is value-free public/client configuration. AppSecret never belongs here.

## External activation state

No WeChat AppID/AppSecret, registered request domain, approved Mini Program, or live cross-platform identity evidence is present. The checked-in feature is OFF and the UI fails closed. Fixtures and contract tests do not constitute live validation.

## Repository layout

- `docs/tasks/` — active/planned/review/done ledgers and task template.
- `docs/architecture/` — consumer architecture and shared-contract references.
- `docs/security/` — scoped threat model and security evidence.
- `docs/testing/` — automated/live test matrix.
- `docs/runbooks/` — external activation, incident response, and feature disablement.
- `docs/decisions/` — local decisions only; the canonical WeChat Auth ADR remains in Admin Web.
- `miniprogram/` — native TypeScript application source.
- `tests/` — deterministic contract/adapter tests.
- `scripts/` — build, governance and secret checks.

## Contributing

Follow `AGENTS.md`, [CONTRIBUTING.md](CONTRIBUTING.md), and the `PLANNING → EXECUTION → REVIEW → DONE` process. Never commit secrets, claim live functionality from fixtures, or bypass the canonical backend.
