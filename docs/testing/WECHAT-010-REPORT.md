# WECHAT-010 — TEST domains and first-live preparation

Date: 2026-09-11. Status: `REVIEW / EXTERNAL_ACTIVATION_REQUIRED`.
No DONE, production change, Mini upload/publication or real WeChat exchange.

## Acceptance snapshot

| Requested evidence | Actual result |
|---|---|
| 1. Portal domains | User manual evidence accepted: TEST account; request Worker + Supabase, upload/download Supabase, 49 monthly changes remaining. Socket/UDP/TCP/DNS/preconnect empty. Business domain unchanged: NOT_REQUIRED_CURRENTLY for this OFF phase. |
| 2. Test AppID/private config | Matches user evidence and the TEST account shown by DevTools. AppID only in ignored private configuration; shared project.config.json restored byte-for-byte to main after IDE import normalization. No official/production AppID inferred. |
| 3. Exposed AppSecret | MINI_TEST_APPSECRET_ROTATION_REQUIRED. Never copied, used, logged, placed in env or inserted server-side. TEST-specific reset support/procedure remains unverified. |
| 4. DevTools | 2.02.2608040, base library 3.17.0 (UI labels it rollout). Correct repository imported. Domain refresh matches manual evidence. Bypass checkbox OFF; five tabs consistently disabled and no network requests in OFF audit. Four subsequent public diagnostic wx.request probes return200. |
| 5. Worker | Initial actual version38272504-ca78-4bcb-8553-ae7463ae1e64, 100%, source a787331a6e673b2daf93929b507aa18c6dc24e24 proven by deployment run32530174055. Final isolated delivery recorded below. |
| 6. Migrations | No WeChat migration needed. Remote141/local143; all seven WeChat migration identities/order/statement checksums match. Two missing migrations are commerce-only and were not applied. |
| 7. Bridge decision | No vendor selected for activation. Tencent remains the first qualification candidate; Authing fallback also lacks documented nonce input for its specific Mini grant. No invented vendor adapter or alternate IdP. |
| 8. Tencent qualified | TENCENT_ONEID_TECHNICALLY_QUALIFIED=NO: required protocol/tenant evidence missing, not a claim that vendor support is impossible. |
| 9. Supabase provider | Platform custom OIDC/id-token capability documented; this project's custom:wechat configuration/live exchange NOT_VERIFIED. No real issuer/discovery/JWKS/client identity available. |
| 10. Missing secrets/config | Rotated TEST AppSecret in the eventual qualified provider's server store; bridge client secret, technical hash salt and provider client credential. Real OIDC metadata and designated canonical tester/shop allowlists also required. No secret entered. |
| 11. Final activation flags | Mini Auth0, catalog mutations0, linking0; general surface flagsOFF. No allowlist values or authenticated fixtures invented. |
| 12. First Mini E2E | NOT_RUN. No real wx.login or exchange with compromised credentials. |
| 13. Live functions | Home/catalog/sales/History authenticated reads, all mutations/images, cross-platform sync/offline/conflicts/revocation NOT_RUN. OFF UI/public network probes do not qualify them. |
| 14. Fix/integration | Mini session/lifecycle/redirect fixes; Admin prerequisites on separate current-main branch. Normal PR/CI/merge and isolated staging details below. |
| 15. External action | Two independent prerequisites remain: supported TEST-secret rotation/replacement, and vendor confirmation of the exact nonce-capable Mini/OIDC contract. A tenant purchase alone cannot resolve either proof gap. |

`WECHAT_AUTH_LIVE_E2E_PASS=NOT_RUN`.
`WECHAT_ESSENTIAL_FUNCTIONS_STAGING_PASS=NOT_RUN`.

## Runtime and network evidence

The existing private `wechat-007/setup-wechat-staging.sh` was reused and tightened
to require TEST/manual-domain confirmation, all three flagsOFF, actual compiled
public runtime values and private `urlCheck=true`. No second build system.
The private five-file inventory and activation ledger preserve historical evidence.
Official project configuration documentation confirms private AppID precedence:
[WeChat project configuration](https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html).

DevTools login was renewed; its native file selector initially retained a previous
directory. That import was cancelled before running code, its list entry removed,
and only its two newly created config files moved to restricted recovery storage.
Existing files were unchanged. Correct import subsequently verified the repository
path and TEST identity. IDE-generated shared config changes were reverted; private
configuration remains ignored and no complete identifiers are recorded here.

After compilation, all five tabs showed the disabled gate and Network stayed empty:
zero Worker/Storage requests and zero WebSockets. Console checks reported
`featureReady=false` and `authClientAbsent=true`. Domain list was explicitly refreshed.
Four separate diagnostic GETs using `wx.request`, `redirect: manual`, timeout8s,
no bearer and no wx.login returned200: Worker `/api/auth/wechat/status`, `/privacy`,
`/account-deletion`, and Supabase `/storage/v1/status`. These probes are distinguished
from normal OFF traffic. Worker font preloads came from public page Link headers on
the same inventoried Worker origin. No new host was added.

Curl additionally validated HTTPS/no redirects; unauthenticated Supabase Auth health
returned401 as expected. Initial Python urllib Worker403 differed from curl and actual
Mini200; it was not misreported as a global outage. DevTools platform rollout/preload
warnings and one corrected diagnostic Console input syntax error are not application
errors or live Auth evidence. The public privacy page works over HTTPS; opening it
through the Mini's future web-view remains untested because business-domain support
is a separate requirement once Auth exposes that action.

## Source fixes and verification

- Reject null/malformed handoffs, nonnumeric/nonfinite/fractional/missing expiry,
  invalid lifetime and provider confusion with sanitized errors; retain memory-only
  opaque bearer and maximum24h lifetime.
- Fence every asynchronous Auth result and error against logout, session replacement
  and a newer login attempt. Codes are exchanged once; stale results never replace
  the current account. Home also fences continuation/error UI updates.
- Clear prior Home shop/sales on logout or expiry, including visible refresh expiry.
  Late reads from an earlier page lifecycle cannot interrupt a new login.
- Set manual redirect handling for gateway challenge/exchange/authenticated requests;
  reject3xx without following a second origin. Existing Storage behavior is retained.

Pinned Node26.7.0/npm11.19.x: clean install, verify, governance, secret scan,
typecheck, lint, **84/84 tests**, build, configured-runtime assertions and
`git diff --check` PASS. No dependency change. Regression fixtures prove only code
behavior, not live acceptance. Private env forbidden-secret-key/permissions checks
PASS; runtime exports only the six public config fields.

Security scan `b423b95e-cc90-4b4e-a584-e2ec14382513`: preflight3/3, complete4/4
source coverage, zero findings/deferred; final Home generation guard/test delta
independently reviewed and approved afterward, with readiness10/10 PASS. This scan
does not claim to include bytes from the subsequent delta. Earlier scan
`1fd432b2-090a-4659-8b20-a48e2882e000` retained a stale pending checkpoint and is
classified partial; its sealed artifact was not changed. Token usage unavailable.

## Admin source, schema and deployment isolation

Current Admin baseline ffafd55e4f10044c0724596871d39117122160f1 is clean/current
main. Main differs from the deployed source by36 files/~6700 added lines including
commerce. The deployment candidate starts from the proven deployed a787331a and
selects only reviewed/merged WeChat009/010 sources; dependencies and migrations
remain identical to the deployed baseline.

Missing migration identities are `20260823023037_client_commerce_journey_v1` and
`20260823150000_customer_after_sales_order_lines_v1`; the latter depends on the former.
Neither supplies objects required by WeChat. All seven WeChat statement checksums
match;16 older migration registry representation/content differences were recorded
privately, never repaired from counts. Remote schema was not modified.

Admin preparation covers SHA256 OIDC nonce/raw Supabase nonce separation, canonical
tester/profile and shop allowlists, receipt expiry/generation, and flag-aware write
capability projection. Allowlist env names are
`WECHAT_MINI_PROGRAM_TESTER_PROFILE_ALLOWLIST` and
`WECHAT_MINI_PROGRAM_SHOP_ALLOWLIST`; empty/malformed values deny readiness. Profile
admission is checked at session issue/resolution; shop admission precedes data RPCs.
No test identity/shop was selected or provisioned automatically.

Integration/delivery update is appended after remote CI and staging smoke.

## Exact bridge qualification and operator handoff

[Tencent Mini grant](https://cloud.tencent.com/document/product/1441/68677) explicitly
supports server verification of wx.login code and an ID token, but documents no
nonce input for `social/wechat/jscode`. [Discovery](https://cloud.tencent.com/document/product/1441/64402)
and [public keys](https://cloud.tencent.com/document/product/1441/64397) establish
OIDC/JWKS building blocks, not tenant-specific audience, signed nonce, overlapping
key rotation, stable subject/AppID isolation or secure linking proof.

[Authing's current OpenAPI](https://api.authing.cn/auth-openapi-json) documents
`signin-by-mobile` with `wechat_mini_program_code` and an ID token, but its Mini
request/options schemas also lack nonce. A deprecated nonce in a different
credential-login schema is not proof of Mini support.

[Supabase custom providers](https://supabase.com/docs/guides/auth/custom-oauth-providers)
and [pinned ID-token implementation](https://github.com/supabase/auth/blob/d6dec2640f047a42873e64ccec2f7288043d511f/internal/api/token_oidc.go#L294)
require the signed nonce to equal SHA256(raw nonce supplied to Supabase). The
salted database challenge hash remains distinct. No JWT rewriting or disabled
nonce checking is permitted.

The [official TEST account guide](https://developers.weixin.qq.com/miniprogram/dev/devtools/sandbox.html)
does not establish a TEST AppSecret reset procedure. Obtain supported rotation or
account replacement from the portal operator/Tencent; do not reuse the exposed
value or assume the official production-account reset UI applies. Only after a
real supported rotation and qualified server store may hidden secret input occur.

The private `OPERATOR-ACTIONS.md` contains a ready technical request for Tencent:
identify the supported Mini nonce field/endpoint and signed claim, tenant metadata,
audience/client authentication, key rotation, stable subject/AppID/OpenID/UnionID
separation, callbacks/linking and TEST-account compatibility. No purchase or
external message was sent. Linking remains last; Web/Android/iOS require their own
real acceptance. Native dirty checkouts are outside this writer's scope.
