# MerchandiseControl WeChat Mini Program

Status: **FOUNDATION / DEVELOPMENT / NOT PRODUCTION READY**

A native TypeScript WeChat Mini Program companion for MerchandiseControl, intended to provide personal WeChat sign-in and a read-only, shop-scoped view of daily sales.

## What it does

The planned MVP authenticates a personal account, lists only authorized shops, shows today's net sales and counts in the shop timezone/currency, and provides a paginated sales list with bounded automatic refresh.

It does not manage products or staff, import/export data, use POS staff credentials, create sales, issue refunds/voids, take payments, or administer platform roles.

## Ecosystem and architecture

- Admin Web owns the WeChat backend boundary, identity ADR, Supabase migrations, and read-only sales APIs/RPCs.
- Android and iOS remain independent personal-account clients of the same canonical Supabase identity.
- Supabase `auth.users` remains canonical; WeChat is an identity provider, not a role.
- Win7POS and the POS staff login are outside this project.
- The Mini Program is a read-only consumer. `shop_id` membership and server-side permissions govern every business-data read.

See [architecture](docs/architecture/README.md), [Master Plan](docs/MASTER_PLAN.md), and [security](SECURITY.md).

## Prerequisites and local setup

The technical scaffold has not yet been added in the bootstrap commit. Before application work, install a current official WeChat DevTools release and use the Node/TypeScript versions pinned by the future scaffold. Do not infer or invent an AppID.

Once WMP-002 adds verified scripts, this section will list the exact deterministic install, verify, test, and build commands. Until then, no build or live-login claim is made.

Environment variable names and feature flags are documented in [the environment matrix](docs/architecture/README.md#environment-and-activation). `.env.example` may be added only with value-free public/client configuration. AppSecret never belongs here.

## External activation state

No WeChat AppID/AppSecret, registered request domain, approved Mini Program, or live cross-platform identity evidence is present. The feature must remain OFF. Fixtures and contract tests do not constitute live validation.

## Repository layout

- `docs/tasks/` — active/planned/review/done ledgers and task template.
- `docs/architecture/` — consumer architecture and shared-contract references.
- `docs/security/` — scoped threat model and security evidence.
- `docs/testing/` — automated/live test matrix.
- `docs/runbooks/` — external activation, incident response, and feature disablement.
- `docs/decisions/` — local decisions only; the canonical WeChat Auth ADR remains in Admin Web.

## Contributing

Follow `AGENTS.md`, [CONTRIBUTING.md](CONTRIBUTING.md), and the `PLANNING → EXECUTION → REVIEW → DONE` process. Never commit secrets, claim live functionality from fixtures, or bypass the canonical backend.
