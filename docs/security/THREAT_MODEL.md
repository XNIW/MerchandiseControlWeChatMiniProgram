# WECHAT-003 Mini Program threat model

| Threat | Control/evidence | Activation status |
|---|---|---|
| Code interception/replay | Five-minute `wx.login` code; server one-time challenge ledger, locked rate admission and replay-safe exchange | Automated PASS; live pending |
| CSRF/state/surface confusion | Server-generated state+nonce bound to correlation, device, IP, mode and `mini_program`; exact provider check | Automated PASS; live pending |
| Identity takeover/collision | Canonical `auth.users`; OIDC issuer/JWKS/audience/nonce verification; UnionID only when verified; explicit link otherwise; no nickname/email merge | Bridge/credentials pending |
| Token/secret/log leakage | No AppSecret/service role/session_key/OpenID in client; no token logging; access bearer in memory only; secret scan | Automated PASS |
| Compromised device | Short bounded in-memory bearer; no refresh persistence; local logout; server membership checks each read | Residual device risk documented |
| Cross-shop disclosure | Admin RPC owns authorization; client pages bounded; pgTAP denies shop B, disabled profile/member/shop, anon | Automated PASS |
| API abuse/enumeration | Streaming 4 KiB auth bodies, bounded upstream bodies, validation, locked per-IP/device challenge rate admission, trusted-proxy opt-in, 8 s timeouts and sanitized errors | Automated PASS; edge/WAF staging review pending |
| SSRF/open redirect | Exact HTTPS bridge host allowlist; redirects disabled; client accepts HTTPS origin and fixed API paths | Automated/source review PASS |
| Supply chain | Three pinned dev dependencies, lockfile, no application runtime package | Automated audit PASS |
| Realtime topic guessing | No Realtime/WebSocket implementation; adaptive bounded 3–30 second polling | Not applicable to the temporary fallback; mandatory review before any channel is added |
| Excessive audit PII | Hashes and non-sensitive correlation IDs; no complete WeChat identifiers or tokens | Source review PASS |
| Catalog mutation abuse / viewer write | Closed operation schemas, 16 KiB body, gateway-verified bearer, service-role-only RPC, actor+shop rate limit, explicit server capability and owner/manager recheck | Automated scoped database and route evidence PASS |
| Alternate catalog-write sink bypass | An ordinary WeChat Supabase bearer can still reach legacy/table same-shop catalog sinks without passing the controlled adapter, feature flag or mutation-policy envelope | **MEDIUM residual**; all write flags OFF until coordinated RLS/grant/token scoping closes the bypass |
| Product IDOR / cross-shop mutation | Server-derived actor; target row locked and selected inside the authorized shop scope; client shop/role is never trusted | Cross-shop/permission pgTAP PASS |
| Stale-write overwrite | Real `updated_at` CAS for product/category/supplier/price lifecycle operations; stale writes have no domain side effect | Concurrency evidence PASS |
| Duplicate barcode/name race | Database active-row uniqueness plus transactional error mapping; barcode follows shared strict text policy | Automated boundary/convergence PASS |
| Category/supplier replacement race | Source/replacement and linked product rows mutate in one database transaction; invalid/self/cross-shop replacements fail closed | Atomic replacement/rollback pgTAP PASS; high-fanout optimization remains |
| Price/history divergence | Dedicated numeric operation updates current price and appends immutable history in one transaction; scale 3 and bounded value | Catalog pgTAP and convergence PASS |
| Idempotency-key reuse/double submit | Durable actor+shop receipt keyed by UUID and canonical request hash; exact replay returns stored response, mismatch is rejected | Replay/mismatch/concurrency evidence PASS |
| Privilege confusion / platform-admin bypass | Mini catalog and image boundaries require active personal membership; platform-admin status alone confers no shop rights | Route and pgTAP evidence PASS for the controlled lane |
| Image path manipulation / IDOR | Server constructs and validates canonical versioned private paths; Mini never chooses a path; expected version required on removal | Existing image suites plus Mini boundary tests pass |
| Malicious/oversized image | Client preflight plus server JPEG MIME/magic/hash/byte/dimension/aspect verification; main/thumb hard caps | Server tests pass; DevTools processing pending |
| Orphan upload / stale image replace | Expiring pending version, durable intent receipt/replay, finalize verification, failure marking, cleanup record and versioned no-overwrite paths | Automated image suites PASS; live cleanup evidence pending |
| Signed URL leak/cache crossover | Five-minute private URLs, 30-second safety window, account/shop/product/version/variant cache scope, full session invalidation | Mini cache tests pass; live network QA pending |
| Unauthorized catalog history/audit tampering | Append-only technical audit; allowlisted safe projection gated by active shop membership; denial audit is rate-capped; no raw payload/token metadata | Migration/pgTAP PASS |
| Sync event forgery / duplicate lane | Client cannot write events; canonical statement triggers publish minimal shop-scoped IDs; no WeChat-specific lane | Architecture plus Android/iOS convergence fixtures PASS |
| Membership revocation during mutation | Database authorization lease and target locks; publication is transaction-bound; cache/session generations fence stale client results | Automated server/client evidence PASS; live revocation pending |
| Identity-link audit divergence | Native linking can succeed at the Supabase identity endpoint before the application audit write; an audit failure returns 503 but cannot roll the provider link back. Web OAuth linking also lacks the same application audit event. | **MEDIUM residual**; bridge/identity operator must provide a transactional or reconciled authoritative audit design before activation |
| Excel ZIP bomb/formula/replay/oversized workbook | No Mini Excel endpoint or UI; DEC-002 defers until decompressed-resource bounds and recovery exist | `EXCEL_IMPORT_DEFERRED_BY_DECISION_GATE` |

Automated foundation evidence is green: Mini 53/53, Admin focused foundation 47/47, scoped database 474/474, catalog 81/81, image 35/35, Android 908 total with 5 skips/0 failures and iOS 1296 passes plus 35 expected skips/0 failures. Remaining activation blockers are the two Medium residuals above, official bridge operation/key rotation, the iOS official provider, AppID/domain approval, device/live same-identity proof, privacy/account-deletion review, image/route runtime evidence and rate-limit/WAF verification in controlled staging. Feature flags stay OFF.

Global classification: `CHANGES_REQUIRED — FOUNDATION_IMPLEMENTED, LIVE AUTH AND MUTATING CATALOG WORKFLOWS INCOMPLETE`.

## WECHAT-004 closure and remaining activation risks

| Threat | Final code control | State |
|---|---|---|
| Mini bearer reaches legacy sinks | Opaque BFF token is server-hashed/device+generation-bound and cannot authenticate to Supabase | CLOSED |
| Cross-account/shop queued write | Durable outbox/cache/watermark namespaces include canonical-user/shop generation and are fenced on change | CLOSED |
| Lost/duplicated offline mutation | Stable idempotency, ordered dependencies, bounded retry and explicit terminal/conflict state | CLOSED |
| Full-refresh polling amplification | Minimal `sync_events` delta, targeted entity reload and 3–30s idle backoff | CLOSED |
| Watermark loss/epoch transition | Fail-closed gap detection, bounded reconcile and controlled bootstrap | CLOSED |
| Identity link without audit | Independent kill switch plus idempotent provider-state reconciliation saga | CLOSED code-side |
| Unauthenticated exchange audit flood | Invalid/unissued state returns without durable audit; post-consume outcomes remain audited | CLOSED |
| Receipt lifetime exhaustion | Private serialized cleanup after immutable 30-day replay horizon | CLOSED |
| Expired image capability replay | Live pending/status/expiry recheck in SQL and again before Storage signing | CLOSED |
| Cross-shop image remove lock | Shop association is part of the locking selector | CLOSED |
| Parallel finalize pre-CAS work | Per-call bytes are bounded; shared-runtime amplification not measured | LOW FOLLOW-UP |
| Provider/AppID/domain/device | Default-OFF and fail-closed readiness | EXTERNAL_ACTIVATION_REQUIRED |

The targeted Admin diff scan covered 66/66 worklist rows. Its immutable snapshot
reported five Medium and two Low findings; all seven are fixed in the current
integration branch and have focused regressions. No P0/P1 remains. The Low
finalize measurement is explicitly deferred and does not justify a realtime,
production-ready or live-auth claim.
