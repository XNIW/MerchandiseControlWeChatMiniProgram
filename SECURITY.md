# Security policy

This pre-release repository accepts security reports through the private security-reporting channel configured by the repository owner. Do not include credentials, complete tokens, OAuth codes, `session_key`, AppSecret, customer data, or full WeChat identifiers in a public issue.

## Invariants

- No production access or production configuration.
- No secret or service-role material in the Mini Program bundle.
- No direct POS-table access and no cross-shop data.
- No handcrafted JWT, fake email/password, automatic magic-link handoff, or OpenID bearer authentication.
- WeChat code exchange is server-side at the Admin Web-owned boundary.
- Identity conflict and account linking fail closed and are audited without excessive PII.

The scoped threat model and response procedures live under `docs/security/` and `docs/runbooks/`.
