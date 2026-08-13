# Scoped threat model

The WECHAT-001 review covers code interception, CSRF/state mismatch, replay, session fixation, callback/provider/AppID confusion, identity-link takeover, OpenID/UnionID collision, open redirect, token/secret/log leakage, insecure storage, compromised devices, removed membership, suspended account/shop, API abuse/enumeration/rate limits, SSRF, SDK/supply-chain compromise, topic guessing, cross-shop leaks, service-role misuse, and excessive audit PII.

P0/P1 controls required before activation include a single server exchange boundary, one-time short-lived state/code handling, signed OIDC issuer/JWKS/audience/nonce validation through the approved Supabase contract, strict surface/callback binding, bounded validated bodies/outbound calls, sanitized logs/errors, short session lifecycle, fail-closed linking, per-request shop authorization, minimal read payloads, dependency provenance, and automated replay/cross-shop/secret tests.

No threat is considered mitigated merely because the feature is OFF; tests/evidence must accompany activation.
