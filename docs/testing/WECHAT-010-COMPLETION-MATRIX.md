# WECHAT-010 — matrice di completamento corrente

Mandato 2026-09-28: esecuzione TEST cross-client. Questa matrice è operativa e non
attesta anticipatamente la chiusura. Per le prove storiche si applica il report
canonico; un PASS limitato non copre i residui di altre righe.

Stati: PASS verificato; FAIL riprodotto; NOT_RUN; BLOCKED esterno; N/A motivato;
evidenza storica da riconvalidare. Problemi di runner/strumenti sono distinti dai
difetti applicativi. Le correzioni native sono coordinate con la lane già attiva.

Baseline storica all'avvio del mandato: Mini `5d737c8b`, Admin `fe4907ad`, Android `d7c4953c`,
iOS `30d226d0`. Checkout primari nativi rispettivamente `ca0a58d8` e `c55e3a93`,
con modifiche locali preesistenti preservate. Build correnti da riconciliare prima
dei nuovi PASS cross-client. Runtime TEST/configurazione e fixture sono nel packet
privato già autorizzato; nessuna credenziale nel report.

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
Dettagli nel [report canonico](WECHAT-010-REPORT.md).

## Checkpoint storico — 2026-10-02 15:51 UTC

TEST registry154/postcheck invarianti PASS; PR128 finale7232637b CI verde, aperta.
Recovery iOS154 FAIL locale nonMonotonicOrDuplicateID dopo due checkpoint HTTP200
(5138/4694ms origin),61598ledger ordinate/uniche e baseline persistita valid.
Writer iOS riferisce RED reale/GREEN60 dopo sort lexical; nuova build/review/CI e
recovery autentico pending. Mac sbloccato; Mini login fresco PASS, C04 NOT_RUN.
Serie Mini cold setupFAIL senza misure; v11 runtime NOT_RUN. Nessun DONE.
Dettagli e limiti nel [report canonico](WECHAT-010-REPORT.md).

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

Checkpoint storico01/10 22:28UTC: Mini main dea3203f, runtime v9/config e Worker invariati.
Admin PR119 integrata4532831b; performance TEST applicata20261001220355,registry148,
metadati e dati/eventi invariati. History PR120 revisionata in integrazione, non
ancora applicata. Search90→HTTP400 riprodotto; fix80Unicode-safe214test/review2PASS,
ritest runtime pendente. Due pending tentativi interrotti prima Save/zero intenti,
nessuna accettazione aggiunta; Mac bloccato22:22.

Checkpoint storico29/09 01:45UTC: Mini main`c95dacfe`, Admin`53e58013`, Android`1bf758dd`;
CI post-merge verificata. Runtime Mini v9/config invariata, delta privacy/recovery
revisionato211testPASS. Worker TEST`bdd42368` distribuito, registry147;16History
normalizzate senza contenuti/revisioni/eventi modificati. Catalogo350righe autentiche
concordi con SQL. iOS R-I03finale Connected/restart PASS, nuovo recoveryHTTP500 per
timeoutSQL57014; Android R-A05 coldrestart bootstrapTimeout10s→SignedOut. Nessun
PASS globale auth persistita per Android, recovery o convergenza.

| ID | Requisito | Repository | Stato | Evidenza disponibile | Azione mancante | Accettazione |
|---|---|---|---|---|---|---|
| A01 | Pairing e login personale distinto | Mini/Admin | PASS verificato | Report 26/09, codice auth invariato | Preservare mapping; nessun nuovo pairing | Identità canonica e login distinto |
| A02 | Sessione attuale e rientro dopo scadenza | tutti | PASS auth corrente; expiry pending NOT_RUN | Mini v10 login e retry sulla stessa Home PASS; iOS R-I06 Connected; Android R-A07 restore SDK tardivo validato e UI Connected dopo ripristino DNS | Expiry durante pending e prove residue | Scope esatto e margine sessione sufficiente |
| A03 | Logout/foreground con pending conserva/elimina | Mini | NOT_RUN; accesso UI offline difettoso riprodotto | Sessione valida/pending0 ma logout assente; fix locale219testPASS, runtime v10 invariato | Prova controllata su fixture con checkpoint | Consenso rispettato, pending persistito o eliminato esplicitamente |
| A04 | Cambio account/shop, cache e callback tardive | tutti | PASS isolato Mini; runtime cross-client NOT_RUN | cache-safety/page-session-fencing/catalog context e nuove guardie eventi PASS | Conservare limite isolato; niente account sostituiti | Zero invii o applicazioni tardive fuori scope |
| B01 | Home e vendite readonly, ricerca/dettaglio | Mini/Admin | PASS verificato | 17 scenari autentici precedenti | Conservare evidenze sui byte invariati | Valori e identità concordi con SELECT |
| B02 | Filtri/sort/pagine/errori vendite residui | Mini | PASS verificato (isolato + runtime parziale) | Sales14regressioni PASS;4lingue/30giorni/empty DevTools, patch398cb406; paging100+1 isolato | Dataset periodo vuoto: nessuna creazione finanziaria; conservare limite multipagina isolato | Nessuna mutazione finanziaria; pagine e filtri coerenti |
| C01 | Catalogo CRUD e ciclo archivia/ripristina | Mini/Admin | PASS verificato | 13 casi autentici, cinque fixture | Preservare evidenze | Identità confermate dal server, readback esatto |
| C02 | Fornitori/categorie rinomina e riassegnazione | Mini/Admin | PASS verificato | Readback autentico delle cinque fixture | Preservare evidenze | Riferimenti attivi corretti e tombstone coerenti |
| C03 | Ricerca/paging catalogo e relazioni | Mini | PASS DevTools e paging parziale | v10 nove limiti ASCII/CJK/emoji, widget/modello e nove oracle concordi; sette letture per lingua; paging7×50 e tre sort×150 SQL concordi già validi | Conservare il limite di campionamento, senza dedurre intero dataset o telefono | Nessun duplicato/omissione; contesto stabile |
| C04 | Duplicati, double tap, revision conflict | Mini/Admin | PASS doppio tap DevTools e duplicato; runtime conflict NOT_RUN | 02/10 due tap, una creazione/due prezzi/un audit/una ricevuta, UI e SQL concordi; outbox0; dialoghi conflitto isolati PASS | Conflitto controllato con revisione concorrente e scelta nativa | Nessuna sovrascrittura o duplicazione involontaria |
| C05 | Prezzi CLP/frazioni/legacy e History multipagina | Mini/Admin | PASS isolato e readback multilingua; runtime multipagina NOT_RUN | Prezzi CLP/legacy e paging125→185 isolati; prezzi e History nelle quattro lingue concordi con SQL | Conservare il limite multipagina isolato | Valore persistito invariato; ordinamento e audit esatti |
| D01 | Upload/sostituzione/rimozione DevTools | Mini/Admin | PASS verificato | Tre operazioni, orientamento/thumbnail osservati | Preservare prove | Versioni e primaria corrispondono alla UI |
| D02 | Picker/anteprima annullati e file temporanei | Mini | NOT_RUN | Regressioni locali; diagnosi preview riconciliate | Casi runtime senza mutazione e suite lifecycle | Zero intent involontari e nessun file necessario perso |
| D03 | Upload interrotto/ripreso e identità operazione | Mini/Admin | NOT_RUN | Replay/finalize isolati | Prova bounded di rete/lifecycle e riconciliazione | Stessa key/payload; un solo effetto finale |
| D04 | Cache immagini e miniatura cross-client | tutti | NOT_RUN | Nessuna convergenza autentica | Upload, sostituzione e rimozione osservati su destinatari | Nessuna vecchia immagine dopo invalidazione prevista |
| D05 | Cleanup versioni storiche/Storage | Admin | PASS verificato | 28/09 18:16Z: due versioni complete, quattro oggetti assenti; SELECT indipendente e retry senza scritture | Nessuna; scheduling non richiesto dal contratto manuale TASK-137 | Manifest esatto, primaria nulla, versioni/audit conservati |
| E01 | Offline→online stesso modulo | Mini | PASS verificato | 28/09 16:52; Saved, outbox0, History7→8 | Preservare prova su moduli invariati | Una mutazione causale e feedback coerente |
| E02 | Riavvio con pending e rete intermittente | Mini | NOT_RUN | Journal/outbox e test isolati | Casi runtime nuovi con checkpoint | Pending durevole, invio automatico e zero duplicati |
| E03 | Scadenza sessione durante recovery | Mini | NOT_RUN | Tentativo storico interrotto conservato | Validare recupero con auth reale e test guardie | Nessuna mutazione fuori sessione; rete ripristinabile |
| E04 | Readback negato/temporaneo, errore definitivo | Mini/Admin | PASS isolato; runtime fault NOT_RUN | Readback negato/offline/timeout differenziati, draft preservato e nessun falso Saved | Fault runtime solo se riproducibile senza bypass | Mai falso Saved o perdita draft/pending |
| E05 | Nuove modifiche sul modulo durante recovery | Mini | PASS modello isolato; widget/runtime NOT_RUN | 26helpertest inclusi form compilato: input rifiutato durante pending/readback, nuovo draft dopo completamento | Probe widget e recupero autentico con rete UI accessibile | Risposte vecchie non sovrascrivono input nuovo |
| F00 | Build native corrente, scope e recovery | Android/iOS | FAIL154 Android e iOS; fix in verifica | Android3autoFAIL(count mismatch/SQL57014line910), quarta interrotta e binding/pending conservati; iOS154localeFAIL, R-I07firmata verificata ma CI13FAIL | Correggere cause, verificare CI e nuovo recovery autentico terminale | Autenticazione valida, recovery concluso e dati scoped |
| F01 | Mini → Admin/Android/iOS automatico | tutti | NOT_RUN completo; Admin readback manuale distinto | Creazione C04 Mini/SQL PASS; Admin vede record dopo Reload, nessuna propagazione automatica accettata | Recovery nativa e readback quattro superfici senza refresh | Stesso ID/revisione senza refresh manuale |
| F02 | Admin → Mini/Android/iOS automatico | tutti | NOT_RUN | Nessuna prova autentica completa | Mutazione rappresentativa e readback | Stesso ID/campi, outbox coerente |
| F03 | Android → Mini/Admin/iOS automatico | tutti | NOT_RUN | Recovery da riconvalidare | Mutazione UI nativa con scope verificato | Persistenza e propagazione automatiche |
| F04 | iOS → Mini/Admin/Android automatico | tutti | NOT_RUN | Recovery da riconvalidare | Mutazione UI nativa con scope verificato | Persistenza e propagazione automatiche |
| F05 | Foreground/reconnect/eventi mancanti e pagine | tutti | NOT_RUN | Polling Mini3–30s, checkpoint verificato | Ritorno foreground/rete e recupero cursor | Nessuna perdita eventi; stesso clock osservatore |
| F06 | Eventi duplicati/riordinati/concorrenza/tombstone | tutti | PASS isolato Mini; runtime cross-client NOT_RUN | Nuove regressioni ID duplicati/decrescenti/replay/oltrecheckpoint e tombstone tardive PASS | Concorrenza/tombstone fixture runtime sugli altri client | Idempotenza, conflitti espliciti, nessuna ricomparsa |
| G01 | Cinque icone e catalogo quattro lingue | Mini | PASS verificato | Icone5/5; quattro viste OPERATOR_OBSERVED | Conservare prove sul layout invariato | Titoli/tab/testi leggibili, prezzo contenuto |
| G02 | Altre schermate/dialoghi/errori quattro lingue | Mini | NOT_RUN globale (copertura parziale verificata) | 11pagine4lingue precedenti;8contenuti privacy/deletion canonici;4titoli nativi v9 visivamentePASS | Dialoghi pending/errori e screenshot residui; nessun PASS globale | Cambio lingua completato; nessun testo troncato |
| P01 | Catalogo apertura/navigazione/ricerca/paging | Mini | PASS misure parziali incluse6pagine post-fix | 20warm p50=562/p95=1133ms;10search p50=1021;6paging p50=328,min323,max2321;2HTTP400 storici preservati | Cold/cache e altri sort da caratterizzare; nessun PASS SLA | Inizio/fine app espliciti; soglie canoniche o nessun PASS SLA |
| P02 | Save online e ripresa outbox | Mini | PASS singolo campione Save; serie/outbox NOT_RUN | C04 doppio tap→catalogo1093ms, n1, clock host monotonic, SDK/poll75ms inclusi; SQL successivo escluso | Serie e recupero outbox misurati distintamente | p50/p95 solo con n adeguato, fallimenti inclusi |
| P03 | Convergenza quattro client | tutti | NOT_RUN | Nessun campione autentico | Misurare dal submit osservato al readback finale | Clock unico e nessun refresh artificiale |
| P04 | Upload/sostituzione/visualizzazione immagine | Mini/Admin | NOT_RUN | Picker incluso nelle vecchie durate | Misurare intervallo rete/UI separato dal picker | Payload/ambiente dichiarati e errori conteggiati |
| H01 | Telefono fisico WeChat/hardware/lifecycle | Mini | BLOCKED esterno | Inventario01:13: Android solo emulatore, iPhone fisico Offline; nessuna prova hardware | Owner utente: rendere disponibile telefono autorizzato; prove simulatori continuano | Camera/galleria/permessi/rete reali; nessun PASS simulato |
| I01 | Integrazione e smoke combinazione finale | tutti modificati | NOT_RUN combinazione finale; integrazioni parziali PASS | MiniPR46 07ff35c0, AdminPR127 e0089365, AndroidPR11 0613339 e iOSPR11 2322c5e CI main SUCCESS; runtimev10/Worker3521a945/registry154; PR128/129 aperte CIgreen, iOS13CIFAIL; postcheck154 invarianti PASS | Risolvere budget checkpoint, completare runtime e smoke combinato | origin/main e runtime TEST riconducibili ai sorgenti |
| I02 | Cleanup fixture run e report finale | Mini/Admin | NOT_RUN | Cinque fixture originali e nuova fixture C04 preservate | Dopo readback completati, soli percorsi applicativi sui sei oggetti propri | Nessun oggetto estraneo o diagnostico cancellato |

## Assegnazione della convergenza e misure

F01: Mini modifica nome/prezzo del prodotto run; Admin/Android/iOS verificano ID,
valore e History. F02: Admin crea/modifica una relazione run e la assegna al
prodotto; destinatari verificano relazione e revisione. F03: Android modifica
nome/prezzo, destinatari verificano identità e History. F04: iOS modifica un campo
catalogo e archivia/ripristina una fixture quando capability reali lo consentono;
destinatari verificano tombstone e assenza di ricomparsa. D04 copre immagini in
un ciclo condiviso; non duplica tutte le combinazioni senza requisito.

Criteri tecnici esistenti: WMP-052; WECHAT-009 rapporto righe97–107: pagina50,
immagini batch16, envelope128KiB, polling foreground3–30s. Registrare richieste,
payload e cache dove osservabili senza token o URL firmati; null motivato se lo
strumento non espone il dato. Target storico circa3s non è una garanzia realtime.
Login/prima Home: campione fresco28/09 tap→stato empty13.419ms, n=1, DevTools;
non è p50/p95 né prova di rispetto SLA. Ulteriori campioni separano cold/warm.

| ID | Requisito | Repository | Stato | Evidenza disponibile | Azione mancante | Accettazione |
|---|---|---|---|---|---|---|
| D06 | Scadenza URL immagine/rinnovo limitato | Mini/Admin | NOT_RUN | Test isolati e parity residua | Dettaglio/thumbnail scaduti, scope/version fencing | Rinnovo bounded, versione corrente, nessuna applicazione tardiva |
| P05 | Login e prima Home | Mini/Admin | FAIL setup cold; serie app NOT_RUN | Campioni singoli storici13.419ms e v10 7.964ms, nessuna serie | Serie cold/warm con richieste/cache/errori | Metodo e campioni espliciti; nessun percentile da n=1 |
