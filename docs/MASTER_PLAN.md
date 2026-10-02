# MerchandiseControl WeChat Mini Program — Master Plan

## Checkpoint corrente — 2026-10-02 16:39 UTC

WECHAT-010 resta EXECUTION. Mini runtime v10/configurazione e sei fixture invariati.
Prova autentica senza scritture: Account offline con sessione valida nasconde Sign out;
rete ripristinata Online. Fix locale con guardia sessione e dialogo logout tardivo:
verify219PASS, review/integrazione/ritest runtime pendenti.
C04 Save Admin respinto dal browser per stock1.25/step1: nessun effetto backend;
conflitto NOT_RUN. PR129 stepany ha CI verde, build selettiva TEST in preparazione.
Android154: tre retry automatici falliti (due count mismatch, uno HTTP500/SQL57014
checkpoint line910); quarto interrotto normalmente16:35, pending/binding conservati.
iOS154 resta FAIL locale; nuova build R-I07 verificata ma CI13 fallita, non installata.
Nessuna convergenza completa, misura prestazionale nuova, DONE o pilot attestati.
Dettagli nel [report canonico](testing/WECHAT-010-REPORT.md).

## Checkpoint storico — 2026-10-02 15:51 UTC

TEST registry154/postcheck invarianti PASS; PR128 finale7232637b CI verde, aperta.
Recovery iOS154 FAIL locale nonMonotonicOrDuplicateID dopo due checkpoint HTTP200
(5138/4694ms origin),61598ledger ordinate/uniche e baseline persistita valid.
Writer iOS riferisce RED reale/GREEN60 dopo sort lexical; nuova build/review/CI e
recovery autentico pending. Mac sbloccato; Mini login fresco PASS, C04 NOT_RUN.
Serie Mini cold setupFAIL senza misure; v11 runtime NOT_RUN. Nessun DONE.
Dettagli e limiti nel [report canonico](testing/WECHAT-010-REPORT.md).

## Checkpoint storico — 2026-10-02 04:58 UTC

WECHAT-010 resta **EXECUTION**. Mini main/runtime v10 `07ff35c0` e le sei
fixture sono invariati. Doppio tap DevTools PASS; conflitto, pending, immagini,
recupero nativo e convergenza completa restano aperti.

Admin PR127 è integrata su `e0089365` dopo due revisioni della correzione e
due del successivo allineamento della versione. CI finale del PR: database/pgTAP,
Verify e Cloudflare SUCCESS; CI post-merge36966129161/36966129129 SUCCESS.
Il SQL revisionato è applicato una sola volta su TEST come `20261002044017`,
registry153. Postcheck04:40:41 PASS: precedenti152 entry invariate, solo i due
corpi previsti aggiornati e un nuovo helper privato invoker; OID/ACL esistenti,
altre funzioni, trigger, dati scoped, eventi, immagini e History fisiche invariati.
Il contratto runtime risulta true; il sorgente applicato coincide con la migrazione
SHA256 `e6e3a2631c82e506461c400e16a910f87c8e007ff8ad29a643ce10b3f19af826`.

La correzione evita serializzazioni ripetute nel preflight e nel calcolo byte
dei prezzi, conservando DTO, valori float8, scope, digest, fallback e limite8s.
561 pgTAP e casi di drift/byte/scoping/generic-plan passano localmente. La prova
read-only precedente v6 in6736.758ms resta un diagnostico su nove fasi, non una
RPC autenticata, un percentile o una misura della versione finale con guardie.

L'ultimo esito autentico è **FAIL iOS153**. Unico Retry04:53:59UTC, dopo CI main
verde: checkpoint iniziale HTTP200 origin7664/upstream7446ms, secondo checkpoint
HTTP500 origin8965/upstream8849ms, SQL57014 nell'aggregato prodotti alla riga346.
Termine04:54:16.496144UTC, verifiedConvergence=false/didWork=false. Binding invariato,
journal prepared e mirror pending presenti, wipeCommitted=false; nessun manifest
attivo o ricevuta finale. App terminata normalmente, pending preservato. Android153
NOT_RUN per lo stesso blocco backend; FAIL150–152 conservati. Primo HTTP200 non
equivale a recovery accettata. Diagnosi dei costi consecutivi in corso.
Worker TEST `3521a945-2dbb-4b97-aa8d-ccefae96543e` mantiene il fix di refresh
Admin distribuito03:37, binding/flag/tracing invariati. Il reload dopo deploy
è soltanto smoke del rilascio, non convergenza automatica.

Mac bloccato all'ultimo controllo UI04:56; sblocco già richiesto, da ricontrollare
prima dei dialoghi Mini. Telefono non disponibile nell'ultimo inventario.
Nessun DONE, collaudo fisico o readiness del pilot attestati.

## Checkpoint storico — 2026-10-02 00:27 UTC

Mini PR46 è integrata su `07ff35c0`, con CI head e post-merge SUCCESS.
Runtime TEST v10: 102 file verificati, configurazione invariata. Dopo un errore
reale senza sessione, il login dalla stessa Home riesce al nuovo tap senza
riavvio: correzione del pulsante verificata. Un ulteriore login autentico riesce
in 7.964 ms (singolo campione, non percentile o SLA).

Catalogo italiano: sette letture concordi con SQL; insieme alle tre lingue già
verificate copre ricerca, filtri, prezzi CLP e History nelle quattro lingue.
Nove casi di limite ricerca su prodotti/categorie/fornitori sono PASS DevTools:
ASCII, cinese ed emoji rispettano 80 unità UTF-16 senza spezzare caratteri;
widget, modello e nove oracle SQL concordano. Il primo runner fallito resta
conservato. Nessuna prova di tastiera fisica o localizzazione globale dedotta.

Admin PR121/122 sono integrate su `516b8181`, CI head/main SUCCESS. History v2
è applicata una volta in TEST come `20261001235153`, registry149. Metadati/ACL
esistenti, dati scoped e 2.074 eventi invariati; helper privato e hash verificati.
Preflight reale positivo: 61.595 righe complessive, zero violazioni e nessun
superamento risorse. L'apply v1 respinto resta distinto e non viene riscritto.

Artefatti Android R-A07/R-A08 e iOS R-I06 installati e verificati. iOS conserva
l'accesso; Android recupera automaticamente la sessione dopo la riparazione del
DNS dell'emulatore mediante normale riavvio con gli stessi dati. Nessun nuovo
login Google, reset, cambio DNS o ripristino di snapshot precedenti.
I due recuperi dati falliscono invece realmente: HTTP500/SQL57014 nel calcolo
del digest prezzi del checkpoint (iOS origin8.227ms, Android8.181ms). Nessuna
nuova generazione accettata. Ottimizzazione Admin in esecuzione; limite8s invariato.

Mac ancora bloccato al controllo UI: pending/logout/scadenza e picker restano
NOT_RUN, con sblocco manuale già richiesto. Convergenza, misure residue, smoke
combinato e telefono restano aperti. WECHAT-010 è EXECUTION; nessun DONE o
readiness del pilot. Worker `bdd42368`, fixture e configurazione TEST invariati.

## Checkpoint storico — 2026-10-01 23:22 UTC

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

Matrice operativa unica: [WECHAT-010-COMPLETION-MATRIX](testing/WECHAT-010-COMPLETION-MATRIX.md).
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
corrente e matrice A–G nel [report canonico](testing/WECHAT-010-REPORT.md). Input protetto AppSecret
ancora assente; nessuna prova business/telefono e nessun DONE. Note precedenti storiche.


> Stato operativo corrente2026-09-25: [report canonico](testing/WECHAT-010-REPORT.md), matrice locale/DevTools/telefono separata. Il resto delle note datate precedenti è storico. Mandato TEST14settembre valido; rotazione NOT_PERFORMED/ACCEPTED_FOR_TEST_ONLY. Integrazione funzionale e release staging OFF completate; nessun DONE/live implicito.

## 2026-09-25 — Functional delta in REVIEW; authentic acceptance BLOCKED_EXTERNAL

F01–F07 fixes and selective OFF release are integrated; two independent read-only reviewers approved the application/runner deltas. Canonical report contains exact CI/source/Worker/migration receipts. External owner: user, protected TEST credential input via the already authorized installer, then personal pairing gestures. Binding absent; no authentic business/phone acceptance or DONE. Work still possible without that input is limited to already documented local checks and preparation, completed this session. Historical entries below are not current status.

## 2026-09-14 — Explicit TEST credential exception

WECHAT-010 continues in EXECUTION under the new user mandate. The existing exposed
TEST AppSecret may be used only with the designated staging Worker/AppID and exact
personal tester/shop. Rotation remains NOT_PERFORMED and residual risk is accepted
for TEST only, not resolved or extended to production/public users. Add narrowly
scoped readiness states and retain the ordinary replacement and legacy OIDC paths.
Actual secret installation, Tencent exchange, pairing and business acceptance are
separate evidence. Root remains the sole writer; two independent reviewers maximum.
No application identity, TLS, authorization, session or storage invariants are relaxed.

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

Historical status follows; the amendment above is current.

**WECHAT-010** resta in `REVIEW / EXTERNAL_ACTIVATION_REQUIRED`. Il nuovo link
privacy pubblico e verificato in DevTools con Auth OFF, verify89/89 e review
indipendente APPROVED; H5 rifiutata, business domain assente. Baseline dopo la chiusura
tecnica autorizzata dal mandato WECHAT-011: cinque finding corretti e approvati da
due reviewer indipendenti; Mini PR12 e Admin PR104 integrate, CI verde; release
isolata `91f3d8e5` distribuita come Worker `29d0c715` al 100%, smoke HTTPS OFF9/9.
Mini88/88 e nuova UI DevTools OFF verificate; Auth reale resta NOT_RUN. Credenziale
TEST, qualifica OneID e tester/shop designati restano prerequisiti distinti.
Il report unico governa prove, limiti e ripresa. Nessun DONE globale.

Baseline precedente: **WECHAT-010** era in `REVIEW / EXTERNAL_ACTIVATION_REQUIRED` for manually confirmed TEST-account domains,
AppSecret rotation prerequisites, current staging/DevTools checks and bounded
first-live preparation. Mini 84/84, DevTools domains/OFF audit and four public
runtime probes pass; real Auth remains NOT_RUN. See `docs/tasks/WECHAT-010.md`
and `docs/testing/WECHAT-010-REPORT.md`. Flags remain OFF.

**WECHAT-009** is in `REVIEW / EXTERNAL_ACTIVATION_REQUIRED` for real Auth prerequisite
inventory, verified performance fixes and conditional staging acceptance. See
`docs/tasks/WECHAT-009.md`. No live PASS or DONE is implied.

Historical baseline: **WECHAT-007** was in `EXECUTION` for assisted official registration and live
validation on the user-authorized `SHARED_PUBLIC_STAGING` target. `WMP-047` is
the single active Mini lane with `OPERATOR_ACTION_REQUIRED —
WECHAT_PORTAL_REGISTRATION_PACKET`; WMP-048…052 are ordered. FAST BASELINE and
the restricted operator packet pass, while all AppIDs and real OIDC bridge
values remain absent and every WeChat flag stays OFF. No different production
environment or public application publication is in scope.

**WECHAT-006** is in `REVIEW / EXTERNAL_ACTION_HANDOFF_COMPLETE`; its verified
backup/schema/Worker/native evidence remains historical and is not repeated.

**WECHAT-005** remains historical `REVIEW / CHANGES_REQUIRED`; its external
blockers are superseded only where the WECHAT-006 mandate supplies specific
authorization or new evidence. Its factual gate results are not rewritten.

**WECHAT-004** is `DONE` with classification
`MERGED_CODE_COMPLETE_EXTERNAL_ACTIVATION_REQUIRED` and result
`INTEGRATED_SYNC_POLICY_PARITY_PASS`. Corrective parents **WECHAT-001**,
**WECHAT-002** and **WECHAT-003** retain their historical review states.

This is the source of truth for the Mini Program vision, scope, milestones, tasks, dependencies, risks, and completion criteria. The canonical WeChat identity decision belongs to the Admin Web ADR; this repository consumes it and must not create a competing Auth architecture.

## Vision and boundaries

Deliver a native TypeScript Mini Program that lets a canonical MerchandiseControl personal account consult authorized shops, sales history, catalog/images, categories, suppliers, prices, sync history and account state. Sales, payments, refunds, voids, POS history and staff operations remain read-only. WECHAT-003 additionally permits controlled catalog/product/category/supplier/price/image mutations for authorized personal users, exclusively through the canonical Admin-owned server boundary. The client never owns WeChat AppSecret/code exchange, Supabase migrations, role assignment, direct database writes, trusted audit creation or sync-event construction.

Non-goals include POS staff login, staff/device/role writes, sales/refund/void/payment operations, direct Supabase-table access, platform administration, publication or production rollout. Camera barcode scanning remains excluded. Excel import is `DEFERRED_BY_ARCHITECTURE_DECISION` under WMP-021; no parser or placeholder UI belongs in the Mini Program.

## Cross-repository dependencies

- Admin Web: selected identity/session contract, server boundary, Supabase configuration, canonical migrations, shop-scoped read APIs, mutation services, permissions, audit/outbox/sync and private image Storage boundary.
- WeChat Open Platform: AppID, account association/UnionID eligibility, request domains, privacy configuration, review and approval.
- Supabase: custom OIDC provider and verified official session handoff.
- Android/iOS: behavior and UX consistency; neither defines a separate identity contract.

## Milestones

| Milestone | Objective | Dependencies | Acceptance/checks | Main risk | Status |
|---|---|---|---|---|---|
| M0 | Repository foundation and governance | User authorization | Governance, ledgers, remote/main, one bootstrap commit, secret/diff checks | Independent review pending | REVIEW_READY |
| M1 | Official WeChat technical feasibility | Official docs; WECHAT-001 | Evidence-backed Mini Program constraints and contract fit | External docs/approval unavailable | IN PROGRESS (parent) |
| M2 | Mini Program application foundation | M0, M1 decision gate | Pinned toolchain, deterministic scripts, CI, build | DevTools live proof pending | REVIEW_READY |
| M3 | Secure identity/session integration | Canonical Admin ADR/API | `wx.login` adapter, replay-safe backend handoff, session lifecycle tests | Bridge/device proof pending | REVIEW_READY |
| M4 | Authorized shop selection | M3, shop RPC | Only active authorized shops visible | Live cross-shop proof pending | REVIEW_READY |
| M5 | Daily sales read model | Admin migration/RPC | Correct timezone/currency/net/refunds/pagination | Live financial fixture pending | REVIEW_READY |
| M6 | Dashboard and paginated list | M4, M5 | Loading/empty/error/offline/session states; zh-Hans complete | Visual DevTools QA pending | REVIEW_READY |
| M7 | Automatic refresh/realtime fallback | Runtime feasibility | Adaptive bounded 3–30s polling, stop/resume, backoff | No private invalidation or measured live latency | REVIEW / CHANGES_REQUIRED |
| M8 | Security, privacy, cross-shop validation | M3–M7 | Threat model, secret scan, cross-shop contract tests | External activation gates remain | REVIEW_READY |
| M9 | WeChat DevTools and external activation | AppID/domains/approval/test account | Authorized DevTools/live evidence | External prerequisites | EXTERNAL_PREREQUISITES_REQUIRED |
| M10 | Final review and release readiness | M0–M9 | Full gates, evidence, review decision | Unproven live behavior and global legacy pgTAP crash | REVIEW / CHANGES_REQUIRED |
| M11 | Controlled mutation contract and permissions | WECHAT-003; Admin ADR/service/schema | Typed idempotent revision-guarded service; viewer/shop A-B denial | Canonical ADR/evidence under review | REVIEW / CHANGES_REQUIRED |
| M12 | Product, category, supplier, price and image management | M11; shared text/image contracts | Authorized UX, archive/restore, replacement, price history, private images | Live/visual and full integration evidence absent | REVIEW / CHANGES_REQUIRED |
| M13 | Catalog history and cross-platform convergence | M12; audit/outbox/sync | Safe history projection; complete idempotent events; Android/iOS fixtures | Live convergence unproved | REVIEW / CHANGES_REQUIRED |
| M14 | Excel import decision | Admin canonical import pipeline | Evidence-based thin-adapter gate | Public upload/recovery boundary insufficient | DEFERRED_BY_ARCHITECTURE_DECISION |
| M15 | Remaining Auth, refresh and integrated QA | M3, M7, M11–M14; external activation | Official adapters/bridge, private invalidation or declared fallback, DevTools/full gates | Bridge/iOS provider/AppID/domains/live QA absent | REVIEW / CHANGES_REQUIRED |
| M16 | Opaque Mini session and legacy-sink closure | WECHAT-004; Admin BFF/session migration | No general Supabase bearer; controlled service-only reads/mutations and revocation | External provider activation | DONE |
| M17 | Durable outbox and incremental sync parity | M16; canonical sync_events | Restart-safe ordered outbox, watermark/delta/gap/epoch/reconcile and explicit conflicts | Private push not proven; polling limitation | DONE |
| M18 | Local cross-platform E2E and security closeout | M16–M17; Android/iOS apply engines | Real local Supabase mutation/event/readback, production apply tests, targeted security scan | Staging/device/provider external | DONE |
| M19 | Four-repository GitHub integration | M16–M18; green local gates | Normal PR/CI/merge, post-merge verification, clean published heads | External activation only | DONE |
| M20 | Staging activation and live cross-platform validation | M19; verified non-production environments; official apps/provider/devices | Staging schema/deploy, progressive flags, factual live identity/sync/Storage/sales evidence and closeout | Target is labelled Production/no backup; writer, apps, provider and devices absent | REVIEW / CHANGES_REQUIRED |
| M21 | Shared public staging activation and live closeout | M19–M20; explicit staging designation and writer/deploy mandate | Manual restorable backup, current schema/Worker, official adapters, progressive E2E, normal GitHub integration and factual 54-field closeout | External WeChat registration and physical devices may bound live coverage | REVIEW / EXTERNAL_ACTION_HANDOFF_COMPLETE |
| M22 | Assisted official registration and essential live staging E2E | M21; operator public config; real provider/apps/devices | Operator packet, progressive Auth, official DevTools, essential catalog/image/sales/sync proof, performance and factual closeout | Portal/provider approvals and measured polling defects | EXECUTION |

## Task sequence

WMP-001 through WMP-008 retain their historical `REVIEW_READY` state under WECHAT-001, which now has changes requested. WMP-011, WMP-013, WMP-014 and WMP-015 remain in `REVIEW`; WMP-012 and WMP-016 remain `REVIEW / CHANGES_REQUIRED` under WECHAT-002.

WECHAT-003 and WMP-017…WMP-025 retain their historical `REVIEW` states. WMP-017…WMP-020 and WMP-022 are `CHANGES_REQUIRED`; WMP-021 records `DEFERRED_BY_ARCHITECTURE_DECISION`; WMP-023 records `EXTERNAL_ACTIVATION_REQUIRED / CHANGES_REQUIRED`; WMP-024 records `REVIEW_WITH_LIMITATION / CHANGES_REQUIRED`; WMP-025 is `CHANGES_REQUIRED`. The older unstarted WMP-009/WMP-010 backlog is preserved but superseded in planning by WMP-025 for the expanded scope. None of these older tasks is retroactively promoted to `DONE`.

WECHAT-004 supersedes the repository-controlled blockers without rewriting that
history. WMP-026…WMP-031 are `DONE` after normal merges and post-merge gates.
Auth remains `DONE_CODE / EXTERNAL_ACTIVATION_REQUIRED`, Excel remains deferred
and DevTools/live evidence remains externally blocked.

WECHAT-005 adds WMP-032…WMP-038 without rewriting WECHAT-001…004. The target,
migrations, staging deployment, official runtime and client prerequisites were
fully inventoried; independent Mini/Admin/local DB/Android/iOS gates pass and
official WeChat DevTools is installed. WMP-032…WMP-037 are now
`BLOCKED_EXTERNAL`; WMP-038 and the parent are `REVIEW / CHANGES_REQUIRED`.
No unavailable surface is presented as live.

WECHAT-006 adds WMP-039…WMP-046 under an explicit user mandate that designates
the exact Supabase project and Worker as `SHARED_PUBLIC_STAGING`, authorizes the
stale Admin writer handoff, a restricted manual backup, staging migration/deploy
and normal GitHub integration. Backup, seven migrations, Admin PR/merge, Worker
deploy, Mini automated gates, Android audit/gates and iOS device-free provider
gates are complete. Admin #86/#87 and iOS #7/#8 are merged normally; WMP-042
is in REVIEW. Portal/DevTools/live E2E remain exact external work; all
flags are OFF. The production/publication boundary remains unchanged.

WECHAT-007 adds WMP-047…WMP-052 without repeating the stable WECHAT-006
baseline. WMP-047 is active for operator-assisted application inventory;
WMP-048…052 cover real provider activation, live Auth, official Mini runtime,
essential live E2E, performance and normal GitHub closeout. Direct portal
automation is not attempted, and missing OIDC data never produces an invented IdP.

## Completion criteria

The repository may become release-ready only after the canonical identity contract, authorized shop isolation, financial semantics, controlled catalog mutation permissions/concurrency/idempotency, audit/outbox/sync convergence, private image lifecycle, deterministic build/tests, security review and official WeChat live/DevTools checks are all evidenced. Missing external approval is reported explicitly; it is never replaced by fixture evidence. No task becomes `DONE` without explicit user/designated-reviewer approval.

WECHAT-009: Mini74/74, Admin996+2skip/focused9/UI48 pass; no new P0/P1 in
manual diff review. No live Auth/essential staging PASS, migration or deploy.
See `docs/testing/WECHAT-009-REPORT.md` for the current acceptance matrix.

WECHAT-009 integrazione applicativa: Mini PR8 / Admin PR101 merged normalmente
dopo CI verde; pgTAP2627 e Cloudflare smoke PASS. Report unico aggiornato,
stato REVIEW / EXTERNAL_ACTIVATION_REQUIRED; staging e produzione invariati.
