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

Checkpoint01/10 22:28UTC: Mini main dea3203f, runtime v9/config e Worker invariati.
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
| A02 | Sessione attuale e rientro dopo scadenza | tutti | PASS parziale; expiry pending NOT_RUN | Mini v9 login autentico; iOS restart Connected; Android R-A06 storage presente/sessione validata/Connected dopo restore ordinario | Delta native successivi e expiry pending; sessione fresca per caso | Scope esatto e margine sessione sufficiente |
| A03 | Logout/foreground con pending conserva/elimina | Mini | NOT_RUN | Test isolati esistenti, live non attestato | Prova controllata su fixture con checkpoint | Consenso rispettato, pending persistito o eliminato esplicitamente |
| A04 | Cambio account/shop, cache e callback tardive | tutti | PASS isolato Mini; runtime cross-client NOT_RUN | cache-safety/page-session-fencing/catalog context e nuove guardie eventi PASS | Conservare limite isolato; niente account sostituiti | Zero invii o applicazioni tardive fuori scope |
| B01 | Home e vendite readonly, ricerca/dettaglio | Mini/Admin | PASS verificato | 17 scenari autentici precedenti | Conservare evidenze sui byte invariati | Valori e identità concordi con SELECT |
| B02 | Filtri/sort/pagine/errori vendite residui | Mini | PASS verificato (isolato + runtime parziale) | Sales14regressioni PASS;4lingue/30giorni/empty DevTools, patch398cb406; paging100+1 isolato | Dataset periodo vuoto: nessuna creazione finanziaria; conservare limite multipagina isolato | Nessuna mutazione finanziaria; pagine e filtri coerenti |
| C01 | Catalogo CRUD e ciclo archivia/ripristina | Mini/Admin | PASS verificato | 13 casi autentici, cinque fixture | Preservare evidenze | Identità confermate dal server, readback esatto |
| C02 | Fornitori/categorie rinomina e riassegnazione | Mini/Admin | PASS verificato | Readback autentico delle cinque fixture | Preservare evidenze | Riferimenti attivi corretti e tombstone coerenti |
| C03 | Ricerca/paging catalogo e relazioni | Mini | PASS paging parziale; FAIL ricerca >80, fix in integrazione | Worker bdd42368 + registry147 + Mini v9:7pagine/350ID esatti; packet successivo tre sort/150righe ciascuno esatti contro SQL | Ritest limite80 e filtri/ricerca con oracle; non dedurre intero dataset | Nessun duplicato/omissione; contesto stabile |
| C04 | Duplicati, double tap, revision conflict | Mini/Admin | PASS isolato; runtime conflict/doubletap NOT_RUN | Duplicato autentico precedente PASS;5scelte dialogo conflitto e idempotenza/ACL server isolate | Conflitto controllato e doubletap autentico | Nessuna sovrascrittura o duplicazione involontaria |
| C05 | Prezzi CLP/frazioni/legacy e History multipagina | Mini/Admin | PASS isolato; runtime multipagina NOT_RUN | Prezzi CLP/legacy e paging125→185 prezzi/audit PASS; History autentica8 | Rilettura e cambio lingua; mantenere limite multipagina isolato | Valore persistito invariato; ordinamento e audit esatti |
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
| F00 | Build native corrente, scope e recovery | Android/iOS | FAIL recovery; restore Android R-A06 PASS | Exact16 normalizzate senza dati/eventi cambiati; precedente iOS500/57014 distinto dal corrente Android200/resource_exceeded per tre timestamp History ISO | Performance Admin applicata; completare compatibilità History nei tre repo, artefatti finali e retry senza reset | Autenticazione valida, recovery concluso e dati scoped |
| F01 | Mini → Admin/Android/iOS automatico | tutti | NOT_RUN | Mini checkpoint delta PASS; nessun roundtrip | Mutazione fixture e readback quattro superfici | Stesso ID/revisione senza refresh manuale |
| F02 | Admin → Mini/Android/iOS automatico | tutti | NOT_RUN | Nessuna prova autentica completa | Mutazione rappresentativa e readback | Stesso ID/campi, outbox coerente |
| F03 | Android → Mini/Admin/iOS automatico | tutti | NOT_RUN | Recovery da riconvalidare | Mutazione UI nativa con scope verificato | Persistenza e propagazione automatiche |
| F04 | iOS → Mini/Admin/Android automatico | tutti | NOT_RUN | Recovery da riconvalidare | Mutazione UI nativa con scope verificato | Persistenza e propagazione automatiche |
| F05 | Foreground/reconnect/eventi mancanti e pagine | tutti | NOT_RUN | Polling Mini3–30s, checkpoint verificato | Ritorno foreground/rete e recupero cursor | Nessuna perdita eventi; stesso clock osservatore |
| F06 | Eventi duplicati/riordinati/concorrenza/tombstone | tutti | PASS isolato Mini; runtime cross-client NOT_RUN | Nuove regressioni ID duplicati/decrescenti/replay/oltrecheckpoint e tombstone tardive PASS | Concorrenza/tombstone fixture runtime sugli altri client | Idempotenza, conflitti espliciti, nessuna ricomparsa |
| G01 | Cinque icone e catalogo quattro lingue | Mini | PASS verificato | Icone5/5; quattro viste OPERATOR_OBSERVED | Conservare prove sul layout invariato | Titoli/tab/testi leggibili, prezzo contenuto |
| G02 | Altre schermate/dialoghi/errori quattro lingue | Mini | NOT_RUN globale (copertura parziale verificata) | 11pagine4lingue precedenti;8contenuti privacy/deletion canonici;4titoli nativi v9 visivamentePASS | Dialoghi pending/errori e screenshot residui; nessun PASS globale | Cambio lingua completato; nessun testo troncato |
| P01 | Catalogo apertura/navigazione/ricerca/paging | Mini | PASS misure parziali incluse6pagine post-fix | 20warm p50=562/p95=1133ms;10search p50=1021;6paging p50=328,min323,max2321;2HTTP400 storici preservati | Cold/cache e altri sort da caratterizzare; nessun PASS SLA | Inizio/fine app espliciti; soglie canoniche o nessun PASS SLA |
| P02 | Save online e ripresa outbox | Mini | NOT_RUN | Durate orchestrazione escluse | Campioni con clock host coerente | p50/p95 solo con n adeguato, fallimenti inclusi |
| P03 | Convergenza quattro client | tutti | NOT_RUN | Nessun campione autentico | Misurare dal submit osservato al readback finale | Clock unico e nessun refresh artificiale |
| P04 | Upload/sostituzione/visualizzazione immagine | Mini/Admin | NOT_RUN | Picker incluso nelle vecchie durate | Misurare intervallo rete/UI separato dal picker | Payload/ambiente dichiarati e errori conteggiati |
| H01 | Telefono fisico WeChat/hardware/lifecycle | Mini | NOT_RUN | Nessun telefono collegato attestato | Inventario e disponibilità umana separata | Camera/galleria/permessi/rete reali; nessun PASS simulato |
| I01 | Integrazione e smoke combinazione finale | tutti modificati | NOT_RUN combinazione finale; integrazioni parziali PASS | MiniPR43 c95dacfe/AdminPR116 53e58013/AndroidPR10 1bf758dd CI mainSUCCESS; Workerbdd42368/registry147 verificati | Integrare privacy/recovery e receipts; performance SQL/nativefinal e smoke combinato | origin/main e runtime TEST riconducibili ai sorgenti |
| I02 | Cleanup fixture run e report finale | Mini/Admin | NOT_RUN | Cinque fixture preservate | Dopo readback completati, soli percorsi applicativi | Nessun oggetto estraneo o diagnostico cancellato |

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
| P05 | Login e prima Home | Mini/Admin | NOT_RUN | Singolo login fresco riuscito13.419ms | Serie cold/warm con richieste/cache/errori | Metodo e campioni espliciti; nessun percentile da n=1 |
