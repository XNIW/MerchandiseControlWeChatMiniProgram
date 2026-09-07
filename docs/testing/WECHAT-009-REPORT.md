# WECHAT-009 — Report di esecuzione e accettazione

Data: 2026-09-06/07. Stato: `REVIEW / EXTERNAL_ACTIVATION_REQUIRED`.
Risultato: correzioni indipendenti verificate e integrate; accettazione live non eseguita.
`WECHAT_AUTH_LIVE_E2E_PASS=NOT_RUN` e
`WECHAT_ESSENTIAL_FUNCTIONS_STAGING_PASS=NOT_RUN`.
Nessun task auto-approvato DONE.

## 1. Baseline realmente trovata

| Repository | Checkout trovato | origin/main verificato prima del lavoro | Stato |
|---|---|---|---|
| Mini | f305447cb19f21430dbff8cd50bac1db6eb73f88 | stessa SHA | pulito; nuova branch codex/wechat-009-mini-performance |
| Admin | 4265272637aa0f96881d3f21929b999f89f45779 | c18b3cc56c2dcc54fbf8de04effbecf2c850ba0a | checkout pulito ma arretrato; lavoro in worktree isolato codex/wechat-009-admin-performance |
| Android | c21de310c0a717f481a79d938888cbb99e8f930c | d7c4953c4ed6bc2a33cc5dbfd009eb862f70feac | branch storica e log untracked preservati |
| iOS | c55e3a93449c4f432bf28f4d7b1f5ac1e5f9b502 | 30d226d0fb9b8679a1dd034c6e82319645337f22 | scheme modificato/evidence untracked preservati |

Nessuna PR aperta nei quattro repository all'inventario. Ultime CI native/Mini
verdi; Admin aveva ulteriori merge commerce, con stato canonico IDLE. Percorsi
native ricavati dal report locale Admin `docs/sync-audit-admin-android-ios.md`.
WECHAT-009 non esisteva; creato una sola volta, con task Admin TASK-158 secondo
la numerazione corrente. WECHAT-008 è attestato dal packet privato del 14 agosto:
Admin PR88 e iOS PR9 integrarono pagine pubbliche/Associated Domains. Questo non
risolveva N+1, Home e byte budget; i tre difetti erano ancora nel codice corrente.
Sales automatic refresh, sync error backoff, cache miss e gate OFF erano già
corretti da WECHAT-007 e non sono dichiarati nuovi risultati di WECHAT-009.

Supabase read-only: progetto merchandisecontrol-dev / jpgoimipbothfgkokyvm,
ACTIVE_HEALTHY, PostgreSQL 17.6, **141 migration**, ultima 20260821211500;
non 137 come nella baseline storica. Il repository Admin corrente contiene 143
migration: nessuna è stata applicata da questa esecuzione.
Worker staging attuale: **38272504-ca78-4bcb-8553-ae7463ae1e64**, 100%, deployment
2026-08-21T21:52:30Z. Non riportato a f797c513 o c757b35e. Main non equivale a deploy.

## 2. Modifiche effettive

- Mini `pages/database/index.ts`: eliminati i detail GET per i primi 16 ID.
  Un'invalidazione catalogo/prezzi rilegge soltanto la finestra già caricata,
  in pagine keyset da 50. Ordinamento, filtri, righe archiviate e prezzi sono
  autorevoli dal server; non dipendono dal sort locale o da ID troncati.
  La finestra precedente resta visibile finché le pagine non sono complete;
  il fallimento durante apply/reconcile viene propagato al coordinatore.
- Mini `lib/home-sales-reader.ts`, Home e Sales: richieste Home concorrenti
  condivise; confronto giorno precedente/ultima vendita aggiornati al cambiamento
  dei dati finanziari/ledger/data business o entro 30 secondi, e immediatamente
  su pull manuale. Il riepilogo corrente resta a 3 secondi. Guardia lifecycle
  impedisce il riavvio del timer dopo onHide; risposte di sessione/shop precedenti
  non aggiornano Home. Nessun catalog polling completo aggiunto.
- Mini `app.ts` e `sync-coordinator.ts`: start idempotente sullo stesso shop,
  niente checkpoint aggiuntivo per outbox vuota, stop su clearShop e guardie
  foreground/session/shop sui completamenti outbox. Massimo 10 pagine per ciclo,
  con ripresa dal watermark durevole e backoff 3–30 secondi.
- Mini `http-client.ts`: budget del JSON completo in byte UTF-8, non caratteri.
  Parser sync accetta fino a 1.000 ID per chiave per il contratto canonico
  (comunque limitato dal byte budget); cursori validati prima degli effetti.
- Admin `src/server/wechat/sync-gateway.ts`: massimo cinque eventi richiesti al
  produttore, budget upstream e intero envelope 128 KiB. Nessun troncamento,
  sostituzione evento, cursore inventato o aumento di limite.
- Admin ADR-002: comparazione bridge e proposta esplicita, non approvazione né
  implementazione Auth. Gateway, account canonico e nonce restano invariati.
- Packet privato riusato: corretto WECHAT_WEB_CALLBACK_URL che conteneva
  erroneamente la callback Supabase; ora vuoto finché esiste il callback bridge.
  Aggiornati solo OPERATOR-ACTIONS.md, portal-inventory.json e SETUP-STATUS.md.

## 3. AppID, domini, bridge, provider

| Prerequisito | Stato | Evidenza / limite |
|---|---|---|
| Website AppID | MANCANTE | public-config.env vuoto; nessuna prova portale |
| Mobile AppID Android/iOS | MANCANTE | entrambi vuoti; mapping comune Mobile Application da verificare, non quattro registrazioni obbligatorie |
| Mini AppID ufficiale | MANCANTE | Test AppID DevTools non è prova live |
| Package Android | PRESENTE | com.example.merchandisecontrolsplitview |
| APK effettivamente selezionato/installato per test | MANCANTE | nessun Android collegato; firma ricalcolata dal solo candidato debug storico, mai proposta come firma release |
| Bundle iOS | PRESENTE | com.niwcyber.iOSMerchandiseControl |
| Scheme WeChat | MANCANTE | AppID ufficiale assente; scheme Supabase preesistente preservato |
| Associated Domain/AASA | PRESENTE, prova server | entitlement remoto e AASA staging HTTP200 senza redirect; percorso /wechat/ios/ e figli |
| Universal Link iPhone | NON_VERIFICABILE | due device noti, entrambi tunnel unavailable; AASA200/fallback non equivalgono a handoff |
| request/upload/download approvati | NON_VERIFICABILE | Worker e Supabase sono candidati nei file, nessuna attestazione portale; wx.request usa anche PUT immagini |
| test member/registrazioni | NON_VERIFICABILE | nessuna prova redatta nuova |
| Bridge approvato/issuer/discovery/JWKS/client ID | MANCANTE | tutti i campi pubblici assenti |
| Secret server-side bridge/hash salt | MANCANTE nel Worker inventoriato | solo nomi dei secret letti; nessun binding WECHAT nella versione staging |
| Provider Supabase custom:wechat | NON_VERIFICABILE attuale | storico WECHAT-008 NOT_CREATED; form autenticato non disponibile, nessun provider creato qui |
| Privacy/cancellazione | PRESENTE, prova server | /privacy e /account-deletion HTTP200; approvazione portale separata |

Directory privata 0700, file dati 0600, wizard eseguibile preesistente 0700;
fuori dai repository, nessun secret stampato/committato. Wizard riusato senza
avviarlo in modalità secret: il gate fallisce finché i metadati reali mancano.
`DB_PASSWORD_ROTATED=NO`: nessuna rotazione dichiarata, nessuna password storica
letta, recuperata o ritentata. DevTools installato, CFBundleShortVersionString
36.6.0 osservato; la precedente evidence prodotto 2.01.2510290 resta storica,
non si deduce un nuovo PASS di compilazione da questi metadati.

## 4. Residui prestazionali: prove e limiti

| Residuo | Prova deterministica attuale | Esito |
|---|---|---|
| N+1 catalogo | Finestra 100 righe, delta da 1/16/17/250/500 ID: sempre 2 GET da 50, zero detail GET. Errore seconda pagina non pubblica finestra parziale; cambio shop non pubblica risposta stale. | PASS codice/test; live NOT_RUN |
| Home | 20 cicli a 3s nel minuto [0,60s): 24 GET invece di 60; cambio latest_ledger_at/giorno e pull forzano le due letture secondarie; concorrenti coalesced. | PASS conteggio simulato; latenza live NOT_RUN |
| Sync payload | HTTP accetta 131072 byte, rifiuta 131073 anche Unicode; gateway testa 128/256 KiB e envelope. Fallimento apply salva solo prima pagina, restart riprende la seconda; risposta oversized non avanza. | PASS codice/test; rete reale NOT_RUN |

Produttore canonico: safe entity_ids <=16384 byte/evento, projection SQL Mini
<=262144 byte. Gateway precedente poteva accettare 256 KiB; consumer 128 KiB era
misurato in UTF-16. Ora cinque eventi lasciano margine per envelope sotto128 KiB,
verificato anche dal gateway. Si conserva il cap SQL storico senza migration.
Il tradeoff è più pagine per grandi quantità di eventi (ceil(eventi/5)); ogni
ciclo ne applica al massimo10. Non viene sacrificata alcuna riga per entrare nel
budget: l'oversize inatteso fallisce e conserva il watermark precedente.

GET catalogo = ceil(righe nella finestra caricata/50), per notifica rilevante;
non cresce per singolo ID. Restano letture immagini batched da16 riferimenti;
i test N+1 usano prodotti sintetici senza immagini. Nessun EXPLAIN o benchmark
DB live eseguito: il numero interno di query SQL non è un risultato misurato.
Lo status Auth staging pubblica pollingIntervalSeconds=10; è un metadato della
versione distribuita, distinto dai timer Mini e dalla latenza end-to-end.
Il Mini conserva catalogo/cache in memoria e watermark/outbox durevoli; non si
asserisce una replica locale durevole dell'intero catalogo. Apply fallito non
è riconosciuto come completato. Al foreground la vista viene ricaricata.

Polling non è latenza end-to-end. p50/p95, campioni/rete, payload live,
foreground/background device e convergenza cross-platform: NOT_RUN per assenza
Auth/apps/device. Non si trasforma il target storico ~3s in un risultato.

## 5. Matrice di accettazione

| Funzione | Codice/contratti | Automatici | Staging autenticato WECHAT-009 | Runtime/device reale WECHAT-009 |
|---|---|---|---|---|
| Web / Android / iOS / Mini Auth | Foundation e adapter presenti; bridge mancante | Mini auth e Admin WeChat contract tests PASS | NOT_RUN | NOT_RUN |
| cancel/deny/expired/replay/logout/revoca | Contratti fail-closed | Test contract/session presenti PASS | NOT_RUN | NOT_RUN |
| Identità comune/linking/no takeover | ADR; separate flag OFF | Admin saga/opaque BFF tests PASS | NOT_RUN | NOT_RUN |
| shop/viewer/revoked/suspended | Server boundary conserva autorizzazione | Scope/session e suite Admin PASS | NOT_RUN | NOT_RUN |
| prodotti create/update/archive/restore | Capability/revision/idempotency | Mini mutation/outbox e Admin foundation PASS | NOT_RUN | NOT_RUN |
| categorie/fornitori/prezzo/storico | Contratti invariati | Suite Mini/Admin PASS | NOT_RUN | NOT_RUN |
| immagini upload/thumb/replace/remove | Private versioned URL e durable attempts | Mini immagini/cache/retry PASS; nessun write live | NOT_RUN | NOT_RUN |
| History | Proiezione sanitizzata | Foundation e Mini PASS | NOT_RUN | NOT_RUN |
| vendite oggi/storico/calendario/range/dettaglio | Shop timezone, lordo/refund/netto, sola lettura | Suite sales/date/range PASS | NOT_RUN | NOT_RUN |
| offline/outbox/retry stessa chiave/conflitti | Durable outbox e revisioni invariati | Suite outbox/isolation/image attempts PASS | NOT_RUN | NOT_RUN |
| Mini ↔ Web/Android/iOS catalogo/immagini | Incrementale/checkpoint/epoch/reconcile | Mock restart/paginazione/apply failure PASS | NOT_RUN | NOT_RUN |
| Home/polling/payload | Correzioni sopra | 74 Mini test, 9 Admin focused | NOT_RUN | NOT_RUN |

Tutti i NOT_RUN live richiedono bridge realmente qualificato, AppID/domain/test
member approvati e sessioni/device di test. Non sono sostituiti da harness con
bearer inventati. Nessuna fixture staging è stata creata, quindi cleanup=0.
Le fixture deterministiche sono marcate nei test e non sono dati live.

## 6. Gate e review

- Mini: Node26.7.0, npm11.19.0; verify include governance, secret scan,
  typecheck, lint, 74/74 test e build: PASS. Primo controllo anche su Node26.8.1,
  risultato autorevole ripetuto con la versione pin. git diff --check PASS.
- Admin: verify (lint/typegen/tsc/security/build) PASS; test foundation 998 totali,
  996 PASS / 2 skip canonici; focused WeChat004+009 9/9; paging checker PASS;
  UI smoke Chromium48/48. Primo foundation falliva per due riferimenti Win7
  assenti nel checkout locale e due assert di governance durante EXECUTION;
  rerun dopo handoff REVIEW con reference worktree clean esistente fea70fa7,
  REQUIRE_WIN7POS_REPO=1, PASS. Nessuna modifica a Win7POS.
- Security review manuale del diff e supporto: tutte le 7 sorgenti Mini e la
  sorgente gateway Admin, oltre ai test nuovi/modificati, esaminate. Tracciati
  session generation, scope shop, timer, cache, idempotenza outbox, immagini,
  limite envelope, ordine cursor/apply/save. Nessun nuovo P0/P1 individuato;
  no Deep Security Scan, nessun claim di scan plugin/indipendente.
- npm audit Admin: tre advisory transitivi preesistenti (browserslist high,
  qs e @xmldom/xmldom moderate); lockfile/dependency non modificati. È un limite
  preesistente distinto dal risultato del diff, non un audit globale pulito.
- Native suites: NOT_RUN, sorgenti native invariate. Live DevTools/UI/device:
  NOT_RUN, prerequisiti ufficiali assenti. Database pgTAP locale: NOT_RUN in
  questa esecuzione, nessuna migration/RPC modificata. CI PR Admin: pgTAP
  **2.627 test / 48 file PASS** su database effimero, nessun apply allo staging.
  Foundation CI985 PASS+13 skip (reference repository assenti nel runner e skip
  canonici), UI48/48 PASS; il run locale con reference esegue996+2skip.
- Deploy: NOT_RUN intenzionale. Flags OFF, nessuna sessione reale per smoke del
  nuovo gateway e staging141 vs repository143 migration. Un deploy di main
  allargherebbe il cambiamento a lavoro commerce successivo; nessun apply o
  deploy ripetuto per ottenere una falsa parità staging.

## 7. Integrazione e stato finale

Integrazione normale completata il 2026-09-07, senza force push o bypass:

| Repository | Commit applicativo | PR / head verificata | Main locale = origin/main dopo merge applicativo |
|---|---|---|---|
| Mini | 5c744be6a45b123293a37b0d4c7100b33c296398 | [PR8](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/8), stessa head | 2e1c3fce162f2527aaf2f58dc5770e76e712e531 |
| Admin | 704efde50baa4a7257ef11f5844573d0b3b0bf4c | [PR101](https://github.com/XNIW/merchandise-control-admin-web/pull/101), head5739452ccb761536a406d301bf17b6e4fae9cb49 include riferimenti governance | ffafd55e4f10044c0724596871d39117122160f1 |

Mini [CI PR](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/34137603673)
e [CI main](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/34137674497)
PASS. Admin [CI PR](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34137645321)
e [Cloudflare build/smoke PR](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/34137645348)
PASS sulla head5739452c. Deploy e TASK-094 staging E2E correttamente SKIPPED:
richiedono un trigger dedicato; nessun gate disabilitato. La vecchia build PR
704efde5 è stata cancellata perché superata dalla head5739452c, poi verificata
integralmente. Admin main riallineato con fast-forward del checkout pulito;
worktree di esecuzione conservato pulito sulla head5739452c.

Android locale c21de310c0a717f481a79d938888cbb99e8f930c / remoto main
d7c4953c4ed6bc2a33cc5dbfd009eb862f70feac; iOS locale
c55e3a93449c4f432bf28f4d7b1f5ac1e5f9b502 / remoto main
30d226d0fb9b8679a1dd034c6e82319645337f22. Ricontrollati dopo i merge:
modifiche locali iniziali preservate, nessun riallineamento dei checkout dirty.

Il closeout documentale Mini segue una PR separata da questa baseline; non cambia
il codice applicativo. La consegna finale riporta la SHA successiva del report
senza tentare di incorporare in un commit la propria SHA.

Worker resta 38272504-ca78-4bcb-8553-ae7463ae1e64; non viene
presentato come il nuovo main. Feature generali e linking restano OFF per default;
endpoint status staging conferma tutte le quattro superfici false, nessun
binding WECHAT e nessuna allowlist test attivata. Produzione invariata.

## 8. Unico pacchetto esterno e punto di ripresa

Riutilizzare `/Users/minxiang/Projects/_codex-private/wechat-007/OPERATOR-ACTIONS.md`:
contiene portale, percorso UI verificato o NON_VERIFICABILE, campo, valore pubblico,
dato operatore e prova redatta. Nessun aggiramento del divieto open.weixin.qq.com,
anche dopo apertura manuale; nessun bypass TLS/certificati/domains.

Raccomandazione bridge: qualificare Tencent OneID, che documenta separatamente
[Web/mobile](https://cloud.tencent.com/document/product/1441/68675),
[wx.login](https://cloud.tencent.com/document/product/1441/68677),
[discovery](https://cloud.tencent.com/document/product/1441/64402) e
[JWKS](https://cloud.tencent.com/document/product/1441/64397). Compatibilità
nonce/rotazione/subject/linking non provata; nessun tenant creato o costo accettato.
Prezzo applicabile non verificabile, preventivo necessario. Alternativa Authing:
[V3](https://api.authing.cn/) documenta mobile/Mini e id_token;
[listino](https://www.authing.com/pricing) Essential139/Professional1299 RMB/mese
per1.000 attivi, entitlement specifico da confermare. La proposta nell'ADR Admin
ammette solo un adapter vendor tipizzato: non rimuove nonce o Supabase canonico.

Sequenza di ripresa: decisione/tenant approvato e inventario AppID; qualificazione
issuer/discovery/JWKS/rotazione/aud/nonce/sub/callback; adapter approvato e secret
store; Mini wx.login reale; letture e isolamento; catalog writes; Web/Android/iOS
separati; linking per ultimo. Il callback WeChat→bridge è ancora mancante;
bridge→Supabase usa l'URL mostrato da Supabase, distinto da Admin/auth/callback.
Owner: operatore per registrazioni/tenant/device; reviewer Admin per ADR;
Codex per adapter/test soltanto dopo questi prerequisiti. Nessuna ripresa in
background promessa o automazione creata.
