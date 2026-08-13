# Mini Program integration architecture

The canonical WeChat Auth ADR is owned by `merchandise-control-admin-web`. This repository consumes one contract; it does not define another identity provider.

## Trust and data boundaries

1. The Mini Program obtains a short-lived WeChat code with `wx.login`.
2. It sends only the typed minimum request to the Admin Web-owned WeChat backend boundary.
3. Only that server-side boundary may contact the approved identity bridge/WeChat endpoints and perform an officially supported Supabase session handoff.
4. The client stores and rotates only the resulting supported client session according to the approved contract; OpenID and `session_key` are never client credentials.
5. Authorized shop selection and sales reads use bounded shop-scoped APIs/RPCs. Membership/suspension is checked on every data operation.

Identity conflicts, missing verified cross-app identity, replay, or provider/surface confusion fail closed. If UnionID is unavailable, linking to an existing canonical personal account must be explicit; nickname/avatar/email similarity never links identities.

## API and error contract

The parent task will version typed requests/responses for configuration status, WeChat code exchange, session refresh/revocation, authorized shops, daily summary, and paginated daily sales. Error categories must distinguish disabled/not-configured, cancel/deny, invalid or expired callback/code/state, replay, identity already linked/conflict, suspended account/shop, missing membership, session expired, rate limit, offline, and temporary backend failure without account enumeration.

## Update and offline model

The default compatible fallback is bounded polling every 5–15 seconds plus foreground and pull-to-refresh. A supported private Realtime client may replace it only after runtime and authorization tests. Updates are invalidations followed by authoritative RPC reloads, with debounce/deduplication and no sale detail in events.

## Environment and activation

Client-visible names will be finalized by WMP-002/WMP-003. Expected categories are a default-OFF Mini Program feature flag, public Admin gateway base URL, and public Mini Program AppID only if required by official tooling. AppSecret, identity-bridge client secret, WeChat access/refresh token, `session_key`, Supabase service-role key, signing private key, and unrestricted database credentials are forbidden in this repository and bundle.

Activation requires approved WeChat applications under the intended Open Platform account, verified request domains, backend/bridge/Supabase provider configuration, privacy/account-deletion review, official DevTools/device evidence, and cross-platform identity/shop-isolation validation.
