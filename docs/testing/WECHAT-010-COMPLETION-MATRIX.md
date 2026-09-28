# WECHAT-010 — matrice di completamento corrente

Mandato 2026-09-28: esecuzione TEST cross-client. Questa matrice è operativa e non
attesta anticipatamente la chiusura. Per le prove storiche si applica il report
canonico; un PASS limitato non copre i residui di altre righe.

Stati: PASS verificato; FAIL riprodotto; NOT_RUN; BLOCKED esterno; N/A motivato;
evidenza storica da riconvalidare. Problemi di runner/strumenti sono distinti dai
difetti applicativi. Le correzioni native sono coordinate con la lane già attiva.

Baseline remota verificata: Mini `5d737c8b`, Admin `fe4907ad`, Android `d7c4953c`,
iOS `30d226d0`. Checkout primari nativi rispettivamente `ca0a58d8` e `c55e3a93`,
con modifiche locali preesistenti preservate. Build correnti da riconciliare prima
dei nuovi PASS cross-client. Runtime TEST/configurazione e fixture sono nel packet
privato già autorizzato; nessuna credenziale nel report.

| ID | Requisito | Repository | Stato | Evidenza disponibile | Azione mancante | Accettazione |
|---|---|---|---|---|---|---|
| A01 | Pairing e login personale distinto | Mini/Admin | PASS verificato | Report 26/09, codice auth invariato | Preservare mapping; nessun nuovo pairing | Identità canonica e login distinto |
| A02 | Sessione attuale e rientro dopo scadenza | tutti | NOT_RUN (Mini login verificato) | Login Mini freschi4blocchi; iOS login→restart FAIL firma in correzione | Controllo autenticato fresco prima di ogni blocco | Scope esatto e margine sessione sufficiente |
| A03 | Logout/foreground con pending conserva/elimina | Mini | NOT_RUN | Test isolati esistenti, live non attestato | Prova controllata su fixture con checkpoint | Consenso rispettato, pending persistito o eliminato esplicitamente |
| A04 | Cambio account/shop, cache e callback tardive | tutti | NOT_RUN | Guardie e suite isolate | Eseguire regressioni e contesti isolati; niente account sostituiti | Zero invii o applicazioni tardive fuori scope |
| B01 | Home e vendite readonly, ricerca/dettaglio | Mini/Admin | PASS verificato | 17 scenari autentici precedenti | Conservare evidenze sui byte invariati | Valori e identità concordi con SELECT |
| B02 | Filtri/sort/pagine/errori vendite residui | Mini | PASS verificato (isolato + runtime parziale) | Sales14regressioni PASS;4lingue/30giorni/empty DevTools, patch398cb406; paging100+1 isolato | Dataset periodo vuoto: nessuna creazione finanziaria; conservare limite multipagina isolato | Nessuna mutazione finanziaria; pagine e filtri coerenti |
| C01 | Catalogo CRUD e ciclo archivia/ripristina | Mini/Admin | PASS verificato | 13 casi autentici, cinque fixture | Preservare evidenze | Identità confermate dal server, readback esatto |
| C02 | Fornitori/categorie rinomina e riassegnazione | Mini/Admin | PASS verificato | Readback autentico delle cinque fixture | Preservare evidenze | Riferimenti attivi corretti e tombstone coerenti |
| C03 | Ricerca/paging catalogo e relazioni | Mini | NOT_RUN | Prima pagina e lookup autentici; pagine grandi isolate | Completare casi ulteriori e misurare | Nessun duplicato/omissione; contesto stabile |
| C04 | Duplicati, double tap, revision conflict | Mini/Admin | NOT_RUN | Duplicato autentico PASS, conflitti isolati | Conflitto controllato e regressioni idempotenza | Nessuna sovrascrittura o duplicazione involontaria |
| C05 | Prezzi CLP/frazioni/legacy e History multipagina | Mini/Admin | NOT_RUN | Prezzi reali e History 8; paging isolato | Rilettura, cambio lingua e paging disponibile | Valore persistito invariato; ordinamento e audit esatti |
| D01 | Upload/sostituzione/rimozione DevTools | Mini/Admin | PASS verificato | Tre operazioni, orientamento/thumbnail osservati | Preservare prove | Versioni e primaria corrispondono alla UI |
| D02 | Picker/anteprima annullati e file temporanei | Mini | NOT_RUN | Regressioni locali; diagnosi preview riconciliate | Casi runtime senza mutazione e suite lifecycle | Zero intent involontari e nessun file necessario perso |
| D03 | Upload interrotto/ripreso e identità operazione | Mini/Admin | NOT_RUN | Replay/finalize isolati | Prova bounded di rete/lifecycle e riconciliazione | Stessa key/payload; un solo effetto finale |
| D04 | Cache immagini e miniatura cross-client | tutti | NOT_RUN | Nessuna convergenza autentica | Upload, sostituzione e rimozione osservati su destinatari | Nessuna vecchia immagine dopo invalidazione prevista |
| D05 | Cleanup versioni storiche/Storage | Admin | PASS verificato | 28/09 18:16Z: due versioni complete, quattro oggetti assenti; SELECT indipendente e retry senza scritture | Nessuna; scheduling non richiesto dal contratto manuale TASK-137 | Manifest esatto, primaria nulla, versioni/audit conservati |
| E01 | Offline→online stesso modulo | Mini | PASS verificato | 28/09 16:52; Saved, outbox0, History7→8 | Preservare prova su moduli invariati | Una mutazione causale e feedback coerente |
| E02 | Riavvio con pending e rete intermittente | Mini | NOT_RUN | Journal/outbox e test isolati | Casi runtime nuovi con checkpoint | Pending durevole, invio automatico e zero duplicati |
| E03 | Scadenza sessione durante recovery | Mini | NOT_RUN | Tentativo storico interrotto conservato | Validare recupero con auth reale e test guardie | Nessuna mutazione fuori sessione; rete ripristinabile |
| E04 | Readback negato/temporaneo, errore definitivo | Mini/Admin | NOT_RUN | Regressioni di errori differenziati | Suite fault injection isolata e runtime sicuro | Mai falso Saved o perdita draft/pending |
| E05 | Nuove modifiche sul modulo durante recovery | Mini | NOT_RUN | Guardie session/page/revision | Regressione e caso runtime controllato | Risposte vecchie non sovrascrivono input nuovo |
| F00 | Build native corrente, scope e recovery | Android/iOS | FAIL riprodotto | Android84899b8e/APKdc11b6ee tipizza checkpoint_resource_exceeded su16TOAST; iOS Release senza entitlement perde login al restart | Remediation Admin e artefatto iOS firmato, poi retry reale | Autenticazione valida, recovery concluso e dati scoped |
| F01 | Mini → Admin/Android/iOS automatico | tutti | NOT_RUN | Mini checkpoint delta PASS; nessun roundtrip | Mutazione fixture e readback quattro superfici | Stesso ID/revisione senza refresh manuale |
| F02 | Admin → Mini/Android/iOS automatico | tutti | NOT_RUN | Nessuna prova autentica completa | Mutazione rappresentativa e readback | Stesso ID/campi, outbox coerente |
| F03 | Android → Mini/Admin/iOS automatico | tutti | NOT_RUN | Recovery da riconvalidare | Mutazione UI nativa con scope verificato | Persistenza e propagazione automatiche |
| F04 | iOS → Mini/Admin/Android automatico | tutti | NOT_RUN | Recovery da riconvalidare | Mutazione UI nativa con scope verificato | Persistenza e propagazione automatiche |
| F05 | Foreground/reconnect/eventi mancanti e pagine | tutti | NOT_RUN | Polling Mini3–30s, checkpoint verificato | Ritorno foreground/rete e recupero cursor | Nessuna perdita eventi; stesso clock osservatore |
| F06 | Eventi duplicati/riordinati/concorrenza/tombstone | tutti | NOT_RUN | Suite contratti esistenti | Regressioni isolate e tombstone fixture runtime | Idempotenza, conflitti espliciti, nessuna ricomparsa |
| G01 | Cinque icone e catalogo quattro lingue | Mini | PASS verificato | Icone5/5; quattro viste OPERATOR_OBSERVED | Conservare prove sul layout invariato | Titoli/tab/testi leggibili, prezzo contenuto |
| G02 | Altre schermate/dialoghi/errori quattro lingue | Mini | NOT_RUN (copertura parziale verificata) |11pagine4lingue campionate; Sales/Account/archiviati corretti; form required/CTA osservati | Completare dialoghi pending/privacy e ultimi screenshot; nessun PASS globale | Cambio lingua completato; nessun testo troncato |
| P01 | Catalogo apertura/navigazione/ricerca/paging | Mini | NOT_RUN | Nessun percentile applicativo | Misurare cold/warm, dataset, n, errori | Inizio/fine app espliciti; soglie canoniche o nessun PASS SLA |
| P02 | Save online e ripresa outbox | Mini | NOT_RUN | Durate orchestrazione escluse | Campioni con clock host coerente | p50/p95 solo con n adeguato, fallimenti inclusi |
| P03 | Convergenza quattro client | tutti | NOT_RUN | Nessun campione autentico | Misurare dal submit osservato al readback finale | Clock unico e nessun refresh artificiale |
| P04 | Upload/sostituzione/visualizzazione immagine | Mini/Admin | NOT_RUN | Picker incluso nelle vecchie durate | Misurare intervallo rete/UI separato dal picker | Payload/ambiente dichiarati e errori conteggiati |
| H01 | Telefono fisico WeChat/hardware/lifecycle | Mini | NOT_RUN | Nessun telefono collegato attestato | Inventario e disponibilità umana separata | Camera/galleria/permessi/rete reali; nessun PASS simulato |
| I01 | Integrazione e smoke combinazione finale | tutti modificati | NOT_RUN | Mini main5d737c8/Adminfe4907ad baseline | Review, PR, merge, CI e smoke finali | origin/main e runtime TEST riconducibili ai sorgenti |
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
