- **Tester/shop** — Prima: riferimenti non univoci. Azione nuova: Admin staging aperto in Safari, chiesto subito login personale sullo shop designato. Prova: UI senza sessione. Manca: accesso operatore, verifica canonica/membership e possibile enrollment WeChat; nessun lookup arbitrario.
- **Privacy** — Prima: UI non verificabile. Azione nuova: route reale aperta e link Account reso pubblico. Prova: link visibile/cliccabile con Auth OFF, H5 rifiutata da WeChat, business domain unset e bypass domini/TLS OFF. Manca: dominio accettato e supporto TEST confermato; privacyWebView=BLOCKED.
- **Nuova credenziale** — Prima: esposta, non ruotata. Azione nuova: richiesta unica reset/replacement con destinazione ufficiale e testo pronto nel packet0600. Prova: bozza NON INVIATA, nessun secret recuperato/usato. Invio approvato; manca handoff telefono, procedura TEST e sostituzione verificata nello store qualificato.
- **Provider** — Prima: protocollo/tenant non qualificati. Azione nuova: richiesta OneID pronta per nonce oppure code-flow/S256, metadata, identità e test negativi. Prova: bozza NON INVIATA, nessun nuovo riferimento tenant. Invio approvato ed eseguito nella chat ufficiale; manca instradamento tecnico, risposta verificabile e integrazione Supabase reale.

# WECHAT-010 — Ripresa operativa del 2026-09-12

Continua WECHAT-010/TASK-159; root unico writer Mini, nessun delta Admin.
Review del nuovo codice APPROVED; acceptance globale EXTERNAL_ACTIVATION_REQUIRED,
nessun DONE. I risultati storici sotto restano validi dove non vi è drift.

## Nuovo delta e acceptance disponibile

**P2: privacy nascosta prima dell'attivazione/login.** Account collocava il link
dentro featureReady e account. Il fix sposta la sola row in una card pubblica;
handler, URL, contenuto e web-view invariati. Account/shop e operazioni restano gated.
Nessuna alternativa privacy nativa o modifica Auth implementata.

Regressione permanente `tests/privacy-public-access.test.ts`: una action senza
antenati condizionati; baseline FAIL, fix PASS. Verify Node26.7.0/npm11.19.0:
89/89 e typecheck/lint/test/build/governance/secret scan/diffcheck PASS.
Reviewer distinto `privacy_review`: APPROVED, zero finding; mirato1/1 PASS
(Node26.8.2 dichiarato separatamente). WXML revisionato SHA256
`03bffee301b55b71022a4bc6b05c483bea58ae325a0f8fc178dad717e26e7e63`.
S1–S5 precedenti non riaperti. Branch di integrazione normale:
`codex/wechat-010-auth-closure`; PR/CI/merge effettivi sono tracciati su GitHub e
nel closeout operativo del packet. Nessun deploy Worker necessario per il delta WXML.

DevTools osservato **2.02.2609102 Nightly**, library3.17.0: drift dalla precedente
Stable, nessun upgrade eseguito qui. Progetto e AppID privato verificati;
urlCheck=true e bypass domini/TLS/HTTPS visivamente non selezionato.
La route `/pages/webview/index` con l'URL privacy configurato raggiunge il rifiuto
WeChat `无法打开该页面 / 不支持打开`. La configurazione progetto mostra il Worker
nei request合法域名 ma **web-view合法域名 未设置**. Non è un timeout di automazione.
Dopo review, il solo asset compilato è stato caricato nel dist ignorato del
progetto per QA: ricompilazione, Account, link `隐私 / 删除账户` visibile con AuthOFF,
click verso la route corretta. Il contenuto H5 rimane bloccato.

L'eligibility TEST specifica resta NON_VERIFICATA. La
[guida ufficiale Tencent](https://cloud.tencent.com/document/product/1301/100434)
riporta il requisito enterprise nel suo scenario, senza dimostrare da sola un
divieto o un'eccezione per questo TEST. Documentazione WeChat non accessibile
dal tool web; nessun aggiramento del portale. Operatore: verificare presenza di
业务域名 nel TEST esistente. Host necessario:
`merchandise-control-admin-web-staging.merchandise-control-admin-web.workers.dev`.
Formato del campo da leggere nel modulo reale. Se emette un file, usare solo
quello: route precisa staging, test/review, HTTPS e assenza redirect prima del
salvataggio operatore. Nessun file inventato, wildcard o dominio salvato alla cieca.

## Credenziale, provider e punto esatto di ripresa

Due testi completi nel packet0600, sostitutivi delle precedenti bozze non inviate:

- `WECHAT-TEST-SUPPORT-REQUEST.md` → [Tencent Customer Service](https://kf.qq.com/),
  online support, inoltro al team 小程序测试号. Canale generale ufficiale verificato;
  specialista ancora da assegnare. Reset/replacement, effetto AppID e web-view TEST.
- `ONEID-TECHNICAL-REQUEST.md` → [Tencent Cloud Online Support](https://cloud.tencent.com/online-service/),
  supporto tecnico/submit ticket, OneID/CIAM. Nessun acquisto o tenant richiesto.
  Nessun nuovo schema utilizzabile dal fetch mirato delle docs; non è prova
  d'incompatibilità. Nessun adapter speculativo o nuova comparazione fornitori.

Entrambi gli invii approvati dall'utente. OneID: testo completo inviato una volta
nella chat ufficiale visitatore; messaggio visibile, risposta automatica in corso,
nessun ticket o specialista ancora attestato. WeChat: online support offre il QR
del Mini Program ufficiale, senza campo messaggio desktop; handoff telefono
richiesto, invio ancora non eseguito. TEST AppSecret solo nello store che esegue
code2session; destinazione assente, quindi non si chiede ancora il secret.
Il wizard tty nascosto esistente riguarda le due credenziali Worker, non lo
store AppSecret di OneID. Nessuna credenziale o readiness file creato.

Se WeChat non appartiene già al profilo designato, ADR-002 richiede enrollment
esplicito con controllo dei due account prima del login allowlisted: non basta
una allowlist e non è ammessa un'assegnazione amministrativa OpenID.
Prima qualificare questo prerequisito; acceptance linking completa per ultima.

wx.login, exchange, sessione opaca, shop/catalogo reali e successive letture,
mutazioni/images, sync nativo, offline/idempotenza/conflitti/recovery/revoca/linking:
**NOT_RUN**. Ripresa dopo quattro gate verificati, integrazione provider contro
versione/API Supabase effettiva e review; configurazione server Mini-only e
allowlist esatte, quindi script `--activate-readonly`. Mutation/linking OFF.
Se cambia AppID, rifare le prove pertinenti senza riusare quelle vecchie come attuali.

## Baseline verificata e cleanup

Preflight main locali/remoti puliti: Mini `f9b4f9da`, Admin `e5babfe8`, zero PR
aperte. CI stesse SHA success: Mini34657085912, Admin34657243708 e
Cloudflare34657243728. Nuovo job schedulato image-cleanup34685854671 success
sullo stesso Admin SHA, non avviato qui e non evidence Auth. Suite invariate riusate.

Worker corrente **29d0c715-e3e7-4a23-b9e7-40ade3149414**,100%, metadata release
isolata **91f3d8e57f3c47740852974b73a5d66efc4189db**. Status server GET200:
tutte le superfici disabled/not ready, mutation/linking OFF. Nessun deploy,
configurazione server, secret o flag modificato. Registry remoto141 identico per
versione/nome/statement count/hash al precedente registro completo, digest
`54feb848f85a40ee5d52c2cb60cabe48`; commerce escluse, nessuna migration applicata.
Auth health senza project API key risponde401: v2.196.0 resta la misura storica,
da riverificare prima dell'integrazione reale; nessun PASS dalla risposta commerciale.

Nessuna fixture o sessione artificiale creata/da bonificare. Editing nel worktree
esistente; solo dist ignorato usato per QA. Produzione, Google/email/staff e
checkout nativi/POS/Client non modificati. Le azioni operatore restano nell'unico
OPERATOR-ACTIONS.md; nessuna promessa di ripresa automatica.

# Evidenze storiche precedenti — aggiornamenti sopra prioritari

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
| 5. Worker | Current c39ebe92-0fdf-4596-94a0-16bcd018ebab at100%, deployed from isolated def934021481d3a309a543b0d4ea186b3fa91733. Postdeploy HTTP smoke9/9 PASS; all flags OFF. |
| 6. Migrations | No WeChat migration needed. Remote141/local143; all seven WeChat migration identities/order/statement checksums match. Two missing migrations are commerce-only and were not applied. |
| 7. Bridge decision | No vendor selected for activation. Tencent remains the first qualification candidate; Authing fallback also lacks documented nonce input for its specific Mini grant. No invented vendor adapter or alternate IdP. |
| 8. Tencent qualified | TENCENT_ONEID_TECHNICALLY_QUALIFIED=NO: required protocol/tenant evidence missing, not a claim that vendor support is impossible. |
| 9. Supabase provider | Platform custom OIDC/id-token capability documented; this project's custom:wechat configuration/live exchange NOT_VERIFIED. No real issuer/discovery/JWKS/client identity available. |
| 10. Missing secrets/config | New TEST AppSecret after supported rotation or account replacement, in the eventual qualified provider's server store; bridge client secret, technical hash salt and provider client credential. Real OIDC metadata and designated canonical tester/shop allowlists also required. No secret entered. |
| 11. Final activation flags | Mini Auth0, catalog mutations0, linking0; general surface flagsOFF. No allowlist values or authenticated fixtures invented. |
| 12. First Mini E2E | NOT_RUN. No real wx.login or exchange with compromised credentials. |
| 13. Live functions | Home/catalog/sales/History authenticated reads, all mutations/images, cross-platform sync/offline/conflicts/revocation NOT_RUN. OFF UI/public network probes do not qualify them. |
| 14. Fix/integration | Mini PR10 normally merged as5289e10f; Admin PR102 normally merged as67e360fc. Reviewed isolated WeChat release deployed, followed by smoke. Exact commits/checks below. |
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

Initial Admin main was ffafd55e4f10044c0724596871d39117122160f1, clean/current at
intake. The previously deployed version38272504-ca78-4bcb-8553-ae7463ae1e64 was
proven to originate from a787331a6e673b2daf93929b507aa18c6dc24e24 by deployment
run32530174055. Main differed by36 files/~6700 added lines including commerce.
The delivered release starts from that proven deployed source and selects only
reviewed/merged WeChat009/010 sources; dependencies and migrations remain identical
to the deployed baseline.

Missing migration identities are `20260823023037_client_commerce_journey_v1` and
`20260823150000_customer_after_sales_order_lines_v1`; the latter depends on the former.
Neither supplies objects required by WeChat. All seven WeChat statement checksums
match;16 older migration registry representation/content differences were recorded
privately, never repaired from counts. Remote schema was not modified. Postdeploy
registry count remains141 and its complete digest is identical to predeploy.

Admin preparation covers SHA256 OIDC nonce/raw Supabase nonce separation, canonical
tester/profile and shop allowlists, receipt expiry/generation, and flag-aware write
capability projection. Allowlist env names are
`WECHAT_MINI_PROGRAM_TESTER_PROFILE_ALLOWLIST` and
`WECHAT_MINI_PROGRAM_SHOP_ALLOWLIST`; empty/malformed values deny readiness. Profile
admission is checked at session issue/resolution; shop admission precedes data RPCs.
No test identity/shop was selected or provisioned automatically.

## Normal integration and actual staging delivery

- Mini source commit `216cba0fb9174ce18057b096215a1cbdbbdaedf8`:
  [PR10](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/10),
  [verify CI](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/34650183086)
  PASS; normal merge `5289e10fef31b59a2fae8d72458380de1f45f900` at21:38:38Z.
  Primary main fast-forwarded cleanly; existing private setup script rerun after
  merge: clean install, complete84/84 verify and configured runtime OFF PASS.
- Admin source commit `496c4d1c85de4cb81244a268098eadf60ab9409c`:
  [PR102](https://github.com/XNIW/merchandise-control-admin-web/pull/102), normal
  merge `67e360fcbc5812b2bf8e5471ef17b2323d0f0fd2`; required CI/pgTAP/Cloudflare
  PASS. Current-main verify, foundation1002 PASS+2 existing skips, focused59,
  UI48 and local Worker smoke29 PASS. Complete security scan
  `6aeeb9bd-93e4-4ef9-b791-10bfc4ec39d2` has no findings/deferred; final flag
  parser consistency delta was independently approved separately.
- Isolated release `def934021481d3a309a543b0d4ea186b3fa91733` on
  `codex/wechat-010-staging-isolated`:14 selected files match merged Admin source
  exactly, plus two release governance files. No commerce, package/lockfile or
  migration change. [Release CI](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34650038825)
  and [Cloudflare build-only](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34650041304)
  PASS; automatic deploy jobs skipped. Local release verify, foundation994 PASS+2
  existing skips, focused59, UI48, Worker smoke29, paging and dry-run PASS.
- Staging-only Wrangler deployment preserved existing vars with `--keep-vars`;
  current version `c39ebe92-0fdf-4596-94a0-16bcd018ebab`, created21:40:59Z,
  100% rollout. Version metadata records the exact release SHA. Binding names/types
  unchanged; no secret supplied/rotated. All six WeChat flags are unset/defaultOFF,
  matching the public disabled status. A wrapper metadata parsing error occurred
  before upload; retry disabled autoconfiguration and used the same built Worker.
- Postdeploy at21:42:12Z: real HTTPS smoke9/9 PASS, no redirects, public
  privacy/deletion/status200; challenge/exchange/shops/catalog/sync/mutations503
  `provider_not_configured`. Synthetic OFF-gate input only, no wx.login or live
  authenticated business test. Standard dispatched CI also executed its existing
  TASK094 staging catalog-import fixture test successfully; it created/tombstoned
  fixtures and cleanup reported all10 active counts zero. This is separate from
  WeChat acceptance. No manual database write or migration apply occurred.

Private exact-source, checksum, review and postdeploy evidence resides in
`_codex-private/wechat-010-admin-audit/`. Documentation closeout changes no runtime
source and does not change the deployed release SHA. Task status remains REVIEW.

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
supported rotation or account replacement and a qualified server store may hidden
secret input occur.

The private `OPERATOR-ACTIONS.md` contains a ready technical request for Tencent:
identify the supported Mini nonce field/endpoint and signed claim, tenant metadata,
audience/client authentication, key rotation, stable subject/AppID/OpenID/UnionID
separation, callbacks/linking and TEST-account compatibility. No purchase or
external message was sent. Linking remains last; Web/Android/iOS require their own
real acceptance. Native dirty checkouts are outside this writer's scope.


## Continuazione autorizzata dal mandato WECHAT-011 — 2026-09-11

Si riutilizza WECHAT-010, senza promuovere a DONE l'accettazione incompleta.
Baseline verificata: Mini `f45eafd838606cb25c8fd661b54a97b53139efce`, Admin
`a932468a34cfb697cf6628e6b8f970f1d46e51bb`, checkout puliti e origin/main uguali,
nessuna PR aperta. CI delle due main PASS; job/step letti, annotation soltanto
warning preesistente runtime Node20 delle GitHub Actions. Worker iniziale ancora
`c39ebe92-0fdf-4596-94a0-16bcd018ebab` 100%, metadata source `def93402`.
GoTrue staging `/auth/v1/health` HTTP200: v2.196.0. Google/email risultano abilitati
in `/auth/v1/settings`; nessuna loro configurazione è stata modificata.

### Decisione protocollo

Reviewer tecnico indipendente `review_protocol`: grant OneID Mini e code flow
PKCE documentati, nonce nel grant Mini e handoff OIDC nel Mini TEST NON_VERIFICATO.
Nessun vendor dichiarato incompatibile. ADR-002 separa requisiti indispensabili,
realizzazione corrente e alternativa standard condizionata sul medesimo OneID.
Supabase v2.196.0 non richiede nonce quando entrambi sono assenti, ma il gateway
mantiene raw→SHA256→claim firmato: non si sfrutta tale comportamento per eludere
il contratto. Nessun adapter o provider registrato con placeholder.

### Finding riprodotti e fix

Review sicurezza indipendente `review_security` sul baseline: CHANGES_REQUIRED.
Sette riproduzioni negative (exit1) evidenziano cinque finding:

| ID | Gravità | Difetto | Correzione e prova locale |
|---|---|---|---|
| S1 | P1 | Intent catalogo A inviato con B dopo random/retry; risultato tardivo guida altro stage | Snapshot generazione prima di await, guard enqueue/send/retry/risultati/errori; quattro regressioni permanenti, più repro con outbox reale |
| S2 | P2 | Exchange dopo logout lascia receipt server vivo | Revoca best-effort del solo receipt abbandonato; test logout e login più recente |
| S3 | P2 | Issue opaco fallito conserva sessione Supabase temporanea | Revoca canonica preventiva fail-closed; rollback hash opaco su risultato incerto; test errore/throw/malformed |
| S4 | P2 | RPC revoke=false dichiarata revoked=true | Accettare solo booleano true; sette forme di risposta testate |
| S5 | P2 | Status ready con solo Mini ON e allowlist invalide | Readiness effettiva per superficie, stato coerente, flag mutation/linking pubblici senza valori allowlist; test OFF/invalid/ON e Web indipendente |

La revoca di rete dal client è best-effort: offline può fallire, il receipt ha TTL
server 15 minuti e rollback della superficie nega comunque l'accesso. Non si
promette annullamento retroattivo di mutazioni già accettate dal server. Immagini:
review mirata del fencing esistente, nessun analogo rebind confermato.

### Execution e matrice delle prove

| Ambito | Risultato |
|---|---|
| Mini verify, typecheck, lint, secret scan, test, build | PASS: Node26.7.0, 88/88 test; nessuna dipendenza modificata |
| Admin verify (lint/typecheck/security/build) | PASS; nessuna migration o dipendenza modificata |
| Admin foundation | PASS: 1006 test, 2 skip preesistenti; riferimento Win7POS pulito usato solo in lettura |
| Admin test Auth mirati | PASS: 29/29 |
| Admin UI smoke locale | PASS: 48/48, server realmente avviato e test browser; non Auth WeChat |
| Repro indipendenti dopo fix | PASS: 7/7, fixture locali; non provider staging |
| Modalità script privata OFF/allowlist/ON | PASS: 3 gruppi negativi/positivi; attivazione reale negata con exit1 perché manca readiness |
| DevTools baseline domini/OFF | Evidence WECHAT-010 precedente; nessun nuovo PASS autenticato |
| Telefono / Auth staging / funzioni autenticate | NOT_RUN: protocollo/credenziale/tester da qualificare |
| Privacy web-view | BLOCKED: tentativo UI DevTools non completato; nessuna prova business domain |
| Latenza live p50/p95 e convergenza nativa | NOT_RUN: manca sessione WeChat autentica |

Lo script privato conserva OFF predefinito e TLS/domains attivi. La modalità
`--activate-readonly` costruisce il client ON solo con attestazioni di review,
provider, nuova credenziale, tester/shop, AppID e SHA coerenti, versione Worker
corrente e status Mini realmente ready; mutazioni/linking/altre superfici OFF.
Non crea attestazioni, non configura provider e non modifica flag server.

### Dipendenze esterne e ripresa

Credenziale: NON_RUOTATA, mai recuperata né usata. Ricerca ufficiale TEST senza
procedura applicabile verificata; le API reset TCSAS/SuperApp non appartengono al
TEST WeChat. Pagina operatore `https://developers.weixin.qq.com/sandbox`, campo
AppSecret: richiedere supporto ufficiale TEST, senza inventare pulsanti. Nuovo
valore solo nel campo nascosto del server store qualificato; se AppID cambia,
rifare l'insieme coerente identità/domìni/provider/DevTools. Nessun portale visitato.

Provider: nessun metadato tenant nei file autorizzati, nessuna exchange reale.
Richiesta Tencent aggiornata nel packet privato: nonce specifico Mini oppure
code-flow Mini TEST, domini/handoff, identità e test negativi riproducibili.
Non inviata; nessun acquisto. Tester/shop: l'utente designa quelli già usati sulle
altre piattaforme; configurazione univoca non trovata e browser Admin disponibile
senza sessione. Richiesti riferimenti precisi; nessuna selezione arbitraria dal DB.

Il packet `OPERATOR-ACTIONS.md` contiene input richiesti, prova attesa e comando
esatto `setup-wechat-staging.sh --activate-readonly`, attualmente bloccato. Prima
servono qualifica/review e configurazione server reale; poi verticale wx.login →
receipt → shop → catalogo, letture, mutazioni/images solo test, sync/offline,
Android/iOS separati e linking ultimo. Nessun PASS globale o promessa background.


### Review indipendente e integrazione conclusa

I due reviewer sono agenti distinti dal writer, non due letture della stessa
sessione: `review_protocol` (protocollo, runtime/config, async/UI e regressioni) e
`review_security` (Auth/replay, isolamento, revoca, RLS/Storage e release/rollback).
Esito finale entrambi APPROVED per il delta tecnico seguente, senza qualifica live:

| Oggetto revisionato | Revisione esatta |
|---|---|
| Mini | `364b44cb63e553e47a398acc7d71378260c83647` |
| Admin e ADR-002 | `0190f52682de86714bb2e5fc0dd6410948355152` |
| Release isolata Admin | `91f3d8e57f3c47740852974b73a5d66efc4189db` |
| Script privato setup SHA256 | `0a2d868143f708ad912c4f76267139321e612269f47c4e2510fec4ae3859f6bf` |
| Validator privato SHA256 | `7c92eb77ab24e8482ccf8c424cbfe7c9ad106b04ac7343c8cb8928627badfcef` |
| Test validator SHA256 | `c717d1863574d8016554cb2407cf480765dfd8cd5a3894ab3d16f31967edf295` |

S1–S5 chiusi; P0/P1 residui nel delta: zero. La prova riproducibile indipendente è
`node /tmp/wechat-011-security-review.cjs <mini-root> <admin-root>`: baseline7
fallimenti attesi, fix7/7 PASS (exit0). Le regressioni permanenti restano nei test
versionati; lo script temporaneo è solo evidence locale. Riferimenti del fix alla
revisione approvata: Mini `miniprogram/lib/catalog-mutation-client.ts:424` (S1),
`miniprogram/lib/auth-client.ts:87` (S2); Admin
`src/server/auth/wechat-mini-session.ts` (S3/S4) e
`src/server/auth/wechat-config.ts` (S5). La review considera anche i contratti
invariati attraversati, ma non ripete una scansione generale di tutti i repository.

Execution dei sottotask tecnici: conclusa e integrata. Review dei fix: APPROVED.
Review dell'accettazione globale: BLOCKED da prerequisiti esterni; non DONE.

### CI, main e artefatto staging distinti

- [Mini PR12](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/12),
  merge normale `37857899637ebf3ec44a88c018406bf60fafced8`;
  [CI PR](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/34655762419)
  e [CI main](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/34656006752)
  PASS sulla rispettiva SHA. Main locale/origin allineate pulite a tale merge
  prima del solo closeout documentale.
- [Admin PR104](https://github.com/XNIW/merchandise-control-admin-web/pull/104),
  merge normale `57e6049714252f6a6c1af37ec3f69127f16de902`;
  [CI PR](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34655768668),
  [Cloudflare PR](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34655768662),
  [CI main](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34656044040)
  e [Cloudflare main](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34656044041)
  PASS. Main locale/origin allineate pulite a tale merge prima del closeout docs.
  pgTAP48 file/2627 test PASS. Foundation CI995 PASS+13skip, diversa dal locale
  1006+2skip per assenza del riferimento Win7POS; nessun failure. TASK094 staging
  import E2E e deploy automatici skipped: non necessari/rieseguiti in questa wave.
- Job, step e annotation letti: soltanto warning preesistenti per runtime Node20
  delle Actions; nessun bypass di CI/protezioni.
- Branch `codex/wechat-010-auth-staging` conservato e pushato alla release
  `91f3d8e57f3c47740852974b73a5d66efc4189db`, derivata dal sorgente staging
  comprovato `def934021481d3a309a543b0d4ea186b3fa91733`. Quattro file selezionati
  dal commit Admin approvato sono identici ai byte integrati su main, più il
  manifest `docs/AUDITS/WECHAT-010-AUTH-RELEASE.md`. Nessun delta commerce,
  migration, package o lockfile. Questo branch non va unito a main.
- [Cloudflare release build-only](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34655880432)
  PASS sulla release esatta. Localmente verify, Auth29/29, OpenNext build, avvio
  Worker/smoke29/29 e dry-run PASS (exit0), prima del deploy.
- Deploy staging con `npx --no-install wrangler deploy --env staging --keep-vars
  --minify --autoconfig=false`, metadata source SHA e tag `wechat-010-auth-91f3d8e`:
  exit0. Worker effettivo **`29d0c715-e3e7-4a23-b9e7-40ade3149414` al 100%**.
  Metadata deployments/version ispezionati; rollback disponibile alla versione
  precedente `c39ebe92-0fdf-4596-94a0-16bcd018ebab`, non necessario/non eseguito.

### Verifica dopo il deploy e limiti runtime

`node closure-staging-smoke.mjs` nel private audit: exit0, HTTP staging reale9/9.
Privacy/deletion/status200, challenge/exchange/shops/catalog/sync/mutations503
`provider_not_configured`, TLS verificato e nessun redirect. Input POST sintetici,
nessun wx.login. Un primo probe aveva inviato `{}` al challenge e ricevuto400:
FAIL del relativo harness, corretto con body conforme e rieseguito; nessun difetto
applicativo o rollback. Non si trasforma il gate OFF in test Auth.

`enabledSurfaces` e `readySurfaces` tutti false; activation disabled, linking e
miniCatalogMutations false. Binding names/types identici al deployment precedente,
nessun binding WECHAT presente, incluse le allowlist. Google/email invariati.
Query registry dopo deploy:141 righe identiche a prima per versione, nome,
statement count e MD5 statement; nessuna migration applicata. Le due migration
commerce rimangono escluse. Nessuna fixture di questa esecuzione da pulire.

Setup privato su Mini main integrata: exit0, verify88/88, bundle `dist` controllato
con gateway/Storage/privacy pubblici corretti e flagOFF; `urlCheck=true` nella
configurazione privata. DevTools Stable2.02.2608040/library3.17.0 sul progetto main:
nuova navigazione delle cinque tab OFF verificata via UI/AX, zero errori, sette
warning del runtime/preload/hot reload. Pannello Network senza richieste durante
questo audit OFF. L'updater aveva mostrato `signature not match`; chiuso l'avviso,
l'IDE installato era utilizzabile. Il successivo tentativo di apertura della
privacy in web-view tramite console non è giunto a una pagina verificabile:
controllo UI/clipboard instabile, infine `noWindowsAvailable`. Esito privacy
BLOCKED; non si aggira il controllo né si attribuisce un PASS al precedente GET.
Prima della readiness ON verificare nuovamente la web-view e i business domain
nel runtime consentito. Telefono e flusso WeChat autenticato: NOT_RUN.

Evidence concise privata: `closure-postdeploy-smoke.json`,
`closure-postdeploy-worker.json`, `closure-postdeploy-deployments.json`,
`closure-postdeploy-migrations.json`; log locali `closure-verify-final.log`,
`closure-release-*.log`, `closure-deploy.log` e packet
`closure-postmerge-setup.log`. Nessun log completo, identificatore privato,
credenziale o artifact build versionato. Checkout nativi/POS/Client e produzione
non modificati. Restano soltanto le dipendenze esterne elencate sopra e la prova
runtime privacy; il closeout documentale non cambia la revisione distribuita.
