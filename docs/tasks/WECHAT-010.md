# WECHAT-010 — Test-account domains and first-live prerequisites

## Checkpoint corrente — 2026-09-29 01:05 UTC

WECHAT-010 **EXECUTION**. Mini PR42 integrata `c6630e06`, CI head/main SUCCESS;
Sales/layout e prove DevTools precedenti conservati. Paging catalogo FAIL autentico:
trasporto OpenNext corrompe il plus del cursor; SQL ordina timestamp DESC/id ASC
ma filtrava entrambi DESC. Delta Mini usa una sola famiglia di cursori per sort,
preserva microsecondi e cursore testuale vuoto; quattro regressioni, verify208PASS,
due review indipendenti APPROVED. Correzioni Admin SQL/trasporto revisionate;
ritest autenticato dopo distribuzione ancora richiesto.
Admin PR115 normalizzazione History integrata `46466364`, CI post-merge SUCCESS;
nessuna applicazione TEST o normalizzazione dati attestata a questo checkpoint.
Android PR10 integrata `1bf758dd`; iOS firma canonica ripristina persistenza login.
Entrambi i client diagnosticano il rifiuto `checkpoint_resource_exceeded` attuale;
convergenza non ancora superata. Matrice/report distinguono runtime, test isolati,
misure e residui. Nessun DONE o readiness del pilot.

## Checkpoint storico — 2026-09-28 19:20 UTC

WECHAT-010 **EXECUTION**: cleanup immagini run PASS tramite percorso canonico;
Sales concorrenza/privacy/paginazione e testi/layout corretti, verify204PASS e
review indipendenti2/2 APPROVED. Ritest DevTools quattro lingue/30giorni PASS;
ultimi layout Account/archiviati e integrazione remota in corso.
Android R-A05 ora classifica il rifiuto canonico; recovery ancora fermo su16
History TOAST compresse. iOS richiede artefatto TEST con firma Keychain corretta,
login e persistenza autentici da ritestare; dati locali preservati.
Matrice e report canonico distinguono ogni residuo. Nessun DONE/pilot readiness.
Gli stati datati sottostanti sono checkpoint storici, non lo stato corrente.

## Mandato corrente — 2026-09-28, chiusura funzionale cross-client

WECHAT-010 torna in **EXECUTION** per il mandato esplicito di completamento:
ADB, XCTest/XCUITest/simctl e DevTools autorizzati; correzioni dimostrate in
Mini/Admin/Android/iOS, commit, push, PR e merge con gate verificati. TEST soltanto.
Il blocco di autorizzazione degli strumenti alternativi è risolto.

Matrice operativa unica: [WECHAT-010-COMPLETION-MATRIX](../testing/WECHAT-010-COMPLETION-MATRIX.md).
I PASS precedenti restano validi per i componenti invariati; storico e prove nuove
sono distinti. La chat «Correggi sync e parità Android/iOS» mantiene la scrittura
nei client nativi, con coordinamento esplicitamente autorizzato dall'utente.
Questo writer cura Mini/Admin e il collaudo autenticato sui simulatori dedicati.
Nessun DONE, pubblicazione o readiness del pilot dedotti dai soli test automatici.

## Stato al 2026-09-28 17:15 UTC — offline e catalogo multilingua verificati

Il recupero offline sulla stessa schermata è PASS in DevTools: feedback Saved,
coda vuota, una sola scrittura causale e sessione valida al controllo finale.
La correzione del layout catalogo è integrata con PR39, merge `ec62e47b`:
review indipendenti 2/2 APPROVED, verify 191 PASS, CI head e main SUCCESS.
La build TEST `83eec45d` è stata osservata nel simulatore con configurazione invariata.

Il nuovo collaudo autenticato del catalogo termina con quattro casi
OPERATOR_OBSERVED (zh-Hans, en, es, it): titolo nativo, contenuti e cinque tab
localizzati, icone leggibili, codici lunghi a capo, placeholder stabile e prezzo
entro la scheda. Zero intenti di scrittura e zero eccezioni runtime; report
aggregato PARTIAL, distinto dal precedente tentativo FAIL conservato.
Non è una prova completa di tutte le schermate nelle quattro lingue.

WECHAT-010 resta in REVIEW, con blocchi esterni per convergenza nativa e telefono;
restano inoltre le coperture runtime specifiche elencate nella matrice A–G e le
misure prestazionali. CODE_COMPLETE limitato ai delta approvati,
LIVE_VALIDATED parziale, PHONE_VALIDATED NO, PUBLIC_RELEASE_READY NO; nessun DONE.
Evidenze e limiti sono nel report canonico `docs/testing/WECHAT-010-REPORT.md`.
Gli aggiornamenti datati sottostanti conservano gli stati storici delle singole prove.

## Aggiornamento 2026-09-28 — recupero offline PASS, correzione layout catalogo

Prova autentica16:52UTC completata con sessione valida fino al controllo finale:
stessa pagina, rete none→wifi, stessa operazione/chiave/corpo, una sola scrittura
causale confermata e History7→8. Modulo Saved, dirty=false, errore vuoto, outbox0;
checkpoint VERIFIED,1caso PASS. Report precedenti FAIL preservati; nessun replay.
Build4519388b/config37d94cf; Worker beb94e1e e registry145 invariati.

Prima verifica lingue interrotta senza PASS: il runner cambia scheda prima della
conferma osservabile dell'evento lingua. Con eventi separati, cinese/tab/titolo
catalogo risultano corretti. Difetto distinto riprodotto: codice lungo comprime
la miniatura e spinge il prezzo fuori dalla scheda. Delta circoscritto in EXECUTION:
miniatura stabile, testo a capo e prezzo sotto i dettagli nella colonna prodotto.
Nessuna modifica a importi, traduzioni, capability o richieste server.
Verify191PASS; review/integrazione e ritest visivo post-layout ancora pendenti.
La prova completa4lingue, convergenza nativa, telefono e p50/p95 restano aperti.
LIVE_VALIDATED parziale; nessun DONE o PUBLIC_RELEASE_READY.

## Aggiornamento 2026-09-28 — feedback Saved osservato, accettazione ancora parziale

Build TEST4519388b ricompilata in DevTools ufficiale2.02.2609232; accesso WeChat
riuscito sul solo account/shop autorizzato. Worker beb94e1e e registry145 verificati
senza drift; config37d94cf invariata. Nessuna modifica applicativa in questa ripresa.

Prova offline post-fix: stesso modulo, controllo rete reale none→wifi, coda drenata,
prodotto aggiornato e History6→7. Screenshot mostra Saved; lettura UI successiva:
dirty=false, saving=false, errore vuoto e outbox0. Il controllo finale alle14:10:36UTC
rileva sessione scaduta: report originale FAIL/UI_SCOPE_CHANGED,0casi PASS preservato.
Riconciliato soltanto l'effetto osservato; operationId originale non attestato e
nessuna promozione retroattiva del caso. Vietato reinviare la scrittura già applicata.

Primo tentativo GUI interrotto prima del save (0intenti); timeout coordinamento
portato a180s, cleanup rete consentito anche dopo perdita scope e verificato.
Nuova prova distinta richiede almeno600s di sessione, suffisso diverso e conserva
operationId/hash payload. Due review indipendenti APPROVED;35test mirati PASS.
Accesso rinnovato alle14:16UTC; Mac nuovamente bloccato al controllo rete intorno alle14:18UTC.
Anche questa prova termina prima di offline/save con0intenti, nessun nuovo esito
business. Bozza non inviata da annullare alla ripresa; report/fixture conservati.
Owner del blocco OS: utente; sblocco manuale, poi nuova prova circoscritta revisionata.

Verify191PASS (110TS+81MJS), inclusi governance/privacy/segreti/typecheck/lint/build;
diffcheck PASS. Dettaglio inglese osservato con codici e pulsanti contenuti; la
verifica visiva completa nelle quattro lingue resta NOT_RUN_OS_LOCKED. Icone5/5 e
immagini3operazioni DevTools restano le prove precedenti; nessuna nuova attestazione
telefono, convergenza Android/iOS o p50/p95. LIVE_VALIDATED parziale;
PHONE_VALIDATED NO, PUBLIC_RELEASE_READY NO. REVIEW/BLOCKED_EXTERNAL; nessun DONE.

## Aggiornamento 2026-09-27 — offline e lingue integrati, ritest bloccato dal Mac

Fix feedback offline integrato con PR35: head 36ad793, merge 71d5f117,
review indipendenti 2/2 APPROVED sulla patch b99e339d. Verify 187 PASS;
CI head 36289794509 e CI main 36289849010 SUCCESS. Build TEST verificata
sui tre soli file outbox/form, config invariata; manifest aa822774.
Il nuovo ritest una tantum sync-offline-feedback è revisionato (32 test PASS),
ma il Mac si è bloccato nuovamente: ricompilazione e prova post-fix NOT_RUN_OS_LOCKED.
Owner utente, sblocco manuale richiesto; nessun aggiramento del blocco OS.

Controllo usabilità: titoli nativi Home/Account/Sales/dettaglio vendita non
seguivano la lingua; etichette di conferma come Reintentar, Restaurar o Ripristina
superano il limite nativo già riprodotto sulle immagini; codici lunghi debordano
dalla scheda prodotto. Delta circoscritto: titoli localizzati, conferma breve
comune alle quattro lingue con descrizione completa invariata, aggiornamento
messaggi pending al cambio lingua, a capo di codici/CTA nel dettaglio.
Nessuna modifica a capability, consensi, dati finanziari, privacy o configurazione.
Verify 191 PASS (110 TS + 81 MJS); quattro regressioni aggiunte e harness nativi
aggiornati. La review ha esteso il controllo al logout con pending: etichette
spagnole Guardar/Eliminar entro limite, scelte distinte e test del consenso.
Delta lingue integrato con PR36: head49c5225, merge70cec1bd; due review APPROVED
sulla patch e7557b8e, CI head36290284596 e main36290330031 SUCCESS.
Build TEST03:04UTC: dieci file previsti aggiornati, configurazione byte-identica,
manifest completo4519388b verificato. Runner feedback/locales approvato2/2 con
32test PASS; nuova build non ricompilata nel simulatore per il blocco OS.
Il collaudo visivo autenticato nelle quattro lingue resta NOT_RUN_OS_LOCKED.

Restano tre operazioni immagini DevTools PASS e icone 5/5 verificate; due cleanup
immagini pending nell'ultimo readback. Offline backend applicato esattamente una
volta; feedback post-fix ancora da collaudare. Android/iOS restano bloccati nei
rispettivi recovery già documentati, senza modifiche ai sorgenti nativi.
CODE_COMPLETE limitato ai delta revisionati, LIVE_VALIDATED parziale,
PHONE_VALIDATED NO, PUBLIC_RELEASE_READY NO; nessun DONE.

## Aggiornamento 2026-09-27 — immagini completate in DevTools, feedback offline in correzione

Dopo lo sblocco e la ricompilazione della build PR34, riaccesso WeChat riuscito.
Sostituzione da galleria e rimozione completate attraverso le conferme native.
Insieme al precedente caricamento camera, sono tre operazioni immagini PASS con
readback indipendente. Screenshot reali verificano orientamento e miniatura;
UI finale senza immagine primaria, pending o outbox. Le sorgenti camera/galleria
sono picker DevTools della fixture: nessuna prova su fotocamera o telefono fisici.
SELECT 02:29:09 UTC: tre intenti/versioni; precedente failed e versione camera
superseded hanno cleanup pending, versione galleria removed ha cleanup complete.
Nessuna cancellazione Storage forzata; report originali e fixture preservati.

Prova offline tramite controllo rete nativo del simulatore: stato none verificato,
stessa pagina, ritorno WiFi senza navigazione o pulsante Sync. Stessa operazione
ritentata con chiave/corpo invariati; un solo aggiornamento canonico e History da
5 a 6 eventi. Il modulo però resta dirty con errore Offline dopo il successo:
backend PASS, feedback UI FAIL; il percorso complessivo non è ancora accettato.
I 7 ms del runner partono dopo la ricevuta di coordinamento GUI, non dal ritorno
rete: esclusi dalle misure di latenza reale e da p50/p95.

Delta circoscritto in EXECUTION: osservazione read-only della ricevuta completa
dell'intento, rilettura prodotto autorizzata e aggiornamento dello stesso modulo.
Nessun successo dedotto dalla sola coda vuota; tutte le fasi devono essere
confermate. Callback tardive recintate per sessione/shop/visibilità/caricamento;
nessun nuovo invio o navigazione automatica dal callback di recupero.
Sette regressioni aggiunte, verify 187 PASS (110 TS + 77 MJS), inclusi governance,
privacy, secret scan, typecheck, lint e build; diffcheck PASS. Review indipendenti,
integrazione e ritest autentico post-fix ancora pendenti. Corretto finding P2
della review: la rilettura conserva la distinzione tra diniego, offline e timeout. Restano convergenza nativa, lingue e telefono; nessun DONE.

## Aggiornamento 2026-09-27 — primo upload immagini autentico riuscito

Dopo lo sblocco, build PR32 ricompilata e login WeChat distinto completato.
images-jpeg sul manifest529dd790: fotocamera del simulatore → picker reale della
fixture → anteprima principale/miniatura → conferma → upload/finalize PASS.
SELECT indipendente02:17:44UTC conferma2intenti/2versioni: la nuova è ready e
finalizzata, primaria del prodotto; la precedente failed/cleanup pending resta
preservata. Screenshot verificano freccia verso l’alto, geometria e miniatura.
È prova DevTools, non fotocamera fisica o accettazione telefono.

Il report originale del run resta FAIL: la successiva sostituzione galleria non
mostra la conferma. Diagnosi dell’API ufficiale con le opzioni reali della pagina:
`showModal:fail confirmText length should not larger than 4 Chinese characters`.
Il secondo intento è riconciliato senza ulteriore scrittura; UI senza pending,
outbox o busy. Nessun replay del primo upload.

Fix circoscritto: etichetta breve di conferma immagini nelle quattro lingue,
contenuto completo invariato; errori nativi gestiti e doppio tap bloccato durante
la conferma. Verify 180 PASS (110 TS + 70 MJS), due review indipendenti APPROVED
sulla patch 380f3781. PR34 integrata: head fed196b, merge a68bd286; CI head
36288360907 e CI main 36288419063 SUCCESS. Build TEST aggiornata nei soli due
moduli locali/dettaglio, configurazione byte-identica, manifest f7182cca verificato.
Runner images-confirmation revisionato da entrambi i reviewer dopo la correzione
del controllo contesto successivo al readback; 28 test PASS. Riprende solo
sostituzione/rimozione, senza replay del caricamento camera.

Mac nuovamente bloccato prima della ricompilazione DevTools: ritest immagini
NOT_RUN_OS_LOCKED; owner utente, sblocco manuale richiesto dal controllo UI.
Restano 17 letture/13 casi catalogo PASS, primo upload camera DevTools PASS,
icone 5/5; offline/convergenza/telefono aperti. Nessun DONE. Note sotto storiche.

## Aggiornamento 2026-09-27 — icone e correzione JPEG integrate

Le5icone tab e i rispettivi stati selezionati sono verificati nel runtime autentico
su main28c9d3b (PR31). Le diagnosi PREVIEW_ONLY sono annullate e riconciliate:
SELECT01:25UTC conferma1intento/1versione failed, cleanup pending, nessuna primaria.
Identificato APP2 ICC sRGB identico al profilo Skia verificato, aggiunto dalla
compressione nativa a main e thumbnail.

Correzione integrata con PR32: head16a6d80, mergef070a5a, due review indipendenti
APPROVED sullo snapshotd071d6a7.178test locali PASS (110TS+68MJS), CI PR36286588193
e CI main36286645051 SUCCESS. Validator Admin invariato accetta i due JPEG
normalizzati. Build TEST preparata01:49UTC: config byte-identica, cambiano solo
4moduli immagine; manifest529dd790 validato dal runner revisionato (24testPASS).

Mac nuovamente bloccato: ricompilazione DevTools e upload autentico post-fix
NOT_RUN_OS_LOCKED; owner utente, sblocco manuale già richiesto. Nessun nuovo PASS
immagini/telefono.17letture/13casi catalogo e icone5/5 restano PASS;
offline/convergenza nativa restano aperti. Nessun DONE. Ricevute precedenti storiche.

## Aggiornamento 2026-09-27 — icone e ritest immagini

Dopo lo sblocco, ricompilazione ufficiale e login WeChat autonomo eseguiti.
Il ritest images-lifecycle supera preparazione/anteprima, poi fallisce
IMAGE_UPLOAD_ERROR. SELECT indipendente:1intento e1versione failed con
jpeg_metadata_forbidden, cleanup pending, prodotto senza immagine primaria.
Tentativo riconciliato come fallimento con cleanup pendente, non NO_WRITE o PASS.
Una diagnosi successiva PREVIEW_ONLY è fermata nel picker dal nuovo blocco del Mac;
prima di proseguire occorre annullarla e riconciliarla, senza confermare upload.

L’utente chiede verifica icone: UI e app.json confermano assenza delle5icone tab.
Delta circoscritto:10PNG locali normali/selezionati, generator asset opzionale e
copia PNG nella build. Verify155PASS e controlli formato/copia asset PASS;
verifica visiva nel runtime aggiornato ancora da eseguire dopo review/integrazione.
Mac bloccato di nuovo: owner utente, sblocco OS manuale richiesto; login autonomo
già autorizzato. Restano17letture/13casi catalogo PASS; nessun nuovo PASS immagini,
telefono o convergenza. Le ricevute datate precedenti restano storiche.

## Ricevuta precedente 2026-09-26 — collaudo parziale e sync verificato

Pairing e login personale distinto verificati. DevTools: 17 scenari lettura e
13 casi catalogo PASS con SELECT indipendenti; le stesse 5 fixture conservate.
Rinomina e sostituzione/archiviazione di categoria e fornitore completate;
History del prodotto coincide con 5 audit canonici. Fix sync Admin PR114
verificato nel runtime: checkpoint 200 e watermark 12425→12430 concorde con
gli eventi dello shop. Offline e convergenza Android/iOS restano non attestati.
Auth Mini e mutazioni ON solo per il target TEST; enrollment/altri flag OFF.
Registry 145, Worker beb94e1e e codice runtime a805d640 invariati.
Immagine selezionata nel picker reale ma fallita prima dell’anteprima: zero
intent/versioni backend, journal riconciliato NO_WRITE, report FAIL preservato.
Debugger: buffer nativo cross-realm rifiutato da instanceof. Fix PR28 integrato,
152test e CI verde; nuova build TEST caricata con riaccesso autonomo.
Il ritest reale rileva un secondo difetto: picker hide/show invalida l’anteprima
prima della conferma. Diagnosi NO_WRITE riconciliata; fix lifecycle PR29 integrato
60392f8d con155test e CI/head/main PASS. Build TEST modifica soltanto il dettaglio
prodotto, config invariata; nuova ricompilazione DevTools/ritest ancora necessari.
Android: recupero UI fallito con rollback per device identity mancante dopo
verifica cache vuota; iOS: decoder catalog e gate storia compressa bloccano
il recupero. Accessi Google validi; sorgenti e dati ordinari nativi invariati.
L’utente autorizza il riaccesso WeChat autonomo dopo scadenza e le operazioni
autonome nel perimetro TEST; riaccesso UI riuscito. Mac bloccato di nuovo alle18:40UTC:
BLOCKED_EXTERNAL runtime, owner utente, sblocco OS manuale richiesto dal controllo UI.
Nessun DONE; codice revisionato e integrato, accettazione runtime ancora incompleta,
LIVE_VALIDATED parziale, PHONE_VALIDATED NO. Il report canonico dettaglia i residui.
Le sezioni datate precedenti sono storiche.

## 2026-09-25 — Residui immagini in REVIEW, accettazione BLOCKED_EXTERNAL

Nuovo delta circoscritto: anteprima e permessi, tutte50miniature, rinnovo URL limitato,
replay upload parziale/finalize incerto e revalidation temporanea. Root unico writer,
due reviewer read-only;149test Mini e1030Admin PASS/2skip,41pgTAP immagini e concorrenza
SQL isolata PASS. Review approvate, PR20/109 integrate e release staging selettiva verificata.
Mac tornato accessibile: nuova build verificata DevTools OFF5/5, senza sessione/shop;
nessuna accettazione business o telefono. Stato
corrente e matrice A–G nel [report canonico](../testing/WECHAT-010-REPORT.md). Input protetto AppSecret
ancora assente; nessuna prova business/telefono e nessun DONE. Note precedenti storiche.


> Stato operativo corrente2026-09-25: [report canonico](../testing/WECHAT-010-REPORT.md), matrice locale/DevTools/telefono separata. Il resto delle note datate precedenti è storico. Mandato TEST14settembre valido; rotazione NOT_PERFORMED/ACCEPTED_FOR_TEST_ONLY. Integrazione funzionale e release staging OFF completate; nessun DONE/live implicito.

## 2026-09-25 — Functional delta in REVIEW; authentic acceptance BLOCKED_EXTERNAL

F01–F07 fixes and selective OFF release are integrated; two independent read-only reviewers approved the application/runner deltas. Canonical report contains exact CI/source/Worker/migration receipts. External owner: user, protected TEST credential input via the already authorized installer, then personal pairing gestures. Binding absent; no authentic business/phone acceptance or DONE. Work still possible without that input is limited to already documented local checks and preparation, completed this session. Historical entries below are not current status.

## 2026-09-14 — Current TEST credential explicitly authorized

The user's latest mandate supersedes the former rotation-before-testing rule only
for the existing designated TEST AppID, staging Worker and singleton profile/shop.
State: EXECUTION. Add an explicit exposed-credential authorization grant and distinct
server-only/actually-verified readiness states. Keep rotation NOT_PERFORMED and risk
ACCEPTED_FOR_TEST_ONLY, retain normal replacement and V1 OIDC gates, and reject absent
authority or mismatched target, protocol, AppID and allowlists. No fake exchange PASS
is required to enable first enrollment; readonly still requires real pairing/exchange.
Protected input, actual Worker version/binding verification, independent delta review
and normal checks/CI/integration are authorized. No new user approval is needed for
this scoped decision; a missing physical secret entry remains a separate handoff.

Historical scope below is superseded only where this explicit amendment applies.

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

## 2026-09-12 - Explicit native privacy and direct Mini mandate

WECHAT-010/TASK-159 continues in EXECUTION. The operator designates the existing
private profile and TASK068E_260618231325 as pilot target; current canonical
identity, active membership/shop and shop_owner role were rechecked read-only.
This does not prove native clients use the same shop. No impersonation.
Authorized: shared/versioned native privacy available without Auth; explicit
Mini-only code2Session architecture revision, secure initial pairing to the
existing profile, opaque sessions and restricted authorization, additive reviewed
migrations if required. OneID remains paused. OIDC guarantees for other surfaces
remain unchanged. Root sole writer in both existing isolated worktrees; at most
two independent read-only reviewers. No production or activation before proof.
Prior narrower scope is superseded only by this explicit amendment.

## 2026-09-12 — Native privacy and Mini direct implementation

User mandate supersedes OneID-only and H5-only dependencies for Mini. Existing designated pilot verified; no further shop choice. Shared native policy, explicit code2Session protocol, two-consent pairing, opaque sessions and session-derived business/Storage RPCs implemented. Root only writer, two reviewers approved the initial design; implementation findings corrected and exact final review pending. Mini 98+3 tests, Admin foundation1013 PASS/2 expected skips, component browser2 PASS, direct SQL53 PASS; isolated staging141 plus additive migration validated, no commerce migration. Worker-local HTTPS uses intercepted upstream, live credential/login NOT_RUN. OneID paused. REVIEW, no DONE. Canonical report lives in Mini docs/testing/WECHAT-010-REPORT.md.
