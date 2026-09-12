# WECHAT-010 — Test-account domains and first-live prerequisites

- Status: `REVIEW / EXTERNAL_ACTIVATION_REQUIRED`
- Owner: Codex, sole Mini writer; independent agents read/review only.
- Opened: 2026-09-11
- Source branch: `codex/wechat-010-mini-staging`; PR10 merged normally.
- Evidence closeout branch: `codex/wechat-010-integration-report` (docs only).
- Intake base: `origin/main` `2732868cf8a246b37cca4ef617d6310900fd5a8d`, clean, zero drift.
- Mandate: user-authorized staged verification, bounded fixes, full gates,
  security review, commit/push/PR/CI/normal merge; staging only.

## Scope and acceptance

Accept the operator's manual TEST-account domain evidence. Reuse the private
WECHAT-007 inventory/build script. Keep AppID in private DevTools configuration
only and every Auth/mutation/linking flag OFF. The exposed test AppSecret must
never be copied or used; supported rotation or account replacement and verified vendor/provider readiness precede
any real code exchange. Do not automate the WeChat portal.

Verify build, official DevTools domain validation and OFF network behavior;
inspect actual staging Worker/migrations rather than counts alone. Qualify the
existing Tencent OneID recommendation and, if needed, Authing against ADR-002,
without buying a tenant or changing identity architecture. Complete independent
fail-closed preparation. Live authenticated behavior remains NOT_RUN until proven.

## Evidence and handoff

Execution report: `docs/testing/WECHAT-010-REPORT.md` (created at review handoff).
Private operator packet: `/Users/minxiang/Projects/_codex-private/wechat-007/`.
Operator owns supported credential rotation/replacement and vendor qualification.
DevTools login/import and OFF audit have been resolved. Admin owns the canonical
bridge/session decision and migrations. No self-approved DONE; no production,
publication, native checkout changes or invented live fixtures.

## Verified handoff

Mini full pinned-toolchain gates pass 84/84; DevTools TEST import, refreshed
domains, bypass OFF, five-tab OFF audit and four public HTTPS runtime probes pass.
Auth expiry, asynchronous success/error cancellation, Home session/lifecycle
cleanup and gateway redirect refusal are fixed with deterministic regressions.
Security scan has complete four-source coverage and no findings; the final
lifecycle guard/test delta was independently reviewed separately. GitHub
integration and isolated Admin staging delivery are recorded in the report.
Mini PR10 and Admin PR102 merged normally after green CI. The isolated Admin
release def93402 is deployed as Worker c39ebe92 at100%; real OFF-state HTTP
smoke9/9 PASS, all flags OFF. No WeChat migration needed/applied and no live Auth claim.

## Emendamento utente WECHAT-011 — 2026-09-11

Il mandato «Chiusura tecnica Auth» continua questo task, senza duplicare o chiudere
l'accettazione incompleta. Autorizza in continuità planning, execution, review
indipendente, fix, CI, merge normale e deploy del solo staging. Root è l'unico
writer per repository; due reviewer read-only distinti verificano protocollo e
sicurezza/integrazione. Restano esclusi produzione, pubblicazione, store, spesa,
nuovo IdP e modifiche ai repository nativi/POS/Client.

Delta autorizzato: qualificazione mirata dell'ADR-002 sulle API effettive;
correzione dei difetti riproducibili di isolamento account e ciclo sessione;
modalità privata esplicita per la futura build read-only ON dopo readiness.
Il secret TEST esposto non viene recuperato/usato. L'utente designa gli account e
shop già usati per Admin/Win7POS/Android/iOS: risolvere dalla configurazione
corrente, senza scegliere la prima riga DB o impersonare account.

CA aggiuntivi: intent di mutazione non trasferibile dopo cambio sessione;
cleanup delle sessioni temporanee e tardive; revoca con esito verificato;
OFF predefinito e ON negato senza prerequisiti; review dei byte esatti e CI verde.
Auth/DevTools/dispositivo live restano NOT_RUN finché non esiste la prova reale.


## Closeout tecnico della continuazione

Execution dei fix conclusa; review indipendenti `review_protocol` e
`review_security` APPROVED sui commit Mini `364b44cb` e Admin `0190f526`, sul
packet privato verificato e sulla release isolata `91f3d8e5`. Nessun finding aperto
nel delta revisionato; l'approvazione non certifica provider o Auth live.
Mini PR12 e Admin PR104 integrate normalmente dopo CI verde. Nuovo Worker staging
`29d0c715-e3e7-4a23-b9e7-40ade3149414`, rollout100%, smoke OFF9/9, migration141
identiche per versione/nome/statement count/hash. Flags e allowlist ancora assenti,
defaultOFF. Nessuna fixture creata, nessuna modifica production/native/POS/Client.

Handoff: `REVIEW / EXTERNAL_ACTIVATION_REQUIRED`. Il codice autorizzato è
integrato; accettazione globale BLOCKED e prove Auth/telefono NOT_RUN.
Credenziale TEST sostitutiva supportata, qualifica protocollo/tenant OneID e
riferimenti esatti al tester/shop condiviso sono dipendenze indipendenti.
Privacy web-view BLOCKED nell'ambiente DevTools corrente; nessun PASS da GET.
Dettagli, comandi, CI e stato effettivo nel report unico.


## Ripresa operativa — 2026-09-12

Il mandato continua WECHAT-010/TASK-159. Root unico writer Mini nel worktree
esistente; nessun writer Admin necessario al momento. Auth rimane OFF.
Riprodotto nel runtime: Account nasconde privacy prima del login; navigazione
diretta della route reale raggiunge un rifiuto WeChat della pagina H5.
Delta autorizzato: rendere il link privacy pubblico senza modificare contenuto,
URL, web-view o gating dei dati account. Test, review indipendente e CI richiesti.


## 2026-09-12 - WECHAT-010: privacy pubblica e residui operativi

Admin staging aperto in Safari: login personale richiesto subito all'operatore,
nessun selector/lookup arbitrario. Mini Account nasconde privacy quando AuthOFF:
regressione strutturale baseline FAIL, fix sposta la sola row fuori dai gate.
Il primo harness aggiuntivo tentava di mutare la config frozen: errore del test,
scartato; nessun difetto runtime attribuito a tale errore. Verify pinned89/89 PASS
(typecheck/lint/test/build/governance/secret scan), diffcheck PASS; reviewer
indipendente privacy_review APPROVED, mirato1/1 PASS.
Asset compilato revisionato caricato solo nel dist ignorato del progetto DevTools
per QA: link pubblico visibile con AuthOFF, click apre pages/webview/index.
H5 rifiutata; configurazione runtime mostra web-view domain unset e request
Worker presente; urlChecktrue e bypassTLS/domains visivamente OFF. Nightly
2.02.2609102 e library3.17.0 gia installati: drift dichiarato, nessun upgrade.
Worker29d0c715100%/release91f3d8e invariati, registry141 stessa impronta.
Due richieste ufficiali distinte pronte nel packet0600; nessun invio o secret.
Execution del delta conclusa, review APPROVED, integrazione normale autorizzata.
Review globale EXTERNAL_ACTIVATION_REQUIRED, Auth/E2E NOT_RUN, nessun DONE.


## 2026-09-12 - Risultati successivi: sessione e integrazione

PR14 integrata normalmente come9470909678347230e67cd638b80f13e9b05ff96a;
CI head34696845184 e main34696886612 PASS. Main fast-forward, build staging OFF
pinned, WXML compilato identico al sorgente revisionato. Smoke DevTools postmerge:
link privacy Account visibile/cliccabile, route corretta, H5 ancora rifiutata.
Nuova sessione personale Admin rilevata: ID da /account/profile e shop dalla UI;
query read-only puntuale conferma profilo/shop/membership attivi, shop_owner,
Google soltanto e zero custom:wechat. Allowlist candidate nel packet0600, non
applicate; attesa conferma che lo shop visualizzato sia quello designato.
Enrollment esplicito necessario; nessuna identita o associazione forzata.
OneID sospeso per richiesta utente: numero cinese non disponibile. Nessun ticket
confermato; WeChat chat telefonica aperta, invio approvato ancora da confermare.
Nessun delta Admin/Worker/migration/flag; Auth/E2E NOT_RUN, nessun DONE.
