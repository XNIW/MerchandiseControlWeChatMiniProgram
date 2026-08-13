# Mini Program integration architecture

The canonical WeChat Auth ADR is owned by `merchandise-control-admin-web`. This repository consumes one contract; it does not define another identity provider.

## Trust and data boundaries

1. The Mini Program obtains a short-lived WeChat code with `wx.login`.
2. It sends only the typed minimum request to the Admin Web-owned WeChat backend boundary.
3. Only that server-side boundary may contact the approved identity bridge/WeChat endpoints and perform an officially supported Supabase session handoff.
4. The client stores and rotates only the resulting supported client session according to the approved contract; OpenID and `session_key` are never client credentials.
5. Authorized shop selection and sales/catalog/image/history reads use bounded shop-scoped APIs/RPCs. Membership/suspension is checked on every data operation.

Identity conflicts, missing verified cross-app identity, replay, or provider/surface confusion fail closed. If UnionID is unavailable, linking to an existing canonical personal account must be explicit; nickname/avatar/email similarity never links identities.

## API and error contract

The implemented consumer contract is documented in [API_CONTRACT.md](API_CONTRACT.md). Error categories distinguish disabled/not-configured, cancel/deny, invalid or expired callback/code/state, replay, identity already linked/conflict, suspended account/shop, missing membership, session expired, rate limit, offline, and temporary backend failure without account enumeration.

## Update and offline model

The temporary implementation is adaptive 3–30 second polling while visible plus foreground and pull-to-refresh. It stops in background and is not Realtime. WMP-012 stays incomplete until a supported private invalidation client/gateway passes runtime and authorization tests. See [DEC-001](../decisions/DEC-001-native-typescript-bounded-polling.md).

Cross-platform applicability and exclusions are enumerated in [PARITY_MATRIX.md](../PARITY_MATRIX.md).

## Environment and activation

Client-visible names and boundaries are listed in [ENVIRONMENT_MATRIX.md](ENVIRONMENT_MATRIX.md). AppSecret, identity-bridge client secret, WeChat access/refresh token, `session_key`, Supabase service-role key, signing private key, and unrestricted database credentials are forbidden in this repository and bundle.

Activation requires approved WeChat applications under the intended Open Platform account, verified request domains, backend/bridge/Supabase provider configuration, privacy/account-deletion review, official DevTools/device evidence, and cross-platform identity/shop-isolation validation.
