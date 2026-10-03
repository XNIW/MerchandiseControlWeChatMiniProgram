# MerchandiseControl WeChat Mini Program

> Stato operativo corrente: [report canonico](docs/testing/WECHAT-010-REPORT.md) e [matrice di completamento](docs/testing/WECHAT-010-COMPLETION-MATRIX.md). WECHAT-010 è in EXECUTION. Login e catalogo Mini sono attivi esclusivamente per l'account/shop TEST autorizzato; enrollment e altre superfici WeChat restano OFF. Le prove locali, DevTools, native e su telefono sono distinte. Nessun DONE o rilascio pubblico attestato.

Status: **FOUNDATION / DEVELOPMENT / NOT PRODUCTION READY**

A native TypeScript WeChat Mini Program companion for MerchandiseControl, intended to provide personal WeChat sign-in, a read-only shop-scoped view of sales/POS data, and controlled catalog management for authorized personal shop members.

## What it does

The WECHAT-003 review build extends the retained WECHAT-001/002 foundation. It authenticates a personal account through the canonical external bridge contract, lists only authorized shops, provides today/history sales and detail, and exposes bounded catalog/image/category/supplier/price/history/account views. Authorized owner/manager capabilities may create, edit, archive or restore catalog entities, update canonical current prices, and manage private versioned product images only through Admin-owned APIs. It uses adaptive 3–30 second automatic polling while visible; this is explicitly not Realtime.

It does not mutate staff/POS data, import/export data, scan barcodes with the camera, use POS staff credentials, create sales, issue refunds/voids, take payments, or administer platform roles. Excel import is deferred by its architecture decision and has no fake button.

## Ecosystem and architecture

- Admin Web owns the WeChat backend boundary, identity and mutation ADRs, Supabase migrations, permissions, audit/outbox/sync, private image Storage and every business-data API/RPC.
- Android and iOS remain independent personal-account clients of the same canonical Supabase identity.

At the 2026-10-03 03:20 UTC checkpoint, Mini PR47 application source `f68afed9` and runtime TEST v11 retain 219 passing checks. Admin fractional-stock PR129 is integrated; TEST registry155/Worker221 and open backend PR128/130 are tracked separately. Android PR14/main `04f6fe26` has successful head and post-merge CI: 1110 tests (1103 pass, 7 known skips), five executed Compose passes and a verified TEST artifact. iOS PR14/main `8dfbf9a0` has successful post-merge CI: 1464 tests (1428 pass, 36 known skips). Fresh authenticated recovery, automatic convergence across all four clients, remaining performance series and physical-phone validation are still open. Interrupted runner observations are preserved without being classified as app passes. See the canonical report and current 39-case matrix.

Current completion evidence is tracked by WECHAT-010. Authentic Mini pairing, sign-in and catalog operations have been verified in TEST; native recovery and four-client convergence remain under validation. Historical foundation gaps are not a statement of the current implementation. See [the completion matrix](docs/testing/WECHAT-010-COMPLETION-MATRIX.md) for the remaining runtime cases.
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

The checked-in configuration keeps WeChat features OFF. The separately verified staging configuration enables Mini sign-in and catalog access only for the authorized TEST account and shop; authentic pairing, sign-in and scoped catalog results are recorded in the completion matrix. Protected credentials and private DevTools configuration are excluded from this repository. Enrollment and other WeChat surfaces remain OFF. Native recovery, four-client convergence and physical-phone validation are still open; no public release or production readiness is asserted.

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
