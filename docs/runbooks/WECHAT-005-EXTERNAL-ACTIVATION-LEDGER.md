# WECHAT-005 external activation ledger

Status: `INVENTORY_COMPLETE / PHYSICAL_ACTION_REQUIRED`

Never record AppSecret, bridge secret, service-role key, session key, access or
refresh token, OAuth code, complete private account identifier, or unredacted
identity evidence in this ledger.

## Surface readiness

`NO` means the required evidence was absent from repository configuration and
the accessible authenticated portals. It does not prove that an application can
never exist; it means activation is not authorized now.

| Surface | Application registered | AppID available | Secret server-side | Domain approved | Callback approved | Package/bundle verified | Signature verified | Universal Link verified | Official SDK verified | Test account | Residual manual action |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Website | NO | NO | NO | NO | NO | N/A | N/A | N/A | N/A | NO | Official portal inventory needs the authorized operator; the staging Worker has no WeChat configuration. |
| Android | NO | NO | N/A | N/A | NO | YES — package known | NO — only local debug signer | N/A | YES — 6.8.34; registry latest 6.8.40 | NO | Register/verify app, AppID, callback and approved signer; attach a WeChat-capable device. |
| iOS | NO | NO | N/A | N/A | NO | YES — bundle known | NO | NO | YES — Tencent CocoaPods 2.0.7 provenance verified, not integrated | NO | Create the required iOS repository task/handoff, then configure AppID, Universal Link and signing. |
| Mini Program | NO | NO | NO | NO | N/A | N/A | N/A | N/A | YES — official DevTools installed | NO | Unlock/login DevTools, verify/create test app, domains and member; keep review/publication OFF. |

## Identity provider decision gate

| Option | Current result | Required proof |
|---|---|---|
| Supabase Custom OAuth2 direct | `NOT_SELECTED` | No configured custom provider or verified direct compatibility was found. |
| Supabase Custom OIDC direct | `NOT_AVAILABLE` | No official WeChat issuer/discovery/JWKS/audience contract was verified. |
| Approved OIDC bridge | `SELECTED_ARCHITECTURE / NOT_AVAILABLE` | ADR contract retained; approved operator, discovery/JWKS/rotation/audience/privacy/retention and server-only exchange remain required. |

No provider is selected until this table is supported by official documentation and real staging configuration.

## Staging environments

| System | Target | Environment proof | Current state | Production boundary |
|---|---|---|---|---|
| Supabase | `merchandisecontrol-dev`, ref redacted in this ledger | Dashboard, connector and CLI inventory | `STAGING_TARGET_VERIFIED=NO`: only branch labelled `main Production`; Free plan has no backups | no migration was applied |
| Cloudflare | existing staging Worker URL documented by Admin | authenticated Wrangler version/deployment and public smoke | `CURRENT_OLD_VERSION`: active version recorded externally; WeChat status route is 404 | no deployment or production route change |
| Mini DevTools | official local installation | Tencent download, bundle signature and Gatekeeper | `INSTALL_PASS / RUNTIME_PHYSICAL_ACTION_REQUIRED` | no review or publication |

## Feature flags

| Surface | Staging flag | Result |
|---|---|---|
| Admin Web | `WECHAT_AUTH_WEB_ENABLED` | OFF / unset |
| Android | `WECHAT_AUTH_ANDROID_ENABLED` | OFF in tested debug build |
| iOS | `WECHAT_AUTH_IOS_ENABLED` | OFF; private config absent |
| Mini Program | `WECHAT_AUTH_MINI_PROGRAM_ENABLED` | OFF; AppID/gateway absent |
| Catalog mutation | `WECHAT_MINI_PROGRAM_CATALOG_MUTATIONS_ENABLED` | OFF / unset |
| Linking | `WECHAT_AUTH_LINKING_ENABLED` | OFF / unset |

## Recorded physical actions

1. `PHYSICAL_ACTION_REQUIRED — VERIFIED_NON_PRODUCTION_SUPABASE_TARGET`: Admin/Supabase owner must identify or create a separately classified staging target with backup/recovery evidence; never send DB credentials in chat.
2. `PHYSICAL_ACTION_REQUIRED — ADMIN_STAGING_WRITER_HANDOFF`: current TASK-150 owner must release or explicitly hand off the staging Worker writer lease and authorize a new run/deploy budget.
3. `PHYSICAL_ACTION_REQUIRED — APPROVED_WECHAT_IDENTITY_BRIDGE`: identity owner must configure the approved `custom:wechat` bridge/provider and server-only secrets after issuer/JWKS/audience/privacy evidence is available.
4. `PHYSICAL_ACTION_REQUIRED — WECHAT_OPEN_PLATFORM_APPLICATIONS`: authorized operator must inventory/register Website, Android, iOS and Mini applications, public identifiers, domains/callbacks, signer/Universal Link and test membership without accepting legal terms, paying, reviewing or publishing on Codex's behalf.
5. `PHYSICAL_ACTION_REQUIRED — DEVTOOLS_UNLOCK_AND_LOGIN`: unlock the Mac and complete only the user's own DevTools login/2FA/terms, then leave the project-import screen ready for Codex.
6. `IOS_WECHAT_PROVIDER_REPOSITORY_TASK_REQUIRED`: planner must create the next iOS ACTIVE/EXECUTION task before Codex may integrate the verified Tencent CocoaPods distribution.

## Physical-action format

When a gate is reached, record: portal, page, button, field, public value to
enter, exact user action, and what Codex will do immediately afterward. Never
place the secret value in this file.
