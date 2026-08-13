# Runbooks

## External activation order

1. Confirm the canonical Admin Web ADR and independently operated, standards-compliant identity bridge contract.
2. Register/associate Website, Android, iOS, and Mini Program applications under the intended WeChat Open Platform account; verify UnionID eligibility rather than assuming it.
3. Configure approved callback/request domains, Android package/signature, iOS bundle/Universal Link, and privacy/account-deletion requirements.
4. Configure server-only bridge/WeChat secrets and Supabase custom OIDC provider in controlled dev/staging. Never copy values into this repository.
5. Enable only the Mini Program staging flag and run automated, DevTools, device, cross-platform identity, and cross-shop tests.
6. Obtain review/approval before any production change or publication.

## Incident response and disablement

If identity conflict, replay, token leakage, unauthorized shop access, or provider compromise is suspected: disable the affected surface flag at the server boundary, revoke affected supported sessions/bridge credentials using the owning system, preserve redacted correlation/audit evidence, investigate membership and identity linkage, rotate secrets/signing keys according to provider runbooks, and do not re-enable until regression/live checks pass.

## WeChat DevTools

Use an authorized AppID and non-production test account. Keep `project.private.config.json` untracked. Verify request-domain allowlisting, build output, console/network logs, session expiration, foreground refresh, and read-only navigation. Do not publish, submit for review, accept contracts, or expose AppSecret.
