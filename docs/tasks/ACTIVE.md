# Active task

## Checkpoint corrente — 2026-10-01 23:22 UTC

Mini PR45 integrata su `305e175f`, CI head e post-merge36935600832 SUCCESS;
runtime v9 ancora invariato. Cinese, inglese e spagnolo: sette casi read-only
ciascuno concordano con SELECT indipendente (ricerca, filtri, prezzi e History).
Italiano non concluso: due tentativi login terminati in errore generico senza
sessione, uno intermedio riuscito; causa del transiente non attribuita.

Riprodotto difetto distinto Home: dopo login fallito senza sessione il pulsante
Retry chiama refresh senza shop e non fa nulla. Fix circoscritto mantiene Sign in
sulla stessa schermata, azzera valori precedenti e conserva il messaggio;
stati autenticati e gate specifici invariati. Tre nuove regressioni; verify217PASS,
due review APPROVED artifact `172917cb`; integrazione/ritest del fix pendenti.

Admin History PR120 integrata `b162f23d`, CI head/main SUCCESS. Apply TEST
respinto atomicamente dal guard ACL: il checkpoint TEST possiede già EXECUTE
service_role oltre a postgres/authenticated, mentre il clone locale ha due voci.
Snapshot22:53:55 conferma registry148, helper assente, funzioni/dati/eventi
invariati. Nessuna History applicata; adeguamento del solo guard in revisione.
Performance TEST20261001220355 resta applicata e verificata. Artefatti nativi
finali verificati per hash/firma, non ancora installati su questa lane.
Pending/telefono dipendono ancora dal controllo grafico; convergenza, misure e
smoke finale restano aperti. EXECUTION, nessun DONE o readiness del pilot.

## Checkpoint storico — 2026-10-01 22:28 UTC

WECHAT-010 resta in **EXECUTION**. Mini main `dea3203f` (PR44, CI post-merge
SUCCESS), runtime v9/configurazione TEST e Worker `bdd42368` invariati. Admin
PR119 integrata su `4532831b`, CI head/main SUCCESS. Migrazione performance
applicata una volta alle22:03:55UTC come `20261001220355`: registry148,
metadati/ACL/OID, trigger, altre funzioni e fingerprint dati/eventi invariati.
Il miglioramento prestazionale è misurato localmente; nuovi campioni runtime
e recupero nativo non sono ancora accettati.

Diagnosi scoped: tre History ISO UTC/millisecondi valide per i client erano
rifiutate dai predicati recovery; nessuna riscrittura business. Delta Admin
PR120 in integrazione dopo due review APPROVED,184+365pgTAP e verify PASS;
History SQL non ancora applicata a questo checkpoint. Android/iOS coordinano
la stessa grammatica45vettori; iOS validatore45 PASS. Android R-A06 ripristino
ordinario storage/sessione/UI Connected PASS; recovery resta da ritestare con
gli artefatti finali, senza reset.

Ricerca Mini: input90 unità UTF-16 provoca HTTP400 e messaggio temporaneo
fuorviante; il runner aveva generato una ricerca oltre il limite80. FAIL
originale preservato. Fix prodotti/categorie/fornitori limita input e valore
visibile a80 senza dividere caratteri supplementari; tre regressioni,
verify214PASS e due review APPROVED. Integrazione e ritest del fix pendenti.
Nuovo runner read-only corregge la query; quattro lingue ancora da riconciliare.

Due tentativi pending si sono fermati prima di Save, con zero intenti e rete
ripristinata: nessun PASS di conserva/elimina/scadenza. Il Mac è nuovamente
bloccato al controllo22:22; sblocco manuale già richiesto. Convergenza,
campioni prestazionali, combinazione finale e telefono restano aperti nella
matrice. Nessun DONE, pubblicazione o readiness del pilot.

## Checkpoint storico — 2026-09-29 01:45 UTC

WECHAT-010 resta in **EXECUTION**. Mini PR43 integrata su `c95dacfe`, CI head e
main SUCCESS. Il nuovo delta corregge i titoli nativi Privacy/Eliminazione troppo
lunghi e completa regressioni su conflitti, audit multipagina e ordine eventi:
verify 211 PASS, due review indipendenti APPROVED. Runtime v9: login autentico e
otto viste informative nelle quattro lingue verificati; quattro titoli nativi
ritestati visivamente. Nessuna cancellazione account.

Admin PR116 integrata su `53e58013`, CI main SUCCESS. Worker TEST selettivo
`bdd42368` distribuito e verificato: binding, flag, runtime e scope invariati.
Migrazioni History/keyset applicate, registry 147 con le 145 entry precedenti
invariate. Normalizzazione fisica delle 16 History PASS: hash e revisioni
identici, compressione rimossa, zero eventi aggiunti e zero marker residui.
Catalogo autentico: sette pagine, 350 ID/revisioni esatti contro SQL; sei caricamenti
successivi PASS. Nessun PASS globale di prestazioni o convergenza.

Retry iOS fresco dopo normalizzazione: Connected/outbox0, ma recovery FAIL per
HTTP500/SQLSTATE57014 nel preflight prezzi (8645 ms lato origin). Backend in
diagnosi; nessun nuovo Retry. Il riavvio Android R-A05 ha inoltre riprodotto
SignedOut dopo timeout bootstrap di 10 s, senza prova di credenziali perse;
correzione e collaudo coordinati con il writer nativo. Pending/offline e telefono
restano da completare. Nessun DONE o readiness del pilot.


## Checkpoint storico — 2026-09-29 01:05 UTC

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

## WECHAT-010 — Native privacy and direct Mini execution

- Status: `BLOCKED_EXTERNAL` — authentic TEST acceptance requires protected credential input; integrated delta is in REVIEW (2026-09-25)
- Root sole writer; two independent read-only reviewers.
- Contract: [WECHAT-010](WECHAT-010.md)
- Report: [Single execution and acceptance report](../testing/WECHAT-010-REPORT.md)
- The user designated the existing private canonical profile and TASK068E_260618231325. No further target confirmation required.
- Direct Mini implementation and native privacy delivered for final review; actual Tencent TEST credential/login and business E2E NOT_RUN.
- OneID paused. Auth/enrollment/mutations OFF pending evidence. No self-approved DONE.
- The 2026-09-14 mandate permits the existing exposed credential only for the designated TEST AppID, staging Worker and singleton pilot scope. Rotation is NOT_PERFORMED; risk accepted for TEST only, and actual validity/pairing/business remain independent evidence. Previous rotation-before-testing requirements are superseded in this exact scope.
