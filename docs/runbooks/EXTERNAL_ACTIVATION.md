# External activation checklist

Execute only in controlled dev/staging and stop on payment, contract acceptance, unavailable AppSecret, or 2FA requiring the user.

1. Reviewer approves Admin ADR-002 and the independent mature OIDC bridge, including asymmetric signing, issuer, JWKS, rotation, audience, nonce, code2Session host allowlist, retention and incident ownership.
2. In WeChat Open Platform, verify the Website, Android, iOS and Mini Program applications are associated as required for a verified common UnionID. Record absence rather than assuming it.
3. Register Website callback domain, Android package/release-test signature, iOS bundle/Universal Link/URL scheme/Associated Domains, and Mini Program HTTPS request domain. No socket domain is needed for polling.
4. Complete privacy disclosures, account-deletion/support route, and App Store Guideline 4.8 product decision (`APP_REVIEW_DECISION_REQUIRED`). Do not add Apple automatically.
5. Configure bridge secrets and signing keys in its secret manager; configure Supabase `custom:wechat` issuer/client/JWKS and redirect allowlists; apply the reviewed Admin migration to dev/staging only.
6. Populate public AppIDs/base URLs at each client build boundary and enable one surface flag at a time. Keep production flags OFF.
7. Run web, Android, iOS and Mini Program live login/cancel/not-installed/expired/replay tests; verify the same canonical user and explicit link path when UnionID is absent.
8. Verify shop A cannot read shop B, suspended/removal denial is immediate, a controlled test sale/refund changes net figures, and no secret/token/code appears in logs or bundles.
9. Obtain reviewer approval before production, publication, PR merge, or store submission.

Emergency disablement: turn OFF the affected Admin surface flag, revoke supported sessions/bridge credentials in their owning systems, preserve redacted audit correlations, assess identity/shop exposure, rotate signing/secrets, and repeat the matrix before re-enable.
