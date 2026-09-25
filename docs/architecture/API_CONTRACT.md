# Admin gateway consumer contract

## 2026-09-25 compatible functional read delta

Mini numbers are canonical JSON numbers, never localized strings. New CLP edits use whole integers; quantity edits use comma decimals (max3) and dotted grouping. Existing canonical fractional prices/stock remain unchanged if untouched; Admin precision is not reduced.

Categories/suppliers keep limit≤100 and keyset `after_name` + `after_id`. Optional `id` requests the exact active relation inside the authorized `shop_id`; the response remains the same array DTO. Current product association ID/name is retained outside loaded pages.

Catalog History accepts `from_date` / `to_date` calendar dates, converted by the server using the shop's catalog timezone. `to_date` includes the full day through next local midnight minus1µs. Existing instant parameters remain compatible; mixing dates/instants, impossible dates, reversed/ranges>366days are rejected. Mini uses calendar dates. Read denial JSON is mapped to typed errors for missing membership, shop suspension, permission denial; own valid session resolution distinguishes account suspension without disclosing it to an invalid token/device.

Product Save persists the entire ordered plan before dispatch and chains each expected revision from the prior actual receipt. This is recoverable orchestration, not atomic visibility across separate operations. Retry identity/payload are immutable; explicit discard cancels all remaining phases. Completion requires the last-phase receipt, never merely an empty journal.


Contract version: `wechat-mini-code2session-v1`. Owner: Admin Web.

## Current authentication

The Mini uses the direct Tencent code2Session protocol through the Admin boundary. Personal enrollment binds an independently verified Admin identity to two authentic Mini proofs and personal consents; it never creates a canonical identity from a client-authored identifier. Enrollment and business login have separate gates. A distinct business login exchanges a fresh `wx.login` proof for a short opaque Mini session.

The server alone receives AppSecret and `session_key`. The client receives neither a general Supabase bearer nor a refresh token. Its opaque session stays in memory and is bound server-side to the canonical personal profile, installation, expiry and authentication generation. Server resolution and each shop-scoped call recheck authorization. OneID is not a dependency of this protocol.

The former `supabase-custom-oidc-bridge-v1` Mini flow is historical (WECHAT-001); its provider handoff and refresh-token descriptions do not apply to the current direct Mini contract. Other product surfaces retain their own authentication contracts.

## Read-only sales

All reads send the opaque Mini session to fixed Admin gateway routes:

- `GET /api/mini-program/v1/shops`
- `GET /api/mini-program/v1/sales/summary?shop_id=&date=`
- `GET /api/mini-program/v1/sales?shop_id=&from=&to=&limit=&before_at=&before_id=&status=&kind=&payment=&staff_id=&device_id=&sale_number=`
- `GET /api/mini-program/v1/sales/detail?shop_id=&sale_id=`
- `GET /api/mini-program/v1/sales/range?shop_id=&from=&to=`
- `GET /api/mini-program/v1/sales/filters?shop_id=&from=&to=`

The client supplies `shop_id`, but never treats it as authorization. The service-only wrapper derives the actor from the resolved Mini session and verifies active profile, active shop, active membership, and a personal read role on every call. Pages are keyset-paginated with maximum 100 rows and ranges are bounded to 365 days. Staff/device fields and filters require owner/manager membership. “Net revenue” is ledger revenue, not a bank or cash balance.

## Catalog, history and account

- `GET /api/mini-program/v1/account`
- `GET /api/mini-program/v1/catalog`
- `GET /api/mini-program/v1/catalog/detail`
- `GET /api/mini-program/v1/catalog/prices`
- `GET /api/mini-program/v1/categories`
- `GET /api/mini-program/v1/suppliers`
- `GET /api/mini-program/v1/history`
- `POST /api/mini-program/v1/product-images/read-urls`

Catalog/entity pages are limited to 100 and use stable keyset cursors. The image resolver accepts at most 16 version references, checks opaque session/profile/shop/membership/permission server-side, and returns short-lived signed variants from the existing private bucket. Catalog RPCs expose version identifiers, never raw Storage paths.

Errors are sanitized typed codes. `membership_missing`, suspended/revoked session, cross-shop denial, identity conflict, malformed/replayed state, and provider confusion fail closed.

## Controlled catalog mutations (WECHAT-003)

`POST /api/mini-program/v1/catalog/mutations` is the only supported Mini catalog-mutation adapter. It accepts a closed operation union, a bounded typed payload, the real `updated_at` concurrency token for every non-create operation, and UUID `Idempotency-Key`/`X-Correlation-ID` headers. The Admin boundary resolves the opaque session, derives the canonical personal profile server-side, and invokes only the service-role catalog wrapper and `wechat_catalog_mutate_v1` orchestration RPC. No caller bearer is forwarded to a database mutation sink. The Mini Program never intentionally calls Supabase mutation sinks directly.

Historical WECHAT-003 review identified a bypass through general Supabase bearers. WECHAT-004 replaced the Mini bearer with an opaque session and fixed service-only wrappers; that historical finding is not the current activation gate. Flags remain OFF until the applicable external activation and authentic validation steps pass.

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
