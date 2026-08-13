# Admin gateway consumer contract

Contract version: `supabase-custom-oidc-bridge-v1`. Owner: Admin Web.

## Authentication

`POST /api/auth/wechat/challenge` accepts `surface=mini_program`, `mode=login`, and a random installation UUID. It returns server-generated one-time state/nonce, a correlation UUID, and a 60–600 second TTL. `wx.login` then obtains a temporary code. `POST /api/auth/wechat/exchange` sends that code and the exact challenge fields. The Admin boundary alone performs code2Session/bridge exchange and the official Supabase custom OIDC ID-token grant.

The client never receives OpenID, UnionID, AppSecret, `session_key`, bridge credentials, signing keys, or service role. It rejects any handoff whose provider is not exactly `custom:wechat`. Its access bearer is memory-only and bounded; the returned refresh token is not persisted. Durable refresh remains intentionally unimplemented until a reviewed server rotation contract exists.

## Read-only sales

All reads send the supported Supabase bearer to Admin gateway routes:

- `GET /api/mini-program/v1/shops`
- `GET /api/mini-program/v1/sales/summary?shop_id=&date=`
- `GET /api/mini-program/v1/sales?shop_id=&from=&to=&limit=&before_at=&before_id=&status=&kind=&payment=&staff_id=&device_id=&sale_number=`
- `GET /api/mini-program/v1/sales/detail?shop_id=&sale_id=`
- `GET /api/mini-program/v1/sales/range?shop_id=&from=&to=`
- `GET /api/mini-program/v1/sales/filters?shop_id=&from=&to=`

The client supplies `shop_id`, but never treats it as authorization. The RPC verifies `auth.uid()`, active profile, active shop, active membership, and a personal read role on every call. Pages are keyset-paginated with maximum 100 rows and ranges are bounded to 365 days. Staff/device fields and filters require owner/manager membership. “Net revenue” is ledger revenue, not a bank or cash balance.

## Catalog, history and account

- `GET /api/mini-program/v1/account`
- `GET /api/mini-program/v1/catalog`
- `GET /api/mini-program/v1/catalog/detail`
- `GET /api/mini-program/v1/catalog/prices`
- `GET /api/mini-program/v1/categories`
- `GET /api/mini-program/v1/suppliers`
- `GET /api/mini-program/v1/history`
- `POST /api/mini-program/v1/product-images/read-urls`

Catalog/entity pages are limited to 100 and use stable keyset cursors. The image resolver accepts at most 16 version references, checks bearer/profile/shop/membership/permission server-side, and returns short-lived signed variants from the existing private bucket. Catalog RPCs expose version identifiers, never raw Storage paths.

Errors are sanitized typed codes. `membership_missing`, suspended/revoked session, cross-shop denial, identity conflict, malformed/replayed state, and provider confusion fail closed.

## Controlled catalog mutations (WECHAT-003)

`POST /api/mini-program/v1/catalog/mutations` is the only supported Mini catalog-mutation adapter. It accepts a closed operation union, a bounded typed payload, the real `updated_at` concurrency token for every non-create operation, and UUID `Idempotency-Key`/`X-Correlation-ID` headers. The Admin boundary verifies the bearer with its isolated publishable Auth client, derives the canonical personal profile server-side, and invokes the service-role-only `wechat_catalog_mutate_v1` orchestration RPC without forwarding the caller bearer to that RPC. The Mini Program never intentionally calls Supabase mutation sinks directly.

This is not yet a globally enforced sole-write property: an ordinary WeChat Supabase bearer can still reach legacy/table same-shop catalog write sinks outside this controlled lane, bypassing its feature flag and policy envelope. All Mini catalog-write flags therefore remain OFF until the Admin/Supabase owners coordinate RLS, grants or scoped-token claims so those alternate sinks are unreachable to the WeChat bearer.

Supported families are product create/update/archive/restore/current-price update, category create/update/archive/restore with transactional replacement, and supplier equivalents. Product relation changes travel through product update. Same key plus same canonical request replays the stored result; the same key with a different request is a conflict. Viewer, platform-admin-without-membership, inactive profile/shop/member, stale revision and cross-shop targets fail closed.

Explicit capabilities are returned by the authorized-shops projection for UI visibility only. Every endpoint independently rechecks session, profile, shop, membership, permission, target scope, state, input and revision.

Private product images use the existing versioned contract through Mini-specific thin routes:

- `POST /api/mini-program/v1/product-images/intent`
- `POST /api/mini-program/v1/product-images/finalize`
- `POST /api/mini-program/v1/product-images/remove`
- `POST /api/mini-program/v1/product-images/read-urls`

The shared server service remains authoritative for path construction, signed upload/read capability, JPEG metadata/hash/size/dimension verification, activation, expected-version removal and cleanup. Mini image routes require a real personal shop membership; platform-admin status alone grants nothing.

Catalog History is a safe Admin audit projection with bounded keyset pagination and allowlisted semantic event types. Canonical statement triggers remain the only catalog/price sync-event lane; there is no WeChat-specific sync channel.

## WECHAT-004 opaque session and incremental sync contract

The exchange response now imports a short opaque Mini session, not a general
Supabase bearer. The server stores only its hash and binds actor, surface,
installation/device, expiry and authentication generation. All Mini requests
send that opaque value to fixed Admin routes. Logout/revocation invalidates it;
the client never receives a refresh token, service role or direct database
credential.

Controlled BFF routes resolve the session, derive the canonical actor server-side
and call only explicit service-role wrappers. The opaque token cannot authorize
PostgREST table access or legacy catalog RPCs, so those intentional Android/iOS/
Admin lanes are not a Mini bypass.

Incremental convergence is exposed as a bounded checkpoint/delta contract over
canonical `sync_events`. Responses contain authorized `shop_id`, current
watermark, epoch/generation and minimal entity/type/operation/sequence/tombstone
references. Entity payloads are fetched through existing bounded authoritative
reads. Gaps, retention misses or epoch changes never advance the fence silently;
they require reconcile or controlled bootstrap.

Mutation outbox records contain operation/idempotency identity, canonical-user
fingerprint, shop/entity/operation, minimum normalized payload, CAS base,
timestamps, attempts/backoff, dependencies and state. They contain no bearer,
provider code, secret, session key or signed URL. Image records persist only a
bounded official local file path plus hash/metadata and request a fresh intent at
flush time.
