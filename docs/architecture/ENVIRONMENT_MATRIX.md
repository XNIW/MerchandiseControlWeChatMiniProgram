# Environment and callback matrix

| Input | Location | Secret | Default/state |
|---|---|---:|---|
| `WECHAT_AUTH_MINI_PROGRAM_ENABLED` | client build process | no | `0` / OFF |
| `WECHAT_MINIPROGRAM_APP_ID` | DevTools/public client config when approved | no | unset |
| `WECHAT_AUTH_GATEWAY_BASE_URL` | client build process | no | unset; HTTPS origin only |
| WeChat Mini Program AppSecret | Admin/approved bridge secret store | yes | never in this repo |
| `session_key` | Admin/approved bridge transient handling | yes | never in client/logs |
| Supabase service role | Admin server secret store | yes | never in client |

The checked-in runtime config remains OFF with an empty gateway. Activation requires a reviewed build substitution that keeps the same constraints; `.env.example` contains names only and is not read at runtime automatically.

The WeChat dashboard must register the exact HTTPS request domain used by the Admin gateway. No localhost, LAN IP, Vercel preview URL, or unapproved redirect domain is valid for public staging. No socket domain is needed for the selected polling design. Official privacy/account-deletion configuration and AppID association must be completed before a live build.
