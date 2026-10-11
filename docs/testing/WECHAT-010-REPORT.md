# WECHAT-010 — completamento funzionale e accettazione

## Checkpoint corrente — 2026-10-11 18:00 America/Santiago

Corretto il testo di errore condiviso mostrato nella lettura product-detail dopo
il recupero C04: le quattro lingue ora descrivono una richiesta non completata
senza promettere un modulo conservato. Solo quattro traduzioni, nessun cambio
a logica form/outbox, autenticazione, sessioni o code. Source500ee402/patchd4d08565,
freezea3afcb31, full verify PASS e review indipendente2/2 APPROVED; integrazione
in preparazione. Copy **NOT_INSTALLED/runtime NOT_RUN**: build V12/e305 e
configurazione private correnti preservate per il retest C04 già revisionato.
Il fix del testo non diagnostica né chiude la precedente failure del reload.

Recupero338160bc/release7926bf7f verificato; PR52 integrata e07f336b con CI
head38174097336 e postmerge38174140808 SUCCESS. Il nuovo retest R2 7ffe8026,
case7beba10f,33test PASS/review2/2 resta NOT_RUN: Mac locked all'ultimo controllo,
sblocco umano richiesto e nessuna nuova finestra/SDK/input/SQL/Save. Pending,
convergenza quattro-client, prestazioni e telefono aperti; N attende la CI iOS
38173188925. WECHAT-010 EXECUTION, nessun DONE.

## Checkpoint storico — 2026-10-11 17:50 America/Santiago

Il recupero locale del failed-case C04 è verificato anche da due revisori sugli
artefatti salvati: terminale338160bc e release7926bf7f. Home autenticata originale,
code vuote e dati protetti invariati; il FAILb3d3e6fd e reloadAccepted=false restano
preservati. Nessuna accettazione retroattiva del reload.

Retest distinto da baseline riconciliata preparato soltanto nei file privati.
R1 115ed691 non eseguito e respinto P2 per possibile riuso di osservazione Home
fra finestre. R2 7ffe8026/freeze12ca6ced/pair8b5ede03:33test puri/temp-fs PASS e
review indipendente2/2 APPROVED. Chiusura legata a SHA/cutoff/tempi del lease
corrente, TTL ridotto del tempo trascorso e SQL fresco ricontrollati durante
archiviazione e rollback. Oracolo reload-readback dedicato; nomi/revisione
correnti, identità originale e fixture/history complete; niente restore extra.

Nuovo case7beba10f è WAIT_BEFORE_SQL/NOT_RUN: nessuna query business, login,
SDK/input o Save del retest. Ultima lettura CUA effettiva del turno: Mac locked; owner utente,
sblocco manuale richiesto, poi servono nuovo GO N esclusivo e preflight/sessione
freschi. Nessun GO o lease attivo W. App V12/e305 e configurazione TEST invariati.
N ha pubblicato il candidato iOS867c9b23/PR22; CI38173188925 in corso all'ultimo
riscontro, distinta dal fullband locale9PASS e dalla vecchia CI fallita.
C04 reload, pending, convergenza quattro-client, prestazioni e telefono restano
aperti. WECHAT-010 EXECUTION; nessun DONE o pilot readiness.

## Checkpoint storico — 2026-10-11 17:26 America/Santiago

**Recupero locale del failed-case C04 verificato; reload originale non accettato.**
Nuovo GO effettivo edfb8b60,20:18:49→20:33:49 UTC, cutoff20:32:49. Usato soltanto
issued/checkpoint.json; preparazione5720 mai emessa, transport copy conservata.
Baseline Worker protetta aggiornata all'ingresso, app V12/e305 e flag invariati.

Gesti nativi effettivi: Back2, consenso uscita dalla sola bozza1, login WeChat
ordinario1; shop selezionato automaticamente già originale. Save/Retry/Reload/
reapply/SDK input/nuove scritture business zero. Cinque JPEG nativi conservati.
Observer R2 effettivo20:23:50: Home pulita, form assente, dirty0, sessione valida
862s, generazione13, stesso account/shop, fingerprint originale, coda persistente
originale/foreign vuota, wifi, zero eccezioni e disconnect certo.

SELECT indipendente finale20:24:17.823293 UTC,080a4449, riconciliata entro60s:
nome Admin, dettagli/prezzi/immagini, cinque fixture e Mini history invariati.
Terminale338160bc FAILED_CASE_LOCAL_UI_RECOVERY_VERIFIED: runtimeAcceptance=false,
reloadAccepted=false; FAILb3d3e6fd byte-preservato. Fence6aa1 archiviato durabilmente
con byte originali sotto lock; lock e fence globale assenti. La pulizia non
attesta il ramo effettivo della vecchia action-sheet né un difetto applicativo.

Release complessiva reale20:26:12.809 UTC/7926bf7f, prima deadline; runner W0,
window attiva archiviata. N/C/Client informati; N riprende il proprio Root9 sulla
correzione fullband definitiva. W resta fuori dai dispositivi. C04 reload richiede
una prova distinta da baseline riconciliata; pending, convergenza quattro-client,
prestazioni e telefono restano aperti. WECHAT-010 EXECUTION, nessun DONE.

## Checkpoint storico — 2026-10-11 17:04 America/Santiago

Diagnostico C04 R2 autentico in sola lettura, 19:45:34 UTC, osservazione
`06c4a4d5`: nessuna scrittura pendente originale o foreign, form originale
ancora dirty con bozza conservata e revisione Admin; sessione scaduta
naturalmente, generazione12. Nessun nuovo Save, login o input SDK.
È un diagnostico, non accettazione del reload; i FAIL originali restano tali.

Finestra diagnostica nuova19:43:27→19:58:27 UTC, metadata Worker protetti
freschi e SELECT indipendente19:45:29 (`b5974129`): noOverwrite, fixture,
prezzi/dettagli e history invariati. Release complessiva effettiva19:47:35.693
UTC (`415a311e`), connessione chiusa, lock assente e finestra attiva archiviata.
Fence originale ancora armato; app V12/e305 e configurazione TEST invariati.

Recupero UI del caso fallito preparato, non eseguito. Due revisori hanno
rifiutato il primo helper per P2: errore terminale poteva liberare il fence.
Originale conservato; R2 `e2b242a6`, freeze `623075b1`, 26 test puri/temp-fs
PASS e review indipendente2/2. Riserva output, journal durabile e rollback
sotto lock preservano i byte e qualsiasi owner diverso. Il recupero richiede
nuova finestra, navigazione/login ordinari, Home pulita stesso account/shop,
coda persistente vuota e SELECT finale fresca. Nessun Save/Retry/Reload/reapply.
N usa un proprio slot Root9; W resta0 SDK/input/heavy in attesa del rilascio.
WECHAT-010 resta EXECUTION; pending, convergenza, prestazioni e telefono aperti.

## Checkpoint storico — 2026-10-11 13:24 America/Santiago

Diagnostico readonly R2 `97009930` preparato sullo stesso caso: P2 di privacy
del report chiuso, originale frozen preservato, 13 test puri PASS e review
indipendente 2/2. Nessuna esecuzione SDK/UI/SQL del diagnostico; runtime NOT_RUN.
N rilascia le risorse 16:17:29 UTC; la lettura CUA del turno trova ancora Mac
locked. Servono sblocco manuale e nuova finestra esclusiva; fence conservato.


**C04 eseguito; rifiuto della revisione obsoleta verificato; recupero UI aperto.**
V12/source e305f083 e configurazioni TEST restano invariati. Worker fdfb3a7e,
source acb3e4ac, registry158: preflight protetti freschi e SELECT indipendenti.
Nessun deploy, apply, rotazione, cambio flag o nuova scrittura finanziaria.

Caso privato d072e509-1cda-410c-9b21-79a327bf4eea, sul prodotto C04 esistente:
un login WeChat ordinario prima della prova, poi un solo Save Admin del nome
e un solo Save Mini con la revisione precedente. Il runtime conserva la bozza
e mostra stale_version; SQL conferma una sola nuova ricevuta Mini bloccata,
nessuna sovrascrittura, prezzi/dettagli completi e cinque fixture invariati.
Le catture native Admin e conflitto sono conservate, senza header privati.

La scelta nativa Reload latest è stata effettuata ma non attesta il terminale.
verify-reload si ferma su ORACLE_STALE prima di una nuova connessione SDK.
Il FAIL originale7b8a5507 e l'oracolo precedente sono preservati. Il primo
slot30427 è rilasciato15:39:06 UTC, 42.131249s dopo deadline, registrato come
ritardo; zero processi/lock, nessuna nuova connessione SDK o input oltre cutoff.

Continuazione readonly a3c39255, freeze599141e7, review2/2 ee85596f e sette
prove pure PASS: nuova finestra2778 15:47:12→16:02:12 UTC. Preflight fresco;
SELECT15:48:26, full noOverwrite/history invariati. SDK restituisce
FAIL SESSION_OR_SCOPE_INVALID15:48:29; la sessione iniziale900s era scaduta.
Nessun controllo viene esteso o rimosso, nessun altro Save/login/gesto UI.
Cleanup di proprietà confermato; release anticipata15:49:59/94f7a491, lock
assente. Una lettura CUA successiva segnala Mac locked; sblocco umano richiesto.

Riconciliazione del FAIL senza SDK, helper5599e8dd approvato2/2 fb9ad47d:
nuovo descriptor e SELECT finale15:56:53.702861 UTC, verificato entro60s.
Terminale b3d3e6fd, oracolo2ddda532: backend VERIFICATO in sola lettura,
nome Admin preservato, un Save Mini/un risultato bloccato/zero successi,
fixture, prezzi, immagini e Mini history invariati. Il terminale resta FAIL
per l'accettazione runtime; reloadAccepted false e fence armato conservato.

Packet: native-completion-20260928/stale-revision-v14-d072e509-1cda-410c-9b21-79a327bf4eea.
Prossimo passo: osservare e recuperare il form attraverso la UI ordinaria,
dopo sblocco e nuovo handoff; prima riconciliare lo stesso intento, senza
ripetere i Save. Non dedurre un difetto applicativo dalla sola guardia o dal
collector. N ha ripreso la diagnosi iOS distinta; convergenza, pending,
prestazioni e telefono restano aperti. WECHAT-010 resta EXECUTION.

## Checkpoint storico — 2026-10-10 18:08 America/Santiago

**C04 v19 APPROVED source da due revisori indipendenti; prova autentica NOT_RUN.**
Candidate `71019a89`, companion `941714df`, freeze `e9f73a2b`, pair `16ba16fb`:
88 prove pure PASS. Deadline assoluta, latch attivo prima della connessione,
cleanup di proprietà, unico Save Mini, cinque fixture e dettagli completi restano
invariati. V12/source `e305f083` e configurazioni TEST sono invariati.

Il nuovo rollout POS esterno ha cambiato la baseline: Worker `fdfb3a7e`, source
`acb3e4ac`, CI38083172469 SUCCESS, registry158 con tre aggiunte POS. Il refresher
precedente rifiuta correttamente VERSION_CHANGED; lo slot precedente viene
ritirato prima di GO. Sono byte-identici i102 file pertinenti tra il precedente
source servito e quello corrente. Capsule source `9f520d0c`, CI `5440af40`,
lineage Client `c25a2ac0`: conteggio158, tre digest esatti, prefix155 e statement
identity invariati. Nessuna attestazione di tutti155 corpi SQL o dei dati.

Adattamento dedicato C04, senza alterare restoration155 o lo snapshot globale.
Refresh readonly21:01:29 e21:03:44 UTC PASS, receipt `8666ef17` e `6a8df3b2`:
versione/ETag/binding/target/allowlist/flag/tracing verificati. Nessuna equality
attestata dei valori segreti, nessun deploy/apply/rotazione o modifica flag da W.
Nuovo GO N21:03:08→21:18:08 UTC, checkpoint `8c72880b`, completamente distinto
dallo slot ritirato. Il primo controllo CUA segnala Mac locked; sblocco manuale
richiesto. Nessun nuovo case, connessione SDK, query business, draft o Save C04.

Release anticipata effettiva21:07:40 UTC, receipt `8027fbf6`: zero processi runner
C04 di W, SDK/SQL/Save/input zero, lock e fence assenti. Finestra chiusa, byte
preservati `46f97e35`, path runtime attivo assente. Online/zh-Hans correnti non
osservati per Mac locked; ultimo riscontro20:08 resta storico. N riacquista le
risorse; nessuna quiete globale o runtime acceptance dedotta. Un nuovo tentativo
richiede sblocco umano, nuovo GO N, preflight e sessione freschi. Controlli sui
sette documenti: governance/privacy/secret scan/diffcheck PASS; app invariata.

G02 Account nelle quattro lingue e logout offline senza pending restano i PASS
limitati documentati sotto; PR51 integrata `259fb967`, CI head38082855727 e
postmerge38083487701 SUCCESS. C04 live, pending, convergenza quattro-client,
prestazioni e telefono restano aperti. **WECHAT-010 resta EXECUTION; nessun DONE.**

## Checkpoint storico — 2026-10-10 17:08 America/Santiago

**PASS autentico limitato G02: Account online e offline nelle quattro lingue
zh-Hans/en/es/it.** V12/source `e305f083` invariati. Nuovo handoff N
19:59:16→20:14:16 UTC; Home offriva il login dopo scadenza naturale, un solo
rientro WeChat ordinario e nessun logout. Picker lingua reale, navigazione
ordinaria e preset Network effettivo: otto JPEG nativi nuovi, tutti ispezionati,
shop/versione/uscita leggibili e nessun testo troncato o controllo sovrapposto
osservato. L'errore già presente si ritraduce passando en→es→it senza nuovo login.

Ripristino finale reale zh-Hans + Online. Network svuotato prima di Retry;
nuovi GET Account e Shops entrambi200, profilo/shop canonici osservati e errore
rimosso. Screenshot finale `c2468e30`, terminal `80591422`. Release anticipata
20:08:21 UTC, receipt `18182acf`: lock assente, SDK/SQL/business Save/Logout/
Compile/install/rete host/target nativi zero. N/C/Client informati; nessun riuso
di questo slot. Catture complete JPEG originali, senza header privati.

Packet privato `mini-sales-build/v12-e305f083-20261009/g02-account-locales-20261010/`.
Il PASS logout offline senza pending del16:10 e le sue due review restano validi.
G02 globale/dialoghi pending e conflitto, C04 live, convergenza, prestazioni e
telefono restano aperti. Adapter C04v16/55pure preparato, review indipendente
pendente; SELECT TEST disponibile, nessuna nuova finestra C04 o query emessa.
**WECHAT-010 resta EXECUTION; nessun DONE o rilascio pubblico.**

## Checkpoint storico — 2026-10-10 16:10 America/Santiago

**PASS ristretto: logout locale con Account offline, senza pending, e rientro
ordinario.** V12/source `e305f083`, build/config invariati. Nuovo GO N
18:55:06→19:10:06 UTC; sessione precedente scaduta naturalmente, nuovo login
WeChat ordinario. Account conserva lo shop e mostra errore/Logout; i due GET
reali falliscono con `net::ERR_INTERNET_DISCONNECTED`. Cattura JPEG nativa nuova
convertita in vero PNG con pixel1796×1932 e ICC identici, nessun header privato.

Un solo tap Logout reale: generation5→6, Home signed out, sessione/shop rimossi,
registry invariato e pending0. Online ripristinato e un rientro WeChat ordinario:
generation7, Account/Shops nuove GET200, profilo/shop canonici e pending0.
Terminal `5125a336`, afterlogout `4f640e0a`, sidecar rientro `aa02e734`.
Due reviewer indipendenti **APPROVED** sulla catena e sulle catture reali; il
sidecar è soltanto osservazione del rientro, non un secondo caso offline.

Release effettiva19:01:44 UTC, oltre otto minuti prima della deadline, receipt
`55679684`: Online reale, lock assente, zero SDK W attivo, zero business write,
nessun target nativo/rete host/install/Compile. N riprende i simulatori; nessun
riuso dello slot chiuso. Vecchi FAIL41c41cea/e8490bea preservati con zero tap.
Revoca remota, conserva/elimina pending, expiry con pending, convergenza, misure
e telefono restano separati e aperti. **WECHAT-010 resta EXECUTION.**

Aggiornamento16:58 Santiago: canale MCP SELECT TEST disponibile (registry155
verificato dal DB owner); PG apply/TLS restano un gate distinto. Preflight Worker
readonly19:50 UTC rinnova versione/binding/allowlist/tracing invariati. Adapter C04
v16 `7c986c17`, guard build v12 e deadline assoluta:55 test puri PASS dopo RED
54PASS/1FAIL sul tap SDK senza timeout. Originali v14/v15 e nuovo R1 preservati;
nessun nuovo case/draft/Save/SQL/SDK/UI. Review indipendente in corso, C04 runtime
NOT_RUN; G02 attende nuovo handoff N, senza riusare lo slot R3 chiuso.

## Checkpoint storico — 2026-10-10 15:45 America/Santiago

DevTools torna accessibile dopo lo sblocco umano. V12/build/config restano
invariati; nuovo login WeChat ordinario e Account Online canonici osservati.
Nel GO esplicito18:33:19→18:48:19UTC, due casi distinti si fermano prima del
logout: `41c41cea` **FAIL FRESH_OBSERVATION_REQUIRED**, `e8490bea` **FAIL PNG_REQUIRED**.
Sono limiti del raccoglitore: i due GET reali falliscono con
`net::ERR_INTERNET_DISCONNECTED`, Account conserva lo shop e mostra errore/uscita;
nessun logout tap o business write, nessun PASS/FAIL logout applicativo dedotto.

Online ripristinato e nuove letture HTTPS GET summary/sales200 con Home aggiornata
18:40:12UTC. Release effettiva18:40:38UTC, prima della deadline; lock assente,
zero SDK W attivo, nessun target nativo/rete host/install/Compile toccato.
Receipt release `4a6179e4`, originali FAIL e catture native JPEG preservati.
La cattura nativa è JPEG: conversione privata in vero PNG verificata con pixel
1796×1932 identici e profilo ICC preservato. Il probe è soltanto FORMAT_ONLY.
Normalizer `7ac07bb3` e observer R3 `67f3eb9a` (solo nuovo filename di receipt
finestra) **APPROVED 2/2**, freeze `18f91137`; runtime R3 **NOT_RUN**, richiede nuovo handoff N e sessione
fresca tramite flusso ordinario dopo scadenza reale. Nessuna precondizione forzata.
N riprende il controllo ordinario della bozza B locale/pending; ACK separato.
WECHAT-010 resta **EXECUTION**; gli altri residui e i limiti telefono sono aperti.

## Checkpoint storico — 2026-10-09 21:22 America/Santiago

Mini v12 resta installata; il logout offline e il successivo rientro sono
**NOT_RUN**. Observer manuale distinto R2 `e1070529` approvato da due reviewer
read-only: deadline assoluta SDK, 60s riservati a Online e controllo root di150s
prima dell'unico logout tap. Le25 prove pure sui byte R2 sono PASS; non sono
prova runtime. Freeze privato `manual-observer-r2-review-freeze.json` preparato.

N conferma B salvata localmente su iOS con prezzi14/22 e tre pending; recovery
cloud/ACK restano separati. La riapertura ordinaria fallisce per Mac locked e
automatic unlock failed; nessun nuovo GO Mini concesso. W mantiene zero nuovi
SDK/input/login e non riusa la finestra scaduta. Sblocco manuale richiesto
all'utente; poi nuovo handoff, sessione e caso breve senza reinstallare v12.
I risultati limitati21:08 e le evidenze storiche sotto restano invariati.

## Checkpoint storico — 2026-10-09 21:08 America/Santiago

WECHAT-010 resta **EXECUTION**. Mini v12 è ora installata e caricata in DevTools;
login TEST e Account Online sono osservati, logout offline ancora **NOT_RUN**.

- Pristine R3 reale **PASS**: Home signed out prima/dopo, sessione assente,
  generation stabile, journal/image/draft vuoti. Disconnect confermato, chiusura
  ordinaria IDE e install selettiva dei cinque file alle20:52 Santiago:
  `FILES_INSTALLED_VERIFIED`, 102 file/configurazioni corrispondono alla receipt.
- DevTools ufficiale ora `2.02.2610092 Nightly`; comando normale Compile e nuova
  AppService con i tre metodi Home osservati. Login WeChat ordinario e profilo/shop
  canonici letti dal server. Non è accettazione completa dei casi PR49/50.
- Helper offline immutato: prepare **PASS**; observe **FAIL REAL_OFFLINE_REQUIRED**
  prima dello switch Account/logout. Il vero preset Network Offline blocca HTTPS,
  ma `wx.getNetworkType()` dichiara `wifi`. Zero logout tap; FAIL preservato.
- Due review indipendenti **APPROVED** per un nuovo caso manuale distinto. Account
  offline stabilizzato, shop canonico e sessione/generation/registry invariati,
  errore e logout visibili osservati. Le due richieste falliscono per trasporto;
  metodo GET Shops osservato, riscontro metodo Account nel log incompleto. SDK
  screenshot fallita; nessuna PNG accettata. Questo non chiude G02/A03/logout.
- Slot dichiarato20:51:17→21:06:17 Santiago; release con cleanup alle21:08:50,
  oltre deadline. Online reale verificato via CUA, lock assente, nessun SDK W
  attivo, zero logout/business write; target nativi e rete host intatti. Nessuna
  estensione inferita e nessuna quiete globale. Nuovo handoff richiesto per una
  nuova sessione e prova breve; non reinstallare né riusare il tentativo scaduto.
- Una cattura diagnostica ha incluso header privati della sessione TEST: esclusa
  dall'accettazione e mai copiata negli artefatti. Prossima prova usa soltanto
  tabella Network/metodi/errori e screenshot senza dettaglio header.

Evidenze: packet privato `mini-sales-build/v12-e305f083-20261009/`, receipt
install/nuova AppService, `offline-account-v12-772967de…/observe.json`, nuovo
`manual-offline-v12-1f645b42…/terminal-result.json` e release. A03 pending,
C04, convergenza, misure e telefono restano aperti; nessun nuovo deploy o SQL.

## Checkpoint storico — 2026-10-09 20:35 America/Santiago

WECHAT-010 resta **EXECUTION**. La preparazione Mini v12 è revisionata; il
collaudo applicativo resta pendente; il blocco GUI iniziale è ora superato.

- Due reviewer indipendenti read-only: offline A03 **APPROVED** sui byte invariati;
  installazione/observer **APPROVED R3**, freeze `a2b785e2`. Finding P2 riprodotto
  RED 2 FAIL/3 PASS, poi GREEN 5 PASS: Home già signed out prima/dopo il read e
  `stableGeneration === true` obbligatori. Un cleanup canonico della sessione
  durante la lettura fa rifiutare pristine. Installer14 e oracle offline4 PASS
  preservati; nessun nuovo sorgente applicativo o test completo ripetuto.
- Slot Mini ricevuto da N **23:20:26 UTC**, rilasciato **23:27:59 UTC**, prima della
  deadline. DevTools ufficiale `2.02.2609292 Nightly` aperto sul primario mostra la
  welcome page; tap Compile non confermato, poi `noWindowsAvailable`/timeout.
  Finder risponde. CLI ufficiale auto termina255 senza listener9420; quit ordinario
  non confermato entro15s. Anche una sessione CUA nuova riceve timeout. Questo è
  **FAIL di setup**, non un difetto applicativo o una prova di logout/sessione.
- Verifica SDK-free dopo i tentativi: receipt/candidato102/sorgenti108, dist v11,
  configurazione TEST e privata **PASS invariati**, primario e305 clean. Zero SDK,
  pristine, intent/install v12, nuovo login, Business Save o cambio rete. La rete
  Online fresca non è attestata. IDE ancora avviato/non rispondente; nessun comando
  CLI, runner o gruppo SDK di W attivo. Release comunicata a N/C/Client.
- Dopo la riapertura comunicata dall’utente, nuova istanza DevTools osservata
  alle20:32 Santiago: Home `pages/index/index`, pulsante WeChat login, Network
  Online e AX rispondente. Il precedente blocco GUI è superato. Manifest R3 e
  statici v11 invariati; listener9420 ancora assente, zero SDK/test input/install.
  N mantiene il passaggio nativo NEWTESTSave/QA, nuovo slot Mini richiesto ma non
  ancora rilasciato. Prossimo passo: handoff concreto, automazione ufficiale,
  pristine reale fresca <60s, install selettiva/Compile v12 e prova offline/logout.
  La sola Home visibile non attesta sessione, journal vuoti o accettazione runtime.

Packet: `mini-sales-build/v12-e305f083-20261009/`; review R3, log RED/GREEN,
`devtools-setup-20261009.json`, `after-setup-readonly-check.json` e release slot.
A03 pending, C04, convergenza quattro-client, misure e telefono restano aperti.

## Checkpoint storico — 2026-10-09 19:55 America/Santiago

WECHAT-010 resta **EXECUTION**. Mac accessibile nella discovery fresca; dopo il
riavvio host, vecchi PID e stato AppService non sono riusati. N/C mantengono il
primo slot nativo; W non ha aperto DevTools né connesso un SDK.

- Primary Mini e origin/main verificati `e305f083`, clean. Nuovo candidato TEST
  privato compilato da Git archive esatto con Node26.7.0 e TypeScript7.0.2
  corrispondente al lock. Build PASS; 102 file, cinque output Home/Account/reader
  nuovi e 97 byte-identici al v11, configurazione TEST `37d94cf4` preservata.
- Receipt nuova `0bb11950` **PREPARED_NOT_INSTALLED**, runtimeAcceptance=false.
  Installer selettivo nuovo: 14 test puri PASS; osservazione pristine reale e
  review indipendente richieste prima dell'uso. Nessun dist/config del primario,
  dato locale, sessione, pending o artefatto storico sovrascritto.
- Oracle offline precedente riprodotto RED 2 FAIL/2 PASS: pretendeva shop nullo
  dopo read fallite. Nuova copia richiede shop canonico preservato, errore
  stabilizzato e sessione/generation/registry invariati: 4 test puri PASS.
  Pin nuovi e namespace distinti; vecchia A03 scaduta non riusata.
- Installazione, normale Compile DevTools, nuova AppService, A03 autentica e
  runtime PR49/50 **NOT_RUN**. F00/F01–F06, altri casi residui, prestazioni e
  telefono restano aperti; nessun nuovo Worker deploy, SQL o pausa cron da W.

Packet privato: `mini-sales-build/v12-e305f083-20261009/`, nuova receipt,
manifest, installer, observer e log oracle RED/GREEN. Questi risultati non
promuovono CI o preparazione locale in accettazione autenticata.

## Checkpoint storico — 2026-10-04 16:24 America/Santiago

WECHAT-010 resta **EXECUTION**. Il punto 4 dell’addendum sul recupero automatico
Home è integrato con [PR50](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/50):
head `1e1cda39f4a905072d535ed4454cdeff111c750d`, merge/main
`e305f083e8c16aac43b361ffabc9c9f08a3af493` alle 19:20:48 UTC.
L’integrazione precedente PR49 rimane valida.

- Una normale invalidazione cache, con pagina/sessione/shop ancora validi,
  accorpa i chiamanti della Home e avvia un successore senza tap. Il controller
  esistente mantiene backoff 3→6→12→24→30 secondi anche durante i read secondari;
  Retry resta disponibile. Hide, cambio sessione/shop e dinieghi interrompono il
  recupero. Nessuna risposta obsoleta applicata o riattivazione di scope revocato.
- La cancellazione locale del reader ha un errore tipizzato condiviso dalla
  richiesta; non è scadenza autorevole della sessione. Due refresh concorrenti
  conservano la sessione; dinieghi server reali restano distinti, compresi
  permission_denied/shop_suspended che rimuovono solo il contesto negozio.
- RED iniziale 5 FAIL/1 PASS; due finding di review riprodotti con 2 FAIL, poi
  **18 mirati PASS** (14 Page Home + 4 reader). Verify locale e CI reali:
  **231 PASS/0 FAIL/0 SKIP** (111 TS + 120 JS), required checks/build/secrets/diff
  PASS, lint storico 1 warning/7 infos. I due reviewer esistenti APPROVED R2,
  zero finding aperti; freeze SHA256
  `faeb5a07007662452a8fa5c57e3247caf230813b440f499ed18dd67f350f4f95`.
- PR CI `37227808007` testa checkout virtuale `769d6b2c`, tree identico alla head
  approvata; main CI `37227922782` testa `e305f083`, SUCCESS 19:21:13 UTC.
  Entrambe Node 26.7.0 e otto step PASS, verificati nei log originali.
- Primary fast-forward e clean, tre source uguali al freeze, tutti 104 file
  config/dist preesistenti byte-identici. Solo tre file codice/test committed;
  sei documenti owned restano unstaged, branch conservato. Generic build **OFF**.
- Nuovo artefatto/install TEST, versione AppService nuova e collaudo autenticato
  Mini/Admin **NOT_RUN**; A03/C04/pending/convergenza/prestazioni restano aperti.
  Il debugger pronto comunicato dall’utente non attesta il nuovo runtime. N
  mantiene la corsia input/heavy; nessun UI/SDK, SQL, deploy o produzione da W.

Evidenze private originali: `home-cache-successor-20261004/publication.json`,
freeze R2 e log RED/mirati/verify/CI; checkpoint precedenti conservati come storici.

## Checkpoint storico — 2026-10-04 15:21 America/Santiago

WECHAT-010 resta **EXECUTION**. La correzione Mini di autorizzazioni e lifecycle è
integrata con [PR49](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/49),
merge `969f5d51510686fcaaeb007e3e08e35a7fb6bc73` alle18:14:36UTC; head approvata
`2068a77c6f68654e2be3f906576bc3cd0c8b5a8c`. Review dati e UX finale3c **APPROVED**,
zero finding aperti, candidate SHA256 `6838ac664799dfc2e10080ddfe15914fcd29bd1b500900902cbabb83a14d4c60`.

- Home e Account rimuovono il vecchio contesto solo dopo membership assente
  confermata. Timeout/read fallite mantengono il contesto valido; risultati
  obsoleti restano fenced. Account distingue sospensione/sessione scaduta prima
  di applicare risultati concorrenti, mostra shop/pending anche senza profilo e
  mantiene caricamento e Retry utilizzabili. Home offre Retry dopo invalidazione
  del read, senza applicare la risposta stale o avviare polling automatico.
- Sei test mirati **PASS**. Verify locale e CI reali: **221 PASS/0 FAIL/0 SKIP**
  (111TS+110JS), required checks/build/secret/diff PASS, lint storico1warning/7info.
  PR CI `37223564169` testa checkout virtuale `5ae2a538`; main CI `37223667569`
  testa effettivamente `969f5d51`, SUCCESS18:15:00UTC. Journal/sessione sono
  conservati nei test dei metodi App; non è prova di retention runtime autenticata.
- Primary aggiornato solo mediante fast-forward: clean, sette file source7/7
  uguali al freeze e tree identico alla head approvata. I104 file di configurazione
  e dist preesistenti sono byte-identici. Il generic build verificato nel worktree
  è **OFF**; il dist/AppService TEST preservato non è attestato come nuovo.
- Nuovo build/install TEST e collaudo autenticato Mini/Admin **NOT_RUN**. A03,
  C04, pending, convergenza, prestazioni e dispositivo fisico restano distinti;
  vecchia prepare A03 scaduta non riusata. Input/heavy lane appartiene a N:
  nessun UI/SDK o build TEST concorrente da W. Nessun deploy, SQL o produzione.

Le prove e gli stati dei checkpoint precedenti sono storici, non una nuova
attestazione di runtime, credenziali, registry o backend distribuito.

## Checkpoint storico — 2026-10-04 12:59 America/Santiago

WECHAT-010 resta **EXECUTION**: integrazione Admin completata, accettazione runtime
parziale. Admin PR128 è MERGED (`3201a311`) e CI main37175407216/Cloudflare37175407209
SUCCESS. PR130 è MERGED (`82af13ef`) dopo riconciliazione documentale/review della
candidata `e04603e3`; CI PR37175703098/Cloudflare37175703090 hanno realmente
collaudato `c0837c4e`, tree identico `b8ed55b2`. CI main37176343479 e
Cloudflare37176343496 SUCCESS; i tre job hanno checkout reale `82af13ef`, stesso
tree. Deploy staging/production SKIPPED; nessuna applicazione o riapplicazione SQL.
Primary Admin e cinque file staging preparati da altri sono preservati.

Mini primary `00c25323` pulita: rispetto alla receipt compilata `f68afed9`
cambiano soltanto otto Markdown; tutti102 file dist sono byte-identici.
Nuove copie private dei runner distinguono receipt storica e checkout attuale,
richiedendo esattamente otto modifiche documentali e checkout pulito.
Review statica approvata senza finding,16 test puri sul solo nuovo guard e quattro
controlli sintattici PASS; runner/receipt originali e controlli protetti invariati.

Preflight read-only TEST catturati04:24:31/04:25:17 UTC: Worker `22107a6f`,
registry155/latest `20261002180757`, digest SQL identity `9e4741b64d7b0999b3000f06990e922f`
concordi. Login WeChat ordinario del Mini PASS, Account canonico caricato e sessione
fresca alle01:29 Santiago. A03 conserva la sola receipt **PREPARED_ONLINE**:
SDK disconnesso, zero Save/logout, nessuna modifica rete. La sessione preparata
scadeva alle01:44:03 Santiago; la lettura successiva mostra Home con accesso
WeChat disponibile. Tentativo chiuso **NOT_RUN_PREPARATION_EXPIRED**, receipt
privata `root-not-run-expired-observation-20261004.json` SHA256 `e8ea75f1`;
prepare originale invariato, nessun observe/logout/ACK, nessuna nuova autenticazione.
Questo non accetta E05 né prova un evento logout o la generation corrente.

Input CUA al debugger rifiutato `noWindowsAvailable`; AX/screenshot leggibili,
ma un successivo click Throttling non apre il menu. Owner del prerequisito finestra:
utente/controllo Mac; portare davanti DevTools e lasciare Network aperto. Non è
prova OSlock o difetto applicativo. Dopo ripristino input serve una nuova normale
sessione/preparazione; i preflight salvati non sono un gate fresco per nuovi casi.

N comunica build finali e installazioni in-place Android `20fe`/iOS `c6a2`
riuscite, processi posseduti chiusi. Android: SHA installata esatta,19 tabelle Room
con COUNT/digest delle righe tipizzate/ordine schema identici prima e dopo,
Room22/quickcheck OK. iOS: profilo TEST `154a` esatto, stessa identità keychain,
container dati ricollocato e store popolati con integrità OK. La receipt install
`844ca4e9` resta **pass=false**: guard percorso non preservato, confronto business
prima/dopo completo e sessione UI non verificati; EXIT0 non promuove questo limite.
CI main iOS37177424913 SUCCESS alle02:07:13 Santiago, checkout `433e`,
1442 PASS/36 SKIP/0 FAIL. Receipt indipendente `a8aaf5ac` letta e hash verificato
qui: checkout e ID/stati/motivi skip corrispondono alla PR15; log ufficiali, nessun
xcresult remoto pubblicato o ispezionato. Ricevute Android `d9f6b39c`, install iOS
`844ca4e9` e store iOS `5dc559a6` anch'esse lette e hash verificati da W;
confermano l'installazione e i limiti descritti, non nuove osservazioni UI/DB.
Sessione/retention completa UI, recovery e convergenza restano non verificati;
nessuna nuova accettazione runtime nativa da W.
Il controllo input ora segnala `noWindowsAvailable` anche per Android;
DeviceHub riceve timeout. Nessun OSlock dedotto, auth reset o nuovo businesswrite.
W resta senza build, runtime o benchmark concorrenti.

N ha poi eseguito la classe Compose isolata: **3 PASS/1 FAIL/0 SKIP**, timeout
5000ms al retry dialogo(test138), log salvato `59251eef`. Il precedente tentativo
si era fermato al preflight senza invocare test. Review source-only W: la fixture
non apre l'editor nel ViewModel, lasciando il target baseline assente; i Save
vengono rifiutati prima del repository e il primo errore generico non prova
l'hook iniettato. Causa sufficiente dal codice corrente, distinta dal solo timeout
osservato nel log; nessun difetto di produzione dedotto. N ha corretto la sola
fixture `62e3afa9`: normale openEditor e contatori repo, invarianti e timeout
originali preservati. Review mirata W CONFIRMED_STATIC,0finding. Nuova classe
isolata **4 PASS/0 FAIL/0 SKIP**, una invocazione, alle03:03:13 Santiago;
log `8f1acda0`, receipt `471d727e`, review indipendente `c65aa90e` letti/hash
verificati. Receipt conferma owned emulator PGgone/serialabsent e zero azioni sui
simulatori autenticati. Il vecchio3P1F e preflightabort restano conservati.
PR16 Android **MERGED** alle03:22:45 Santiago, merge/main `fe0927c3`;
head `db6f110a`, CI37181929838 SUCCESS. N comunica receipt indipendente
headCI `3b27`:1127 PASS/7 SKIP e lint54/0Kotlin. CI main37182631429 SUCCESS alle03:32:42 Santiago, checkout reale `fe0927c3`.
Receipt indipendente `a8ed458c` letta e SHA256 verificato da W:1127 PASS/7 SKIP,
74XML/12step, tutti ID/stati/skip e lint54 byte-identici a head e main precedente;
zero nuovi warning o Kotlin. Metadata GitHub corrente SUCCESS verificata separatamente.
Questa CI non esegue i quattro Compose isolati né accetta runtime autenticato.
N comunica primary fast-forward con file locali/config/private/stash preservati,
nessun autostash. App production e artefatti212/20fe invariati; questa è una
integrazione test-only, non nuovo install o recovery autenticato.
Simulatori autenticati preservati, nessun caso di sincronizzazione accettato.

W ha ripristinato il client CUA e riletto DevTools: Home offre Sign in e
screenshot mostra Network. Dopo rilascio corsia N e notifica C, W ha eseguito
una sola verifica input: Raise supportato e apertura Throttling su screenshot
fresco. Il click riceve server `-10005:noWindowsAvailable`, menu non apparso.
Receipt osservazionale `38cfff30` e screenshot `51a92991` conservati0600, hash
riletti/verificati; nessun SDK/auth/Offline/Save/nativeinput Android-iOS o campione.
Corsia subito rilasciata. Nuova A03 non preparata; nessun blocker risolto o
difetto applicativo/OSlock dedotto. Richiesto all'utente il click normale Network
con DevTools davanti; è un prerequisito operativo, non una nuova approvazione. N conferma corsia native input/SDK/heavy libera, zero job locali propri;
report finale `80b2c1d2` e handoff `9a398b98` letti e hash verificati da W.
Resta unico inputowner Android/iOS; finestra Mini breve conclusa e rilasciata.
N conferma zero ulteriori input/SDK/heavy, nessun nuovo GO funzionale o prestazionale.
N comunica preparazione helper CSV04 **APPROVED_STATIC_ONLY** completa:
handoff `6314eaa1`,8pin/current217/source1a350/readback447; riferimenti quattro
client futuri NULL. Qualifica/GO/install/full11 ancora richiesti, runtime e campioni
restano zero. Questa preparazione non risolve il prerequisito input.

Ripresa successiva allo sblocco umano comunicato alle12:32 Santiago: N mantiene
la prima finestra nativa, W zero UI/SDK/heavy. Hash dei quattro runner correnti
confermati in sola lettura; runner.lock, arm C04 e root pending risultano assenti,
senza attestare AppService o concedere GO. Prepare `423bc608` resta scaduta/intatta.
N verifica alle12:44 le app effettivamente installate: Android5554 `20fe1478` e
iOS459 `c6a205f4` coincidono con le build finali; path dati iOS uguale al postinstall,
senza prova di retention business completa o sessione UI. Receipt `34ca8136`
riletta e SHA256 verificato da W; sessione/scope/READY UNKNOWN.
Il controllo UI fresco di N restituisce esplicitamente **Mac locked/manual unlock
required**: receipt registrata alle12:50 `9e15e7ce`, riletta e SHA256 verificato da W.
È un nuovo impedimento operativo, distinto dal precedente `noWindowsAvailable`;
non è un difetto applicativo. Zero launch/input/businessmutation/build/install
o campioni nuovi. N rilascia la corsia fisica e C conferma zero job/SDK/inflight;
nessuna A03fresh/login/UI finché manca un nuovo segnale utile di sblocco.
Richiesta umana già inviata da N, nessuna ulteriore richiesta o approvazione generica.

Performance privata v14 è
una copia con pin/path login correnti e relativi codici di errore, APPROVED_STATIC_DELTA_ONLY e sintassi PASS;
nessuna suite v14 o raccolta eseguita. Il wiring SDK CLOSE/LAUNCH resta static-only.
Conflitto C04, pending, convergenza quattro-client, misure residue e telefono
restano non accettati.
Nessun DONE o nuova qualifica globale; nessun deploy produzione, scrittura SQL diretta
o riapplicazione di migrazioni.

## Checkpoint storico — 2026-10-03 03:20 UTC

WECHAT-010 resta **EXECUTION**, con gate locali consegnati e accettazione autenticata
ancora aperta. Mini PR47/sorgente applicativa `f68afed9`, runtime TEST v11/102 file, verify219 e
CI post-merge37038908172 SUCCESS; configurazione protetta invariata. Admin PR129
è integrata (`553c4568`); TEST registry155 e Worker `22107a6f` sono separati dalla
versione di main. PR128/130 restano aperte con CI verde, in attesa dell'accettazione.
Android corrente: 1110 test (1103 PASS, 7 SKIP noti), build/lint PASS e cinque test
Compose effettivamente PASS; TEST APK `3ccf651e` verificato. Android PR14 è
integrata normalmente su main `04f6fe26`, tree identico all’head `b440c4f2`;
CI head37090849273 e main37091905186 SUCCESS, con i risultati effettivi
di tutti i 1110 casi e le sette esclusioni invariati tra le due CI.
iOS PR14/main `8dfbf9a0`, CI37084694560 SUCCESS: 1464 test (1428 PASS, 36 SKIP noti).
Le build native correnti non hanno ancora un nuovo recovery autenticato accettato.

Conflitto C04, logout offline v11/pending, convergenza quattro-client, misure
residue e telefono restano distinti. CSV iOS03 è una prova interrotta dal
supervisore, senza PASS applicativo o campioni prestazionali accettati. PSS
Android264 è preparato/revisionato, **NOT_RUN e senza GO**: il processo Studio
è presente ma il controllo JVM non lo enumera. Sblocco/rete DevTools Online,
accesso Dashboard TEST e riapertura normale Studio sono richiesti all'utente;
non viene aggirata alcuna autenticazione o restrizione OS. Nessun DONE o pilot.

### Difetti corretti, con limiti delle prove

- Mini Account nascondeva Sign out se il GET del profilo falliva offline pur con
  sessione valida. Il fix usa la sessione in memoria e invalida callback su
  revoca/hide; il dialogo pending ricontrolla generation/fingerprint/shop prima
  del clear. PR47/219 test/CI e installazione v11 sono PASS; A03 offline/logout
  autentico del nuovo codice è NOT_RUN. Il prepare precedente è scaduto senza logout.
- Admin rifiutava nel browser stock1.25 per step1 prima della richiesta server.
  PR129 introduce stepany; merge/CI e Save Admin autentico1.25 sono verificati.
  La restituzione dei codici legacy mantiene ora maiuscole/minuscole: SQL
  `20261002180757`/registry155,177 controlli PostgreSQL e postcheck invarianti PASS.
  Non viene dedotta dal SQL una convergenza nativa. PR128 bounded product bytes e
  PR130 conservano CI verdi; merge e accettazione finale restano aperti.
- Android separa il ledger canonico dei prezzi dal sottoinsieme materializzabile
  con parent provatamente tombstoned e conserva la prova atomica per i drain
  incrementali ordinari. Il nuovo delta aggiunge una diagnostica di checkpoint
  opzionale e corregge la cancellazione delle flight: `NonCancellable`/join attende
  il vero finally prima di rimuovere la registrazione. I test rossi originali restano
  conservati. Canonical1110 e Compose5 sono verdi; non provano F00/F01–F06 autentici.
- iOS corregge l'ordine UUID nel readback SwiftData usando il confronto lessicografico;
  i fix V6 conservano al reopen la fence locale già avanzata e la continuation
  ordinaria ZERO. Le prove con trasporto controllato restano distinte dal cloud. PR14/main8df
  e CI1464 sono verificati. I vecchi FAIL autentici restano storici e non diventano
  PASS per effetto dei test isolati. L'artefatto firmato `2783283d` è distinto dal
  checkout della CI e non è ancora accettato sul target autenticato preservato.

### Build, runtime e integrazione

| Componente | Sorgente e gate verificati | Runtime/limite |
|---|---|---|
| Mini | PR47/sorgente app f68afed9;219 PASS; CI main37038908172 SUCCESS | v11/102 file installati; AppID/configurazione invariati; A03/C04 residui non accettati |
| Admin | PR129/main553c4568; CI/head/main e release selettiva TEST verificati; PR128/130 aperte con CI SUCCESS | Worker22107a6f, registry155; catalogo TEST ON solo nello scope autorizzato, enrollment/altri flag OFF, trace OFF |
| Android | Authority264 `189d3e27`, map `510caf67`, sorgente dedicato814b137; canonical1110 e Compose5 PASS; PR14/main04f6fe26, CI head37090849273/main37091905186 SUCCESS | TEST3ccf651e/receipt160b222f; equivalenza metadata8/8 verificata, non installazione/READY autenticata |
| iOS | PR14/main8dfbf9a0; tree17194c93 identico all'head verificato; CI37084694560 SUCCESS | Firmato2783283d/source326ac3; Debug/Release/Analyze/local full1464 distinti dal bundle runtime e dal recovery autentico |

Android canonical:73 XML nuovi,1110 unici,1103 PASS/7 SKIP/0 FAIL; lint0 errori e29
warning,27 uguali al baseline e2 UseKtx con sole coordinate spostate. I 10 warning
non presenti nel nuovo report includono suggerimenti di disponibilità: non sono
10 difetti applicativi corretti. Nel log canonico quattro compile KSP/Kotlin sono
UP-TO-DATE; non viene dichiarata una compilazione fresca da quel log. La successiva
build TEST corrente è effettivamente fresca e verificata separatamente.

La CI Android di main ha eseguito checkout del merge `04f6fe26`, assemble, lint e
test con tutti i 12 step PASS. I 73 XML ufficiali contengono gli stessi 1110 ID,
stati e motivazioni SKIP della CI head: 1103 PASS, sette SKIP noti, zero FAIL/ERROR.
Il report lint è byte-identico a quello head: 54 warning e zero errori. Il confronto
head precedente conserva 52 firme esatte e due UseKtx spostati di sola riga rispetto
al suo baseline; i 25 avvisi di disponibilità sono espliciti. Non sono dichiarati
upgrade o warning corretti. Il log completo di main contiene compile Kotlin fresche,
zero diagnostici Kotlin/deprecation e due avvisi JVM CDS. La review salvata
`7c4dba65` approva questi risultati effettivi; il readback `11c8d476` lega
origin/main, tree e tutti i 13 file pubblici approvati. La build TEST `3ccf651e`
resta l’artefatto dedicato già verificato, senza rebuild o nuova etichetta.

Compose API35/1080×2400/d420, AVD5580 isolato: cinque metodi PASS, codice finale−1,
`OK (5 tests)`. Primo cleanup segnala gruppo ancora presente; la lettura successiva
02:06:14.940885 conferma gruppo35707 assente. L'esito immediato resta conservato.
Le assert owner prima/dopo legano source264 e APK app/testf3a902ee/d762cd28, ma non
esistono righe digest pre/post persistite separatamente: attestazione qualificata.

CI iOS1464=1428 PASS/36 SKIP,0 nuovi warning rispetto alla CI PR14. I risultati
locali e CI sono inventari distinti; nessun bundle CI o xcresult pubblicato dedotto.
La consegna Mini di questo checkpoint modifica solo otto Markdown: il riferimento
applicativo resta `f68afed9` e il runtime v11/102 file non viene ricompilato o
rinominato. Prima di una nuova prova, il guard SDK deve ammettere esplicitamente
il nuovo HEAD documentale verificando la stessa configurazione e gli stessi byte
applicativi; non si elimina il controllo del manifest.

I checkout primari Android/iOS con lavoro preesistente non vengono sovrascritti.
La copia sorgente Android dedicata resta immutata durante delivery/PSS/trace.

### Convergenza e prestazioni effettivamente osservate

La [matrice corrente39](WECHAT-010-COMPLETION-MATRIX.md) conserva ogni caso e il suo
criterio. F01 Mini→Admin/Android/iOS, F02 Admin→Mini/Android/iOS, F03 Android→gli
altri e F04 iOS→gli altri sono ancora NOT_RUN completi. Il reload Admin storico è
un readback manuale. Servono recovery terminale durevole, ID/revisione/campi/History
coerenti, ritorno foreground/rete e propagazione automatica senza refresh artificiale.
Non sono stati prodotti nuovi eventi finanziari o dati finti per creare copertura.

Sono preservate le misure Mini20warm/10search/6paging e i singoli Save/login con i
limiti originali; nessun nuovo percentile è dedotto dai tempi di build/CI/Compose.
Le serie cold, outbox, convergenza e immagini residue sono NOT_RUN. Pagina50,
batch16, envelope128KiB e polling3–30s sono limiti tecnici, non una nuova SLA.

PSS Android corrente264/3cc: la leaf `memory-descriptive-v3-current264-20261003`
riusa il metodo esistente, con otto soli literal e tre helper per riferimento;
review59b3be06, freeze649d40a7, equivalencec1a877a2. Prevede180 campioni ufficiali,
18warmup esclusi e3 capability, API35/SignedOut/Room22/sette count zero, slot2100s,
ADB≤10s/riserva90s/margine final720s. È **NOT_RUN, senza slot o GO**: jps-l non
enumera Studio PID5493 pur presente in ps. La richiesta umana è normale
chiusura/riapertura dell'IDE. Non si cambia la policy per produrre un PASS.
Anche una futura misura valida descriverebbe il dataset vuoto e le condizioni
resident IDE; non dimostrerebbe picco, causa, recovery o convergenza autenticata.

iOS CSV03: staging CSV/XLSX hash verificati e full7 vuoto invariato prima/dopo
(132 colonne/zero righe), ma nessuna visibilità picker/calibrazione accettata.
L'owner riferisce timeout5s della lettura ps e SIGINT ai propri gruppi; il wrapper
salvato registra KeyboardInterrupt/child−2. Getters ufficiali post-cleanup trovano
xcresult incompleto (Info.plist assente), quindi nessun PASS/FAIL dell'app inferibile.
Interruzione effettiva dopo19.175s: il budget480s non è stato esaurito. Il cap3/3
dei tentativi del protocollo è esaurito; nessun CSV04/seed/History/nove metriche accettati.
Propri gruppi terminati e FC4 shutdown; target autenticato459 preservato. Questa
è un'interruzione dell'osservatore, distinta dal blocco Mac o da un difetto dell'app.

### Residui e procedura di ripresa

- Owner utente: sblocco Mac e DevTools Network Online/No throttling; poi fresh
  session/scope e preparazione A03. C04v14 revisionato48 test è solo preparazione:
  nuovo singolo Admin Save, singolo Mini stale Save e Reload latest nativo;
  riconciliare gli effetti prima di ripetere. E02/E03/E05 seguono C04 accettato;
  la scadenza900s deve essere reale, senza estensione TTL.
- Owner utente: accesso personale al Dashboard TEST già aperto. Poi il solo
  percorso apply_migration autorizzato e guardato per le operazioni DDL residue;
  nessun DO/dynamic DDL o scrittura del ledger come workaround. Il probe rifiutato
  resta conservato; niente nuovo benchmark o recovery SDK mentre il backend è bloccato.
- Owner utente/ambiente: normale riapertura Studio e fresh JVM inventory prima
  della PSS. Il processo presente non prova la classe attuale né autorizza il GO.
- H01: nuovo inventario SDK03:02:59/03:04:20, Android: 0 dispositivi fisici online; unico
  tunnel Apple connesso coincide con il simulatore iPhone 15 Pro Max preservato (SIM459), non
  è una prova hardware. Due stati Apple non classificati e24 disconnessi restano
  espliciti: nessun telefono con WeChat/shop TEST validato. Collegamento e nuova
  verifica del contesto fisico sono la minima azione. I test compatibili con
  simulatori restano separati e non vengono rinviati per hardware.
- Root/native writer: installazioni preservate e smoke della combinazione finale
  dopo i prerequisiti backend/auth; poi soli
  cleanup applicativi delle fixture della run. D05 è già PASS, senza nuove
  cancellazioni. I02 non consente di eliminare diagnosi o dati estranei.

Riferimenti privati già autorizzati: packet `native-completion-20260928`, canonical
Android fa7bd0c2/review666dad53, Compose review4e29195c e cleanup06dbc236,
TEST160b222f/review3eadaaae/eightf6d87b56; Android mainCI review7c4dba65
e readback11c8d476; iOS mainCI reviewfa4a8502,
CSV03 adjudication37b3fcb1; matrice/deltacbfd1d49 e nota hoste1d546c3;
inventari hardware0907586b/f8aeae02 (solo metadata, zero app/auth/data action).
Nessuna credenziale, token, cookie, session_key o identificatore WeChat completo
è incluso. Questo consolidamento non è approvazione DONE né readiness del pilot.

## Checkpoint storico — 2026-10-02 16:39 UTC

WECHAT-010 resta **EXECUTION**. Mini runtime v10/main07ff35c0, configurazione e
sei fixture sono invariati. Nuova correzione locale ancora da integrare: Account
espone Sign out dalla sessione in memoria anche quando il profilo HTTP non arriva;
revoca/cambio sessione e hide invalidano richieste precedenti. Il dialogo pending
ricontrolla generation/fingerprint/shop dopo l'attesa e prima del clear: una risposta
vecchia non può eliminare pending o sessione di un nuovo contesto. Due regressioni
RED riprodotte prima dei fix; verify219PASS (111TS+108JS), lint/typecheck/build,
governance/privacy/secret scan PASS. Primo verify respinto solo dalla formattazione;
secondo intercetta il gate OFF, corretto senza indebolire il test. Review e ritest
DevTools del nuovo sorgente restano pendenti: i test isolati non attestano A03 live.

Prova autentica Account offline, senza Save/logout: sessione valida generation5,
shop canonico, remaining344s, pending0; account:null/loading:false/errore assente,
button.logout non presente. La ricevuta originale OBSERVED_OTHER resta conservata
perché il runner attendeva anche un errore che Account non espone. La proiezione e
il WXML confermano il difetto di visibilità indipendentemente da quel messaggio.
Rete ripristinata attraverso il controllo nativo: Throttling Disabled:Online.

C04 nuovo tentativo: unico Save Admin rifiutato dalla validazione nativa del browser
per stock1.25 e step1; nessuna richiesta business conclusa. SELECT indipendente15:57
conferma target/prices/audit/receipt e cinque fixture originali identici al before.
Mini Save non armato/eseguito; conflitto NOT_RUN. Reset normale Admin ripristina la
bozza. Nel Mini, Cancel del dialogo cinese conserva bozza/revisione; Confirm la
scarta e ritorna al dettaglio invariato, outbox0. Il primo probe di discard usa
erroneamente product.id e fallisce: ricevuta conservata; lettura corretta di
product.product_id PASS senza ripetere il gesto. Copertura limitata a quel dialogo
zh-Hans, non pending logout o localizzazione globale.
PR129 head1ee0e3b5 stepany ha due review e CI Database/Verify/Cloudflare SUCCESS;
nessun merge/deploy. Tree selettivo TEST1f0679b2 conserva quattro file già distribuiti
più la sola riga quantità; helper reviewed con intent esclusivo, build in preparazione.

Android154, APK96b3d613: normale boot16:06/userdata preservato, unico launch16:11;
nessun Retry manuale o mutazione. Accesso ripristinato, UI Cloud account connected.
Retry automatici16:14:59 e16:28:53 falliscono recovery_stage_apply_count_mismatch;
16:20:08 fallisce shop_sync_rpc_http_500. Backend osservato: checkpoint16:11:37
HTTP200 origin7062/upstream6868ms;16:20:00 HTTP5008283/8195ms, SQL57014 nel checkpoint
line910;16:33:54 HTTP2006436/6376ms. I campioni non sono percentili né accettazione.
App fermata con comando standard am force-stop16:35:18 dopo i tre fallimenti, quarto download interrotto
esplicitamente; la finestra automatica non è dichiarata conclusa. Copie SQLite
coerenti da processo fermo quick_checkok: main0business/outbox0, journal1 staging,
attempt19, binding SHA57efa9b6 invariato; staging parziale105supplier/74category/
5564product/5819manifest, prezzi0. Consenso mismatch_replace_confirmed precedente
conservato, distinto da same-scope; nessun reset o riscrittura del binding. Diagnosi
nativa e backend separate in corso. Non c'è manifest attivo o recovery accettata.

iOS154 precedente resta FAIL nonMonotonicOrDuplicateID. R-I07 lexical, binary050db10a,
23file/signature/configurazione verificati da root; non installato su459. PR13
exactheadfabae1e5 CI37031063547 FAILURE: il writer riferisce crash del nuovo controllo
sincrono, mentre il test servizio257 passa; diagnosi/fix e nuova CI restano aperti.
Nessun bootstrap459 o merge dedotto dai60test mirati.

TEST registry154 e Worker3521 restano correnti; nessun nuovo apply SQL, deploy,
produzione o public Mini. Performance Mini rinviata durante la lane di build.
Quattro-client roundtrip, pending/expiry, immagini residue, telefono e smoke finale
restano aperti. Nessun DONE o readiness pilot attestati.

## Checkpoint storico — 2026-10-02 15:51 UTC

WECHAT-010 resta **EXECUTION**. Mini main/runtime v10 `07ff35c0` e le sei
fixture restano invariati. Admin PR128 finale `7232637b` ha due review indipendenti,
561pgTAP/oracle completo PASS e CI Database, Verify e Cloudflare SUCCESS.
Il SQL è applicato una sola volta su TEST come `20261002150909`, registry154;
postcheck15:09:43 invarianti PASS. SQL SHA256
`9a09b8106aa8dbb3f86365ef964cc0e6a204fc8e38440b660716ebb179f04e27`.
Nessun nuovo apply, deploy Worker o modifica produzione.

Il recovery autentico iOS154 è **FAIL locale**, dopo entrambi i checkpoint HTTP200:
A15:11:07.795 origin5138/upstream5106ms; B15:20:14.802 origin4694/upstream4627ms.
Tutti i61598 record delle sei ledger sono scaricati; ordine UUID lessicografico e
unicità raw verificati. La baseline SQLite è valid con appliedAt, quindi il percorso
ha superato ricevuta, checkpoint B e tail prima del readback dello store persistito.
Termine15:20:24.8923988: `nonMonotonicOrDuplicateID`, verifiedConvergence=false,
didWork=false. Binding invariato, pending/journal conservati, manifest/finalizzazione
assenti. App terminata normalmente15:23; dispositivo459 shutdown15:30, dati preservati.
FAIL153 e tutti i tentativi precedenti restano conservati.

Diagnosi concreta: il sort SwiftData di recordKey usa localizedStandard, mentre
il proof accumulator richiede UUID lessicografici. Il writer iOS coordinato riferisce
RED del servizio reale con257record e GREEN60/0/0 dopo una sola riga `.lexical`;
artefatto firmato, review/CI e nuovo recovery autentico restano da verificare.
I due HTTP200 sotto8s non attestano recovery o convergenza quattro client.

Mac sbloccato e debugger Network accessibile. Mini login personale15:50 PASS,
Home empty, account/shop canonici, sessione fresca, nessuna mutazione business.
C04 conflitto resta NOT_RUN: helper privati aggiornati ai pin registry154/Worker3521
in review prima della prova. Serie Mini cold v10: setupFAIL prima di SignIn,
zero misure/mutazioni,4NOT_RUN; v11 diagnostico36test puri PASS, runtime NOT_RUN.
Misure prestazionali rinviate fino al rilascio del carico build iOS. Worker TEST
`3521a945` e binding/flag/tracing invariati. Nessun p95, SLA, telefono, DONE o pilot.

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

### Evidenze nuove e limiti

- C04 DevTools PASS per il doppio tap: due chiamate ufficiali Element.tap entrambe
  confermate, una sola creazione canonica; prezzi10000/47100 e stock1.25 concordi.
  Originali cinque oggetti e relative evidenze invariate. Misura host monotonic
  dall'invio dei tap al ritorno del catalogo:1093ms, n=1, inclusi SDK e osservazione
  con polling75ms. Ricerca e SQL successivi esclusi; nessun p50/p95 o SLA dedotto.
  Packet privato `doubletap-v10-cc2ad01c-96ca-491b-8ef6-98015c8706b1`:
  risultato originale `UI_OBSERVED_ORACLE_PENDING` preservato e riconciliazione
  distinta `C04_DEVTOOLS_PASS`; l'intento esclusivo resta non ripetibile.
- PR123 e PR124 hanno due revisioni indipendenti ciascuna, gate locali e CI head
  e post-merge verdi. Applichiamo soltanto le migrazioni revisionate in TEST;
  nessun deploy completo di Admin main né modifica produzione. Postcheck151
  SHA256`375b19d67e583ed4f2e106cd75e8e9327764ca6aa9748cc9012b6172ae5df971`:
  precedenti150entry intatte, solo corpo checkpoint previsto modificato,
  helper importi/OID/ACL/header, altre funzioni, trigger, dati e History fisiche invariati.
- iOS registry151: unico Retry UI01:39:43UTC, terminale fallito01:39:52.012612UTC;
  origin8256ms/upstream8127ms, SQL57014 nel SELECT finale di integrità.
  Accesso/shop verificati, pending0, binding invariato, nessun manifest o ricevuta
  finale nuova, verifiedConvergence=false. Android151 non ritentato inutilmente;
  precedente fallimento150 conservato. Ricevuta safe150–151 SHA256
  `a291f9c655ee3bfb5c7f2622c77f6d699f9ee3692c3cd219711e3c69bfa9dcf3`.
- La query finale isolata migliora, ma questo non risolve l'intera RPC: profilatura
  SELECT read-only senza impersonazione individua costi cumulativi anche in
  preflight, prodotti, prezzi ed eventi. I piani isolati includono strumentazione
  e non sono latenze end-to-end, percentili o risultati di recovery.
- Admin rimasto aperto non ha mostrato la nuova fixture prima del ricaricamento;
  successivo errore di caricamento dello strumento e Reload riportano il catalogo
  con il record esatto. Non attribuiamo ancora una causa applicativa e non
  promuoviamo il caso a convergenza automatica. Originale polling osservato preservato.

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

## Stato storico — 2026-09-29 01:45 UTC

### Mini: correzione Privacy e copertura recovery

PR43 integrata: merge `c95dacfea4bd98d21b9396430b5fda162db2eebd`, CI head
36506575180 e main36506636057 SUCCESS. Il delta successivo separa i titoli brevi
della barra nativa dalle intestazioni complete dei documenti Privacy/Eliminazione:
i titoli italiani e spagnoli risultavano troncati in v8. Testo canonico, hash,
accesso pubblico e assenza di autenticazione restano invariati.

Artifact applicativo/test `b0affd6f9a5cff9c2c63cebd1353934f7c80923a9a81f101f59ddcf397b6c721`
approvato da due reviewer indipendenti. Verify 211 PASS (111 TS + 100 MJS),
45 test mirati PASS. Nuove regressioni eseguono le scelte reali del dialogo di
conflitto senza invio automatico; audit catalogo da 125 a 185 righe con timestamp
uguali e refresh; eventi duplicati/decrescenti/replay/oltre checkpoint respinti
prima di cache, notifiche o watermark; archivio canonico non resuscitato da
notifica tardiva. Queste sono prove isolate, non convergenza runtime.

Build TEST v9: ricevuta `db7b3eb7`, base c95dacfe più il delta revisionato;
102 file verificati, configurazione byte-identica `37d94cf4`. Login autentico
sullo stesso profilo/shop PASS. Packet privacy-v9-audit-1790644928068: otto casi
(due documenti, quattro lingue) concordano integralmente con il contenuto canonico,
zero eccezioni; quattro screenshot iniziali verificano i titoli di eliminazione
ora leggibili. Non si attesta l'ispezione visiva di ogni riga intermedia né tutta G02.

### Backend distribuito e catalogo autentico

Admin PR115/116 integrate rispettivamente `46466364`/`53e58013`; CI post-merge
36505444494/36505444484 e 36506734780/36506734714 SUCCESS. Release Worker selettiva
01:31:13Z, versione `bdd42368-1398-4b74-8139-43d4b290dddf`, dai soli tre file del
trasporto/query e route catalogo. Due review, 11 test locali e preflight fresco
PASS; binding, flag, runtime/settings e singleton scope preservati. Enrollment e
altre superfici WeChat OFF; Mini auth/catalogo rimangono nel solo TEST autorizzato.
Smoke pubblico: cursor offset e testo240 raggiungono 401 senza credenziali;
testo241 resta 400. Il primo smoke senza shop_id era correttamente 400.

SQL esatta applicata via workflow canonico: sorgente20260928193505 →
service20260929013345 (History), sorgente20260929004159 → service20260929013437
(keyset). Registry147; tutte le precedenti145 entry/hash invariati. I sei corpi
funzione distribuiti coincidono con quelli revisionati; owner/ACL preesistenti e
quattro trigger preservati. Helper privati invoker/postgres-only, nessun EXECUTE
client. Backup protetto di definizioni/ACL/registry e metadata acquisito prima.

Piano esatto16 righe revisionato, SHA256
`ace817b560b3b6bf7dc6c4dc3be1be5fef791880bd84bc14bf51ac88fa1398b5`.
Applicazione fisica una sola volta con timeout/NOWAIT. Postcheck indipendente
01:39:14Z: tutti i full-row hash e revisioni identici, compressione NULL, marker0,
eventi2074 invariati. Nessun contenuto business modificato, nessun trigger
sospeso; questo PASS manutenzione non equivale a recovery nativo.

Packet catalog-measure-1790645825389: sette pagine/350 ID e revisioni microsecondo
concordano con SELECT canonica inventory_products; zero duplicati/omissioni entro
la finestra osservata. Sei load-more PASS, min323/p50 328/max2321 ms, p95 non
pubblicato per n6. Stesso clock host/gesto→nuova generazione dati pronti, polling
50ms incluso. Report originale MEASURED_ORACLE_PENDING conservato e receipt
oracle separata PASS. Errori iniziali dell'oracle (tabella errata e parser ISO
locale) corretti senza alterare i dati. I due paging HTTP400 precedenti restano
FAIL storici. Sort testuali/filtri completi e intero dataset non dedotti da350righe.

### Nativi e residui attuali

iOS R-I03finale: installazione in-place/firma canonica, due XCTest di UI e
riavvio PASS; Connected/outbox0 e classificazione Cloud check failed coerenti.
Dopo normalizzazione un solo Retry fresco 01:41:42–01:41:52Z supera il precedente
checkpoint_resource_exceeded, ma termina con HTTP500. Log server nella stessa
finestra: SQLSTATE57014 in sync_checkpoint_json_timestamp →
sync_price_recovery_row_v1 → sync_recovery_preflight_counts_v1, origin8645ms.
Recovery resta FAIL; il PASS XCTest è limitato al gesto e alla transizione.
Nessun Replace, KeepLocal, nuovo Retry o azzeramento dati. Diagnosi backend aperta.

Android R-A05 sul5556: prima Connected; dopo ordinary force-stop/start la UI
stabile mostra Not signed in. Log SupabaseAuth22:19:20–30 locale: attesa bootstrap
10000ms → Timeout → SignedOut. Nessuna perdita credenziali dedotta; stato
conservato senza login/reset per il writer nativo, che prepara R-A06.

Helper pending v10 aggiorna solo il Worker verificato; 26 test isolati PASS,
casi live non inizializzati, zero nuovi Save. DevTools continua a rifiutare i
clic coordinate con noWindowsAvailable; il debugger AX può risultare offscreen.
Non è prova di blocco OS. Richiesta umana precisa già pendente; rete rimasta online.
A03/E02/E03/E05 runtime, conflitti/immagini residui, convergenza quattro client,
misure restanti, smoke finale e telefono conservano gli stati della matrice.
**EXECUTION; nessun DONE, PHONE_VALIDATED o PUBLIC_RELEASE_READY.**


## Stato storico — 2026-09-29 01:05 UTC, catalogo e recovery in esecuzione

Mini PR42: merge `c6630e0698edb0699d253fa91779880937292d30`, CI head
36473221012 e main36473334165 SUCCESS. Runtime v8 invariato sullo staging;
le precedenti prove Sales, layout, icone, immagini e offline rimangono limitate
ai casi già osservati. Configurazione TEST invariata; nessun nuovo pairing.

Il nuovo collaudo catalogo riproduce HTTP400 alla seconda pagina. La diagnosi
isola tre difetti: OpenNext AWS4.1.0 ricostruisce una query già decodificata senza
encoding (`+00:00` diventa spazio e `&` nella ricerca separa parametri); il
predicato SQL non segue l'ordinamento misto timestampDESC/idASC (40 duplicati
tra due pagine da50 nella diagnosi autorizzata); Mini invia timestamp anche nei
sort testuali. Un limite route200 inoltre non ammette i nomi canonici240UTF16.
La correzione Mini fissa il sort per la richiesta e manda soltanto cursorAt per
updated_desc oppure cursorText per name/barcode, inclusa stringa vuota, con
precisione server invariata. Quattro regressioni attraversano101righe/tre pagine;
verify208PASS (110TS+98MJS), due review indipendenti APPROVED sull'artifact
`1a85eb168fe63e5533923ae3dd0131920beef681f1b9680e02477010e13dd6bc`.
Nessuna conversione Date/Z o doppio encoding usata come correzione client.

Admin: delta SQL/trasporto/cursor240 revisionato separatamente da due reviewer,
18nuovi pgTAP+49parity PASS e7test Node/workerd PASS. Build Cloudflare applica
una patch circoscritta a req.url, con versioni/hash sorgente fissati, backup
esclusivo e ripristino; metadata routing/auth restano invariati. Verify e build
Node22PASS; foundation1030PASS/8skip/2ENOENT di file Win7POS esterni, non fullPASS.
Distribuzione staging, applicazione SQL e ritest catalogo autenticato restano
NOT_RUN a questo checkpoint. Le diagnosi precedenti FAIL sono preservate.

Normalizzazione fisica History: Admin PR115 integrata `4646636433e1232f045b394b4c6f242c8011efba`,
CI36505444494 e Cloudflare36505444484 SUCCESS. Procedura privata postgres-only,
manifest esatto, limiti prima del detoast, lockNOWAIT e ledger monouso verificati:
63nuovi pgTAP+365native PASS, restore/reapply e contesa reale55P03 senza effetti.
Solo integrazione sorgente: **nessuna normalizzazione TEST eseguita**. Restano
16History compresse nello shop; DDL deve rispettare la finestra senza scritture
con gli altri lavori staging e il preflight fresco. Nessun trigger disabilitato.

Android: PR10 merge `1bf758dd8d83a771dcfdb1844a223a036ba19eff`, CI head36471042788
/main36472844511 SUCCESS; APK R-A05 già descritto rimane il runtime osservato.
iOS: build firmata canonica risolve errSecMissingEntitlement; account Google
conservato dopo installazione in-place e riavvio ordinario (R-I02). Su R-I03 un
Retry effettivo29/09 00:46UTC mantiene Connected/outbox0 e mostra il rifiuto
checkpoint_resource_exceeded con data/shop corretti. La card generale lo
presentava impropriamente come problema permessi; fix nativo R-I03finale
installato: UI e riavvio ordinario PASS in due prove XCTest senza nuovi Retry.
Connected/outbox0 persistono, card Cloud check failed e diagnostica concordi.
Receipt privata ios-ri03-final-runtime-receipt.json. Dati preservati; nessun Replace
/KeepLocal. Autenticazione valida non equivale a recovery/convergenza riusciti.

Prestazioni con clock unico host, gesto SDK→nuova sequenza/dati pronti, overhead
polling50ms incluso:20aperture calde catalogo p50=562ms,p95=1133ms,min491,max2510;
10ricerche fixture p50=1021ms,max2071 e10vuote p50=1020ms,max1424 (p95non
pubblicato per n10). Dataset circa19.832prodotti.40campioni completati, report
PARTIAL per successivo errore selettore del runner. Due tentativi di paging
falliscono realmenteHTTP400; nessun campione riuscito di paging dichiarato.
Login distinto7793ms,n1; nessun percentile/SLA. Cache non misurata. Durate dei
runner storici contenenti atteseSDK3s restano escluse dalle latenze applicative.

Helper pending/restart/expiry revisionato2/2 e26regressioniPASS, ma casi live
non iniziati e zero nuovi Save. Il controllo GUI restituisce noWindowsAvailable
per i clic coordinate; apertura rete tramite AX senza effetto. Non è prova di
blocco OS. Richiesta finestra DevTools accessibile, lavoro indipendente prosegue.
Nessun PASS su conservazione/eliminazione pending, scadenza, convergenza quattro
client o telefono. La matrice operativa conserva tutti i requisiti aperti.


## Stato storico — 2026-09-28 19:20 UTC, completamento in esecuzione

Mandato cross-client in **EXECUTION**; nessun DONE o readiness del pilot.
La matrice [WECHAT-010-COMPLETION-MATRIX](WECHAT-010-COMPLETION-MATRIX.md)
distingue prove autentiche, regressioni isolate e gate reali. Le correzioni native
sono coordinate con la chat autorizzata «Correggi sync e parità Android/iOS»,
unico writer dei due client; questo writer cura Mini/Admin e i simulatori dedicati.

### Risultati nuovi e difetti corretti

- Cleanup immagini della run: **PASS** 18:16Z. Due versioni storiche, quattro
  oggetti oltre il grace period sono stati rimossi dal percorso canonico
  prepare-cleanup → Storage removeOne → record-cleanup, con manifest esatto,
  assenza di riferimenti e primaria nulla. Readback indipendente: tre versioni
  della run complete, zero oggetti residui. Retry `ALREADY_COMPLETE_NO_WRITE`;
  sei regressioni PASS. Nessuna cancellazione SQL diretta, migrazione o modifica
  di scheduling: TASK-137 prevede un percorso manuale. Helper revisionato SHA
  `a79d6d68ab69b5d5dc8229020d6c18d63618fd39069b4413645bccf391208f04`.
- Sales: il polling sostituiva una finestra di 100 righe con le prime 50;
  `Carica altro` ricompariva dopo EOF. Ora la finestra caricata viene riletta con
  cursor canonici, query immutabile e deduplicazione. EOF noto è verificato con
  lookahead massimo una riga; cache contraddittoria esclusa. Lock prima delle
  letture preparatorie, invalidazione immediata di ricerca/hide e pulizia
  sincrona di righe/aggregati/timezone al cambio scope impediscono i race
  riprodotti. Le risposte negate non conservano dati sensibili.
- Sales UI: filtri tipo/stato/pagamento ed etichette delle righe localizzati in
  quattro lingue, codici wire invariati. I 30 riepiloghi giornalieri sono ora
  scorribili; la colonna spagnola va a capo senza nascondere importi. DevTools:
  quattro lingue, 30 giorni e fine intervallo osservati, stato vuoto coerente;
  dataset del periodo senza vendite, paginazione multipagina testata in isolamento.
- Audit UI ha inoltre riprodotto codici lunghi che spingono `Ripristina` fuori
  viewport negli archiviati e stato Account `active` non localizzato. Delta
  limitato a wrap/colonne e nomi di presentazione Account. Ritest12casi
  Account/archiviati/modulo vuoto nelle4lingue: dati/assertions PASS, zero
  eccezioni e lingua iniziale ripristinata. Verificati visivamente CTA restore e
  Account; titolo ES abbreviato e metadati archiviati separati su righe.
- Patch applicativa `69308ee09bd954c7746b4539df835fef9e444669188cf738c8573f3198df1b00`,
  review indipendenti 2/2 APPROVED sullo snapshot finale, incluso
  addendum titolo ES/separazione metadati. Verify **204 PASS (110 TS + 94 MJS)**,
  inclusi governance/privacy/segreti/typecheck/lint/build. Regressioni Sales
  mirate 14 PASS. Integrazione e CI remote ancora pendenti a questo checkpoint.

### Native: evidenze attuali e limiti

Android, solo `Medium_Phone_API_35`/emulator-5556: installazioni in-place con
Google e scope TEST conservati. R-A04 risolve l'assenza di device identity nel
recupero iniziale del DB vuoto. Il successivo `MissingFieldException` è stato
riprodotto su log fresco e corretto da R-A05 nella decodifica status-first.
APK `dc11b6ee4be66480f48e50d3cebb0c64e2776d5c8cb8ebdf93a08650d70920d3`,
corrispondente al sorgente nativo `84899b8e`, osservato alle19:12:31Z:
`checkpoint_resource_exceeded`, RPC `shop_sync_recovery_checkpoint_v1`,
missingFields none. Un tentativo dal journal esistente, nessun nuovo Replace.
Prodotti/relazioni/prezzi/History/outbox locali restano vuoti, binding invariata;
journal resta1 ma runId/attempt6→7/reason/backoff cambiano come previsto.
Questa è verifica dell'errore e della conservazione, **non recovery riuscito**.

Backend TEST: preflight rifiuta 16 History shop-scoped con TOAST `pglz`,
`compressed_legacy_history_requires_remediation`. La compressione è fisica di
PostgreSQL, non gzip applicativo. Il trigger canonico verifica anche OLD e
rifiuta riscritture ordinarie; nessun trigger disabilitato, gate allentato o
History estraneo alle fixture riscritto. Procedura di remediation da verificare.

Su iPhone15ProMax/iOS26.1, Release TEST iniziale `86fb6be6` installata senza
reset. Login Google autentico riuscito, ma discovery non conclusa e accesso
perso dopo rilancio normale. Il bundle aveva zero entitlements Keychain;
la lane nativa ha confermato `errSecMissingEntitlement` con chiave dummy su
simulatore separato e prepara firma canonica. Nessun Replace/Keep Local scelto:
i dati locali preesistenti sono preservati. Nessun PASS iOS sync/convergenza.

### Runtime, strumenti e prestazioni

Packet privato: `_codex-private/wechat-010-admin-audit/native-completion-20260928`.
Report e screenshot falliti conservati; errori del runner non promossi a PASS.
Audit pagine 11×4: giro originale interrotto, follow-up completa i casi italiani
mancanti; la verifica visiva ha trovato i difetti sopra. Dialoghi pending,
privacy e ulteriori stati errore non sono coperti dal solo audit pagine.
I tempi `navigationToDataReadyMs` del runner includono il delay fisso di3s
nell'SDK ufficiale e **non sono latenze applicative né percentili**.
Restano misure dedicate, recovery con riavvio/scadenza, immagini interrotte,
convergenza nelle quattro direzioni e telefono fisico. Nessun PASS hardware.
Worker staging `beb94e1e`, registry145 e configurazione TEST `37d94cf4`
verificati invariati; nessun nuovo provisioning o lettura di AppSecret.

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

Stato corrente: **pilot TEST parzialmente collaudato:17letture,13casi catalogo,
3operazioni immagini e recupero offline con feedback finale PASS in DevTools.
History8 nell'ultimo readback; catalogo leggibile nelle quattro lingue in DevTools. Convergenza nativa,
telefono e prestazioni restano aperti.** Nessun DONE auto-approvato.

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

Ricevute offline: [PR35](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/35),
[CI head](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36289794509),
[CI merge](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36289849010).
Build PR35 verificata: `aa82277447040175a78379e7b6df5e2658d172991fc6043c0fa2954a0eb85a49`;
config `37d94cf427edb67d5f2dc3fa7eced1968cd69c6c53fd6aa7cf2a2e8ce4367d32`.
Build cumulativa PR35+PR36 verificata:
`4519388b3b125fa4306b077e2b2f650508395fa568201216a6ee5e721e27c10a`.
Modulo feedback revisionato:
`c2ee1d1cb2a431aee4827f81f87ca4dc5ed8211b2a9dc952a01e5c1f2acfbff0`.
Ricevute lingue: [PR36](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/36),
[CI head](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36290284596),
[CI merge](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36290330031).

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

Ricevute: [PR34](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/34),
[CI head](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36288360907),
[CI merge](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36288419063).
Manifest sorgenti/dist della build pronta:
`f7182cca3f54ac538e9a3d3266545ed3c2bd82493022c2c0ad8753b4460ed5f1`.
Runner revisionato:
`c52a0484ca64a0e1619dd077d2611609fe138b984be6391c54b566a447151ef0`.
La precedente misura immagine non include un campione di latenza di solo upload:
la durata del runner comprende coordinamento del selettore e readback indipendente.
Nessuna nuova attestazione di p50/p95, telefono o convergenza.

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

Ricevute integrazione: [PR32](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/32),
[CI head](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36286588193),
[CI merge](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36286645051).
Dettaglio tecnico: [normalizzazione JPEG](WECHAT-010-JPEG.md).
Manifest completo sorgenti102/dist101:
`529dd790dc61792253f3589027fec71ac07eefde35b25c24fc47c93994230129`.
Nuova modalità una tantum images-jpeg pronta: stesso prodotto del run, versione
failed precedente preservata, preflight freschi obbligatori e nessun tentativo
durevole prima del picker. Non è stata eseguita mentre il Mac è bloccato.

## Ripresa 2026-09-27 — icone tab e nuovo esito immagini

L’utente segnala Mac sbloccato e chiede controllo delle icone. Screenshot reale:
le5voci native mostrano solo testo; app.json non definisce iconPath/selectedIconPath.
Il delta aggiunge10PNG trasparenti81×81 sotto40KB, colori tab esistenti e tratto
selezionato più marcato, e copia esplicita dei PNG nella build. Generatore Pillow
solo opzionale per rigenerazione asset; nessuna dipendenza runtime/build aggiunta.
Verificati PNG, dimensioni, alpha, budget, parità byte sorgente/dist e contact sheet.
Node26.7 verify155PASS (110TS+45MJS), diffcheck PASS. Review e integrazione sono
tracciate dalla PR associata al delta; verifica delle icone nel simulatore ancora pendente. Il logo del profilo nel portale WeChat
è distinto dalle icone di navigazione e non è stato verificato o modificato.

Nuova sessione autentica dopo ricompilazione ufficiale della build PR29 su
main73ae7520; scope canonico verificato dal runner, Workerbeb94e1e invariato.
Preflight backend/Worker rinnovati00:05UTC: registry145 e allowlist/flag esatti.
images-lifecycle una tantum: selezione camera tramite picker ufficiale, preview
rilevata e confermata dal controllo reale; fallimento IMAGE_UPLOAD_ERROR,0casi PASS.
Il server ha registrato una versione alle00:06:51UTC e l’ha rifiutata con
jpeg_metadata_forbidden: statusfailed, finalizedfalse, cleanup_statuspending,
primary immagine null. Letture indipendenti00:07–00:12 e stato UI confermano
1intento/1versione, outbox0 e nessun tentativo immagine locale durevole.
Journal VERIFIED significa esito conosciuto, non operazione riuscita.
Ricevuta privata reconciliation-failed-version.json; reportFAIL immutabile.
Non ripetere images-lifecycle; cleanup backend ancora da verificare.

Diagnosi minima avviata successivamente con nuovo intento PREVIEW_ONLY:
apertura picker per leggere soltanto marker/lunghezze del JPEG compresso e
annullare l’anteprima, senza upload. Il Mac si blocca prima della scelta del file.
Diagnosi PREVIEW_ONLY_PENDING_CANCEL, da annullare e riconciliare allo sblocco.
Nessuna nuova mutazione dopo il fallimento noto e nessun aggiramento del blocco.
Il fix metadata non è ancora implementato: identificare prima i segmenti effettivi,
senza rimuovere ciecamente ICC/Adobe o indebolire il validator server.

## Evidenza autentica e runtime — 2026-09-26

Pairing personale verificato separatamente dal login Home: Tencent accetta la
credenziale TEST; mapping, audit e due prove consumate corrispondono al target.
ROTATION NOT_PERFORMED / ACCEPTED_FOR_TEST_ONLY restano invariati. Pairing
preservato, enrollment chiuso, nessuna nuova identità o sessione artificiale.

Build Mini usata nelle prove `0956e1a3d60748623d622e837fd70d8ece3c2883`,
Admin applicativo `aa455df14b2531426adc421271d44b3ce48a188a` prima del fix sync.
DevTools ufficiale2.02.2609232/base3.17.0, SDK0.12.1, viewport375×639,
urlCheck true. Manifest dist `da0b67ff36811b2e305eafe67c104403122fab2c88bd979e0b39c1d034e53bec`.
Worker effettivo **beb94e1e-7c26-4d34-ab20-f0b0d0be9315** al100%, codice runtime
selettivo **a805d64044dec3b1304f5c52709f886580c48390**. Auth Mini e catalog
mutations ON; enrollment/linking/Web/Android/iOS WeChat OFF. Google nativo è
un sistema distinto e l'accesso è stato eseguito personalmente dall'utente.
Allowlist esatte, altri binding e tracing OFF preservati. Nessun deploy main intera.

Run letture `5086f26a-d829-49a6-bd24-a0348fd8a134`:11PASS15:32–15:35UTC,
più5PASS storici15:47–15:48UTC,0eccezioni. Profilo/shop canonici, prima pagina
50prodotti anche nel rendering, ricerca barcode/dettaglio/3prezzi,50categorie,
78fornitori e periodi Home/vendite verificati contro SELECT indipendenti.
Zero vendite correttamente nel periodo2026-09-01..09-26; ultimi30giorni dal08-28.
Nel periodo2026-06-07..07-06:12documenti esistenti (8vendite,2rimborsi,2annullamenti),
filtri e dettaglio righe concordi. Nessuna transazione finanziaria creata.

Run scritture `e21c8dd0-acb6-4d8e-8cd1-649307536bf4`,16:02–16:06UTC:
**9PASS UI+readback** —2categorie,2fornitori, prodotto completo, modifica,
archiviazione, ripristino e rifiuto barcode duplicato. Acquisto10.000CLP,
vendita47.100→48.200CLP, quantità1,25; nome/relazioni/prezzi canonici verificati.
Report complessivo WAITING_PERSONAL_ACTION per timeout della conferma di uscita
bozza duplicata;9intent VERIFIED,5fixture tracciate,0nuove eccezioni.
La successiva uscita/discard tramite GUI è osservata, ma non prova la ripresa
retroattiva del runner. Creazioni non ripetute.

Continuazione 17:12–17:39UTC: **4 ulteriori casi catalogo PASS**, rinomina e
sostituzione con archiviazione per categoria e fornitore, tramite UI reale e
SELECT indipendenti. Il prodotto proprio punta ora a categoria-b/fornitore-b;
le due entità precedenti risultano archiviate. Totale 13 casi catalogo, senza
nuove fixture. History filtrata sul prodotto mostra 5 ID che coincidono con
5 audit canonici: **1 ulteriore scenario lettura PASS**, totale 17, non 5 casi.
Journal della continuazione e delle tre operazioni manuali VERIFIED.
I fallimenti del runner restano conservati: clock del readback lievemente
avanti risolto attendendo l’orologio reale, errore controllo picker e un
caricamento categorie HTTP503/5,14s. Riapertura UI riuscita; nessuna causa
definitiva attribuita al 503 e nessun report fallito riscritto come PASS.

Tentativo immagine16:15UTC: sessione scaduta prima del picker; nessun upload.
Intent manuale RECONCILED_NO_WRITE, readback prima/dopo identico e nessuna versione
immagine. Due JPEG sintetici propri pronti per il picker non provano camera fisica.

Tentativo 17:39–17:40UTC: selezione effettiva del JPEG proprio nel picker
DevTools, errore app prima dell’anteprima (IMAGE_PREVIEW_ERROR), sessione ancora
valida al controllo successivo. Report FAIL/zero casi PASS conservato. SELECT
scoped post-tentativo: zero intent e versioni, immagine primaria nulla; outbox
e tentativi durevoli immagine vuoti. Journal VERIFIED significa soltanto
riconciliazione RECONCILED_NO_WRITE, con intent/context/shop/prodotto e hash
dei readback protetti; non certifica upload riuscito né autorizza replay.
Diagnostica tramite API native reali: JPEG 900×1200, compressione/miniatura
288×384, SHA-256 e byte ArrayBuffer con marcatori JPEG validi. Non è una prova
del percorso app: in quel momento la causa non era localizzata. La successiva
diagnosi e il fix sono registrati nella sezione cross-realm qui sotto.

## Difetto sync corretto e integrazione

Il primo checkpoint Mini restituiva503: il device autentico ha0registrazioni
shop_devices e il resolver nativo richiedeva una lease attiva del dispositivo nativo in shop_devices. Migrazione Admin
**20260926164349_wechat_010_mini_session_sync_scope**: reader privati dedicati
alla sessione Mini, profilo e membership effettivi; mapping, locks, proiezione,
limiti e snapshot preservati. Funzioni native e loro ACL byte-identici al remoto
prima della modifica; nessuna lease artificiale o dato business modificato via SQL.

Review indipendente APPROVED, SHA SQL
`1800620a45edbc5e84c4ac8286d124cbbd664161b37effb26a68c7d514a14ad9`.
523pgTAP isolati PASS (84pairing,52BFF,22letture,365native), Node22 verify PASS,
1031foundation PASS/2skip. Restore delle vecchie wrapper riproduce il difetto;
wrapper-only reapply84PASS. Piano compensazione protetto: ripristinare solo le
wrapper tramite nuova migrazione, conservare helper privati revocati e registry.
Nessuna cancellazione di storia o sessioni prevista.

Applicata una volta16:43UTC; timestamp sorgente riconciliato senza cambiare SQL.
Registry145 con tutte le precedenti144 versioni/nomi/hash invariati; zero commerce.
Quattro funzioni Mini corrispondono a fingerprint/owner/ACL del DB testato;
advisor security/performance invariati escludendo timestamp di osservazione.
[PR114](https://github.com/XNIW/merchandise-control-admin-web/pull/114) head
`59b680d140fa3dd0b8ab784b409c78a00d659c1f`, review APPROVED e CI/Cloudflare
36256703510/36256703513 PASS; merge `fe4907adc51ff842720e1c7eb36aa05e0fa53cb8`.
Release selettiva `22158297` aggiunge solo SQL già applicato; Worker runtime invariato.
Ritest autentico dopo fix: checkpoint HTTP200 e watermark scoped 12425.
Alle17:52:51UTC il watermark persistito è12430; SELECT indipendente17:53:17UTC
conferma max12430 e i5eventi12426–12430 delle modifiche alle relazioni
(catalog_changed/tombstone). lastReconciledAt resta17:07:50.617Z: avanzamento
del cursore dopo le modifiche verificato. Questa prova non attesta salvataggio
offline, aggiornamento di ogni schermata, budget temporali o convergenza nativa.
Ricevuta privata sync-delta-live-reconciliation.json con ambito esatto.

## Ricontrollo dei simulatori — 2026-09-28 17:25–17:41 UTC

Su nuova autorizzazione dell'utente, avviate le app esistenti da Android Studio e
Xcode sui dispositivi già configurati: Medium Phone API35 e iPhone15ProMax/iOS26.1.
Android Studio conferma installazione riuscita e processo attivo; Xcode mostra
l'app in esecuzione. Configurazioni TEST e selezioni account/shop canoniche
ricontrollate. Nessuna modifica ai sorgenti nativi o reset dei dati.

Il nuovo avvio iOS registra device status active/success sullo shop autorizzato;
non equivale a sync riuscita. Lo stato persistito resta recoveryRequired con
keyNotFound(catalog), ma il timestamp dell'errore è ancora del26settembre:
nessun nuovo retry fallito attestato. Android emette al nuovo avvio skip per
business_scope_blocked/CHECKING; nessuna convergenza dedotta dal solo avvio.

La prova UI è BLOCKED_TOOL_UI: Device Hub restituisce ripetutamente timeoutReached,
anche dopo «Riprova ora» dell'utente e reinizializzazione CUA; Running Devices
Android rimane vuoto con emulatore attivo e un tentativo a coordinate restituisce
windowNotFoundAtPosition. Nessun controllo business UI segnato PASS. Chiesto uso
esplicito di ADB e XCTest/simctl per i test interattivi alternativi, come richiesto
dalle istruzioni del controllo UI. L'avvio e le letture diagnostiche sopra sono
già eseguiti; retry UI e readback del catalogo sui client restano da completare.
Le diagnosi del26settembre sottostanti rimangono distinte dal nuovo ricontrollo.

## Simulatori e blocchi concreti

Android MediumPhone/API35, sorgente ca0a58d8: build riuscita, Google personale,
progetto TEST e profilo/shop canonici verificati da UI/config e preferenza scoped.
Shop TASK068E selezionato. Diagnosi successiva: owner corretto ma store del
binding locale diverso dallo shop scelto. Arresto normale tramite Android
Studio; copia coerente DB/WAL in sola lettura conferma zero righe nelle12tabelle
business/cache controllate. Riavvio e scelta UI «Replace with cloud data»
registrati con intent; nessun dato ordinario da sostituire.
Recupero fallito con rollback Room: binding_replace_device_identity_missing,
scope ERROR_RECOVERABLE. InventoryRepository richiede un deviceId persistito
per sostituire il binding; la registrazione che lo crea richiede scope READY.
Review indipendente conferma la precondizione circolare. Non è un blocco
Supabase risolvibile ripetendo login o cambiando shop. Occorre un fix nativo
fuori dal mandato attuale; nessun ID inventato, reset DB o modifica sorgente.
Il catalogo rimane vuoto e la sync sospesa; convergenza non attestata.

iPhone15ProMax/iOS26.1, sorgente c55e3a93: Google personale e stesso scope
verificati. iPhone17/iOS26.5 aveva fallito l'avvio; usato simulatore esistente.
Vecchio banner di recupero proveniva da stato luglio, non da una nuova richiesta.
Retry GUI16:36UTC eseguito: errore fresco keyNotFound(catalog). Decoder nativo
richiede catalog prima di leggere status; il contratto server omette catalog nei
risultati resource_exceeded/invalid_baseline. Readback16:47UTC:16storie attive
compresse su178 nello scope verificato, condizione che attiva il gate nativo
compressed_legacy_history_requires_remediation. Nessun payload storico esposto.
Dati ordinari e sorgenti nativi invariati; niente reset, import o remediation arbitraria.
Correzione decoder/remediation nativa richiede un mandato distinto per quelle superfici.

## Fix lettura immagine cross-realm — 18:09UTC

Il Mac è nuovamente accessibile. L’utente autorizza esplicitamente Codex a
premere «Sign in with WeChat» dopo scadenza e a proseguire autonomamente le
operazioni del pilot TEST. Riaccesso effettuato tramite il pulsante reale:
sessione attiva, stesso shop; nessun token/sessione iniettato o blocco aggirato.

Debugger sulla stessa build: il primo fallimento è nel catch readFile durante
la preparazione. Secondo breakpoint nell’adattatore: callback readFile:ok,
ArrayBuffer63760byte, instanceof ArrayBuffer false, getter intrinseco
byteLength.call sul medesimo valore63760. La causa è il buffer da un diverso
contesto JavaScript, non JPEG invalido, rete o scadenza. Entrambi i nuovi
tentativi diagnostici sono riconciliati NO_WRITE con zero intent/versioni;
nessun upload o anteprima confermati. Breakpoint disattivati e runtime ripreso.

Fix minimo: riconoscere il buffer tramite il getter intrinseco byteLength,
che controlla lo slot interno anche tra contesti e rifiuta oggetti/tag falsi;
regole JPEG, SHA-256, dimensioni, permessi e confine server invariati.
[Specifica ECMAScript](https://tc39.es/ecma262/multipage/structured-data.html#sec-get-arraybuffer.prototype.bytelength).
Regressione locale prima: cross-realm rifiutato e oggetto con prototipo finto
accettato; dopo:3/3PASS, inclusi negativi stringhe/view/shared/proxy/tag falsi.
Node26.7 verify152PASS (110TS+42MJS), tutti i gate richiesti inclusi. Il primo
verify del delta si era fermato per formattazione, corretta prima del rerun.
Alla chiusura del solo fix buffer il ritest era NOT_RUN; il successivo tentativo
autentico descritto sotto supera il buffer ma rileva il difetto lifecycle. Nessun PHONE_PASS.

Integrazione: [Mini PR28](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/28),
head834a93e45b01e278e63ec84529114ea45d116b6e, due review APPROVED,
CI36261996217 PASS; merge8347df51add659714f5fa23d27863a48f84c0d25,
postmerge36262050372 PASS. Precedente report PR27 integrato7160922,
CI36261203508/post36261559258 PASS. Nessun deploy Worker o DDL aggiuntivo.

Build TEST18:20:01UTC da main8347df51, Node26.7: cambia solo lib/platform.js;
configurazione compilata identica37d94cf4. JS compilato SHA256
ef61d94b92ce09395899292eda306481833d52259ab3ea15b4f3eaae2a2de488;
manifest dist acae03c61e362423b2c034d6d13e5fd5a864caa3ea554d92cf0f12bd6b9f85ec.
Mac temporaneamente bloccato alle18:20; accessibile alle18:22. Ricompilazione
ufficiale e riaccesso autonomo osservati, nuovo runtime effettivamente caricato.

Continuazione privata images-buffer con nuova directory una tantum:18test PASS
e review indipendente APPROVED. Pin del sorgente e del JS compilato; nessun
tap camera/album con intento immagini pendente del medesimo account/shop,
compresi record senza indice. Report falliti e fixture precedenti conservati;
nessun replay o nuova creazione. Il tentativo images-buffer è FAIL
ACTUAL_GUI_OR_DEVICE_ACTION_REQUIRED perché la ricevuta di coordinamento GUI è
arrivata dopo60s; conserva0casi PASS. Separatamente la UI mostra cancellazione
dell’immagine prima dell’anteprima. Journal riconciliato NO_WRITE con SELECT
scoped:0intenti/0versioni; nessun replay del tentativo. Offline/locales restano da eseguire.

## Correzione lifecycle picker — integrata, ritest da eseguire

Alle18:29 nuovo intento diagnostico registrato prima del solo gesto camera.
Debugger ufficiale: image_operation_cancelled da product-image-mutation-client.js:290,
dopo preparazione, perché confirmPrepared restituisce false. previewEpoch1→2,
generation1 invariata, pagina mounted, nessuna anteprima. Dopo resume: imageBusyfalse,
outbox0, nessun tentativo immagine durevole. SELECT18:33:43UTC sul solo prodotto
della run:0intenti/0versioni. Intento diagnostico RECONCILED_NO_WRITE; nessun PASS immagini.

Il picker nasconde e mostra la pagina. Il fix conserva lo snapshot originario
account/shop/prodotto, richiede pagina visibile prima della nuova anteprima e
cattura l’epoca alla sua presentazione. Hide/unload continuano ad annullarla;
conferma esplicita e tutti i guardrail immagine/server restano necessari.
Regressione isolata hide→show riprodotta prima del fix (1FAIL/9); dopo il fix
10/10 includendo la race conferma→hide→show. Verify Node26.7:155PASS
(110TS+45MJS), governance/privacy/secrets/typecheck/lint/build e diffcheck PASS;
due review indipendenti APPROVED sul diff SHA256
820f0dc3d6ae36a3d84f4044e649a1fd7e30eba922ea48dd552a29f2d2360a08.
Nessuna affermazione di upload autentico riuscito prima del ritest.

[Mini PR29](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/29)
integrata: head6ac459b2261cde0a3054f5ca0ae4d0c0897abb7e,
CI36263334935 PASS; merge60392f8d4095f256decdd248f5dc629ef4db03d1,
postmerge36263379570 PASS. Checkout Mini principale pulito/allineato;
Admin mainfe4907adc51ff842720e1c7eb36aa05e0fa53cb8 invariato.

Build TEST18:41:12UTC da60392f8d, Node26.7: solo pages/product-detail/index.js
cambiato, SHA256c47548ab4f258bb49b0fa120303cc329eb0cc855142ca9a5b11e20afd81d3100.
Config37d94cf4 e platformef61d94b invariati; manifest
81b769dfa1d947a11b298a7a1751451b093a5ffff1e6facfca086d0a1a8a35a2.
Il controllo UI alle18:40 e18:41 trova il Mac bloccato: **BLOCKED_EXTERNAL**,
owner utente, sblocco OS manuale. La build su disco non prova la ricompilazione
ufficiale o il successo del nuovo percorso: immagini-lifecycle NOT_RUN,
offline/locales NOT_RUN. Non aggirato il blocco UI tramite SDK.

Worker letto nuovamente alle18:40:05UTC: versione beb94e1e, scope/flag esatti.
Nuovo helper privato images-lifecycle:21test PASS, review indipendente APPROVED,
SHAb1747f9f77b6fe2c4f3c001a54569ee98b1934868684bbb8f05b08cd21d085ab.
Richiede entrambi i sorgenti e compilati esatti, tutte le riconciliazioni NO_WRITE
e assenza di intenti pendenti; directory una tantum non ancora creata.
Alla ripresa: verificare accessibilità, ricompilare ufficialmente, riaccedere WeChat
autonomamente, aggiornare metadata preflight scaduti, eseguire il nuovo scenario
sulle stesse fixture. Non ripetere images o images-buffer. Nessun telefono disponibile
o nuovo risultato nativo attestato; i blocchi nativi restano quelli sopra.


## Ricevuta del collaudo catalogo — 2026-09-28 17:10–17:14 UTC

Sorgente Mini `ec62e47beb9717dd1ea955d9f8e2d06f1e1e8b9e`; PR39 modifica
soltanto WXML/WXSS del catalogo oltre alle ricevute documentali. Il client TEST
mantiene la configurazione `37d94cf4`; manifest completo
`83eec45df7dcd0c0f00ab1cfe1dd7f625634c4fb844eb4c8285fb979c99294d1`.
Worker `beb94e1e`, confronto registry 145 con hash invariati e singleton autorizzato
ricontrollati prima della prova. Nessun deploy Worker o nuova migrazione.
DevTools 2.02.2609232, Base Library 3.17.0, simulatore 375×639; login WeChat
reale rinnovato e prima Home caricata prima dell'avvio.

Il runner privato revisionato 2/2 (41 test mirati PASS) attende l'effettivo
cambio lingua e il catalogo pronto prima della ricevuta visiva. Non inietta
stato applicativo o sessioni. Report `8002f843d969fa0697bc98cee5e368a7b883fd5e23be680061ddf9a267b4377c`:
PARTIAL, quattro OPERATOR_OBSERVED, zero intenti/eccezioni, lingua iniziale
ripristinata dal flusso. I quattro screenshot originali e le ricevute con hash
sono nel packet privato; il target con codice lungo è visibile in ciascuno.
Lo spazio immagine verificato è un placeholder, non una fotografia caricata.
Le cinque icone sono leggibili; in spagnolo Attività recente occupa due righe.
I controlli aggiuntivi di Home/Vendite/Attività/Account sono parziali e non
estendono i quattro casi catalogo a un'accettazione di tutta l'app.

Il precedente report lingue `fe78484e` resta FAIL: attesa evento insufficiente
nel runner e overflow catalogo osservato sulla build precedente. Non è stato
riscritto o trasformato retroattivamente in PASS. La prova offline accettata
resta distinta sulla build `4519388b`, report
`f90eed8705cc6ef4451e59eb1dca5ea3b7e177ee9d44139e7bd5897f2e08ae16`:
una sola scrittura correlata all'operationId, History7→8, Saved e final scope valido.
Nessun percentile dedotto dalle durate comprensive di coordinamento GUI/readback.

Ricevute: [PR39](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/39),
[CI head](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36455394919),
[CI main](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36455631640).
Le due review indipendenti hanno verificato report, checkpoint e hash delle
quattro immagini senza finding bloccanti, nel solo perimetro catalogo/DevTools.

## Matrice A–G e limiti delle prove — aggiornata 2026-09-28

| Mandato | Evidenza disponibile | Residuo effettivo |
|---|---|---|
| A Account/sessione/shop | Pairing, login distinto, profilo/shop, scadenza autentici | Foreground/logout/pending; negativi isolati separati; riaccesso autonomo autorizzato ed eseguito |
| B Letture/vendite |17scenari UI+SELECT, zero corretto,12documenti storici e History prodotto5auditUI;6nel readback storico post-offline;8nell’ultimo readback28settembre16:52UTC | Ulteriori filtri/sort/pagine; edge case solo isolati |
| C Catalogo/prezzi |13casi reali,5fixture, rinomina e sostituzione/archiviazione categoria/fornitore, CLP interi e quantità1,25 | Conflitti live, storico multipagina e legacy invariati |
| D Immagini | Tre operazioni DevTools PASS: camera, sostituzione galleria, rimozione; orientamento/thumbnail osservati | Due cleanup pending; rete/lifecycle immagine e telefono non attestati |
| E Offline/sync | Checkpoint/watermark verificati; salvataggio offline→online sulla stessa pagina applicato una volta, History5→6; feedback corretto PR35 | Nuova prova fresca PASS: Saved, coda vuota, una sola scrittura causale7→8 e final scope valido; altre schermate/lifecycle distinti |
| F Convergenza | Emulatore Android/simulatore iOS autenticati sullo stesso IDcanonico/shop/progetto | Recovery Android bloccato da device identity; recovery iOS bloccato; nessun roundtrip attestato |
| G Usabilità/lingue | Icone tab5/5; PR36 e PR39 integrate,191test; quattro viste catalogo autenticate OPERATOR_OBSERVED, titoli/tab/testi/prezzo/placeholder corretti | Altre schermate, messaggi e conferme nelle quattro lingue non integralmente ricollaudati; nessuna prova telefono |
| Telefono/prestazioni | DevTools e simulatori disponibili; nessuna prova telefono | PHONE_VALIDATED NO, p50/p95 NON_MISURATO |

Le durate scenari45.566/14.486/6.602/6.468ms includono readback/orchestrazione,
non latenze utente. La run scritture interrotta non ha emesso campioni UX nel report;
nessun percentile o rispetto budget dedotto. Login/prima pagina/save/immagini/
convergenza richiedono misure comparabili. Zero campioni significa NON_MISURATO.

Cinque fixture della run conservate con marker e ID nel packet; nessun cleanup
automatico. Le precedenti diagnosi NO_WRITE e il fallimento upload noto sono riconciliati;
la versione immagine failed aveva cleanup backend pendente nell’ultimo readback.
La vecchia preview è stata riconciliata prima dei tre casi immagini; la bozza
non inviata della prova offline del28settembre è stata annullata prima della
nuova prova unlocked, con conferma UI e outbox0 alle16:47:39UTC.
Runner lock assente; controllare outbox e journal prima di riprendere o archiviare fixture.
Pairing personale preservato. AppSecret/sessioni/codici/URLfirmati non sono evidenza.
**CODE_COMPLETE** limitato ai delta approvati; **LIVE_VALIDATED parziale**;
**PHONE_VALIDATED NO; PUBLIC_RELEASE_READY NO**. Il pilot completo non è accettato.

Ricevuta precedente al fix, sola continuazione documentale PR27: Node26.7.0 `npm run verify` PASS,
110test TypeScript e39test MJS, governance/privacy/secret scan/typecheck/lint/
build inclusi; `git diff --check` PASS. Runner privato continuazione12test PASS;
checkpoint immagini validato contro lo schema originale dopo riconciliazione.
Nessun codice applicativo, distribuzione Worker o migrazione aggiunti da PR27.
Il successivo delta cross-realm e i suoi152test sono descritti separatamente sopra.

Le sezioni seguenti sono ricevute storiche, non stato o blocchi correnti.

## Pairing autentico e attivazione readonly — 2026-09-26

L'utente ha sbloccato il Mac, effettuato personalmente il nuovo trasferimento Mini,
confrontato account/numero e approvato Admin; ha poi confermato nel Mini con un
nuovo login WeChat. La UI mostra Linked. Il readback canonico limitato al target
designato, alle15:01:14UTC, conferma un pairing completato, un mapping attivo,
un evento audit linked e due prove Tencent verificate e consumate: pair_claim e
pair_confirm. La seconda è successiva all'approvazione Admin; il completamento
precede la scadenza. Nessun mapping SQL artificiale, sessione iniettata o dato
di autenticazione conservato nella ricevuta. **TEST exchange PASS / pairing PASS**.

La transizione metadata revisionata chiude enrollment e abilita soltanto
WECHAT_AUTH_MINI_PROGRAM_ENABLED. Worker **15ad37e9-6176-4410-baab-28a67615211f**,
rollout100%, codice della release selettiva a805d640 invariato; etag sorgente,
runtime, altri binding, ambito singleton e tracing OFF preservati. Altri sei
flag OFF, incluse mutazioni e linking. Il primo controllo pubblico ha visto
ancora lo stato precedente: riconciliazione in sola lettura dopo propagazione,
senza ripetere PATCH; status ready/mini_program true, enrollment false confermati.
Review indipendente helper APPROVED, SHA256
f35197ced2317a685b314ad54934704034bee8516f0d2af8a66e02f4b328eae9.
ROTATION NOT_PERFORMED / ACCEPTED_FOR_TEST_ONLY rimangono invariati.

Nuovo readback: registry144 identico per versione/nome/MD5 degli statement alla
baseline immagini approvata; nessuna migrazione commerce o tabella commerce.
Profilo, utente canonico, membership shop_owner e shop designato risultano attivi.
Build readonly dal Mini07e1e342/Admin db5bb83a, Node26.7 verify149/149 e build PASS;
readinessV2 basata su prove effettive, mutazioni client OFF e urlCheck true.
Manifest dist SHA256
da0b67ff36811b2e305eafe67c104403122fab2c88bd979e0b39c1d034e53bec
(path ordinato + NUL + byte + NUL).

Il runtime DevTools osservato prima del caricamento conserva la precedente build
enrollment: pagina Linked, featureReady false, nessuna sessione/shop. Durante il
comando di ricompilazione Computer Use segnala nuovamente Mac bloccato; sblocco
manuale richiesto, nessun tentativo di aggirarlo tramite CLI o SDK.
**BLOCKED_EXTERNAL, owner utente:** sbloccare il Mac; poi caricare la build readonly
e premere personalmente il login Home distinto dal pairing. Il runner attende
quel gesto, verifica profilo/shop e confronta i dati con letture SQL indipendenti.
Login distinto, letture business, mutazioni, telefono e prestazioni reali NOT_RUN.
Nessuna fixture business creata o modifica al pairing personale legittimo.

Runner privato aggiornato per confronto esatto delle144migrazioni; nessun tap
automatico del login. Anteprima immagini confermata tramite UI prima di attendere
upload, con confronto versione UI/readback e interruzione su annullamento/cambio
sessione anche durante il readback.37test locali PASS: preparazione, non accettazione autenticata.
La ripresa deve aggiornare le attestazioni metadata scadute prima della run.
LIVE_VALIDATED NO, PHONE_VALIDATED NO, PUBLIC_RELEASE_READY NO; nessun DONE.

Le sezioni successive sono ricevute storiche precedenti al pairing riuscito.

## Ricevuta fix Workers — 2026-09-25T20:49:14.938Z

[Admin PR112](https://github.com/XNIW/merchandise-control-admin-web/pull/112) head
9eae7f0b5eda469aa562efc6ddc4667eb9261729 integrata come
db5bb83a8d54a99ae8637d3cc770af723cf00da3 dopo CI36187551352 e Cloudflare36187551530 PASS.
Postmerge Admin CI36187934467 e Cloudflare36187934462 PASS; deploy automatici SKIPPED.
[Mini PR23](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/23)
head c086f63e409b793ef0abed77c64a0bc94dd0c6be, merge
ba752859b1f59ab22a18866f79f9928079c6766d; CI36187551042 e postmerge36187613324 PASS.
Le modifiche Mini sono solo documentali: applicazione/dist enrollment invariati.

Il motore workerd1.20260811.1 rifiuta redirect:error prima della rete: riprodotto
con gli helper TypeScript effettivi, configurazione/sessione e HTTP isolati.
Il fix usa manual e conserva il rifiuto non-2xx. Entrambi i trasporti raggiungono
una sola RPC per200/301/302/303/307/308 e non inviano nulla alla destinazione redirect.
Baseline FAIL, fix24/24 mirati PASS; Admin verify Node22 e1031foundation PASS/2skip;
Mini149PASS. Il primo foundation locale ha2ENOENT nel checkout Win7POS incompleto;
il rerun usa il riferimento esistente in sola lettura, senza modifiche native.
Review indipendente APPROVED, manifest codice/test
cb6092178c0b66f52046c6fb1a7e5d83ed3a7c7503043c2188863224ee675521.
Nessuna diagnostica pubblica aggiunta; nessuna modifica alle credenziali.

Release selettiva a805d64044dec3b1304f5c52709f886580c48390 derivata dac55f88a3,
solo wechat-mini-session.ts e catalog-mutation-gateway.ts. Build Cloudflare PASS,
handler SHA2561549b82d5498b50f21e658b293ccbe804e0f52d7bf70dc1349aaa181e6dc5730
vincolato nel helper revisionato SHA256
da55e3d3072dfe130bc25c0390e1a4a27f6666f0c9a54fd8adf9c0c2069f931c.
Worker **246797b4-75cf-4423-ae23-acf8e58d73d7** verificato100%; hash binding,
configurazione runtime e settings preservati. Enrollment ON, altri6flag OFF,
allowlist esatte, AppSecret presente non ancora verificato da Tencent, tracing OFF.
Nessun DDL o deploy main intera. Smoke HTTP pubblico/read-only5/5 PASS: privacy,
cancellazione, stato e diniego delle letture business. Non è prova di login autentico.

Il vecchio pairing è scaduto; Admin tornato all'avvio mediante sola lettura stato.
**BLOCKED_EXTERNAL, owner utente:** Mac bloccato durante il controllo DevTools;
sblocco manuale richiesto. Dopo lo sblocco: nuovo trasferimento personale e Verify,
poi confronto/approvazione Admin, seconda prova e consenso Mini nel loro ordine.
Non ripetere installer, non trasferire codici in chat. Tencent/mapping/login/business
ancora NON_VERIFICATI; telefono e tempi0campioni. Nessuna fixture business creata,
nessun mapping artificiale e nessun cleanup di dati personali. Nessun DONE.

Le sezioni successive descrivono i tentativi e lo stato storico precedente al fix.

## Enrollment TEST attivo — 2026-09-25T20:01:41.857Z

L'utente ha completato l'input nascosto. Metadati verificati: binding AppSecret presente
nel Worker cb474c33-8475-47ca-8097-ea0988fa2e5e; sorgente/runtime/altri binding invariati.
Successiva PATCH del solo flag WECHAT_MINI_ENROLLMENT_ENABLED=true, revisionata
indipendentemente: Worker f1e2e3ce-557b-42f4-9159-e796dc635c32 al100%, codice della
release selettiva c55f88a3 invariato, target/allowlist/tracing preservati. Gli altri
sei flag restano OFF; status pubblico miniEnrollmentReady=true, business disabilitato.
Nessun DDL o deploy della main Admin. ROTATION NOT_PERFORMED / ACCEPTED_FOR_TEST_ONLY.

Build Mini sorgente26e498044e2451a164eedae1a8fb3a0d5c1ffc33, Admin918e8e1cbe2d286c3a81b59ad586d7031fac9a78.
Node26.7 verify149/149 PASS; privacy nativa riusata solo dopo confronto contenuto e
sorgente invariati. Readiness registra exchange e pairing NOT_RUN. DevTools ufficiale:
Account enrollmentReady=true, pagina pairing pronta senza errori, AppID corrispondente,
featureReady=false, nessuna sessione/shop,0nuove eccezioni. Manifest dist SHA256
b2146d0499c1130e75c8064eb40f86b336bf53262a10bd1f247a60c3fe4e9ad1.
Readback SQL limitato al profilo/AppID designati:0mapping attivi e0totali.

Accesso Admin completato personalmente e due tentativi Mini effettuati dall'utente.
Entrambi si fermano al challenge; il secondo mostra HTTP400 `backend_temporary`
in205ms nel debugger ufficiale. Nessuna prova/code verificato o mapping prodotto.
I log Supabase della finestra osservata mostrano pair_start/pair_admin200 ma nessuna
chiamata proof_create; nessun errore PostgreSQL osservato. Causa riprodotta nel runtime workerd1.20260811.1:
redirect:error genera TypeError prima della rete; manual esegue la RPC e rifiuta3xx. Trasporto pubblico, formato input e generatore casuale nativo
verificati; nessun nuovo tentativo personale richiesto durante la diagnosi.

**FIX tecnico, owner Codex:** redirect manual nei due trasporti Mini RPC/catalogo,
con controlli response.ok invariati. Nessun redirect seguito e nessuna diagnostica
aggiunta alla risposta pubblica. Riproduzione isolata con motore Cloudflare e HTTP
simulato; nessuna autenticazione staging attestata. Integrazione e runtime da verificare.
Tencent, pairing completo, login distinto, business, telefono e misure NOT_RUN.
Non eseguire di nuovo l'installer; nessuna fixture business o sessione artificiale.
Review del helper enrollment APPROVED (SHA256
63dd5cae2f6d66ce4fe5739374dd19c4166736a54901973a0c6a966ace445efc).
LIVE_VALIDATED NO, PHONE_VALIDATED NO, PUBLIC_RELEASE_READY NO; nessun DONE.
Le precedenti note AppSecret assente/tutti flag OFF descrivono solo lo stato storico.

## Ricevute finali del delta immagini — 2026-09-25

- Mini [PR20](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/20): head `cbead597728925fcc9000ecbafeefe44de9ace98`, merge `08cb400fac025dea65d8da0a4f13550ec334b177`. [CI head36175275580](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36175275580) e [CI main36175364489](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/actions/runs/36175364489) PASS.
- Admin [PR109](https://github.com/XNIW/merchandise-control-admin-web/pull/109): head `de9b3924669c4df7d4785108e2b121ca190c8ce3`, merge `beed0a575a1d65ff0d267b7c1ec6ce6ecd9e754f`. [CI head36175280179](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/36175280179), [Cloudflare head36175280178](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/36175280178), [CI main36175776026](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/36175776026) e [Cloudflare main36175776098](https://github.com/XNIW/merchandise-control-admin-web/actions/runs/36175776098) PASS. Deploy automatici SKIPPED; nessun deploy della main intera.
- Release selettiva `c55f88a36ac89684f25fd503ca7a3bc085c08660`, ramo `codex/wechat-010-image-staging`, derivata da `b8a859c236385d39b2b9b52e5dc56310ee386980` con soli `product-images/service.ts` e migrazione immagini. Build Cloudflare Node22 PASS. Worker **6343d39c-d50a-4c88-89df-676f709697a2**, traffico100%, messaggio release verificato; confronto metadati conferma binding/configurazione runtime invariati, sette flag OFF e tracing disabilitato. HTTP staging OFF **12/12 PASS** sulla nuova release, distinto dal collaudo business.
- Registry **144**, nuova **20260925184847_wechat_010_image_recovery**; le143precedenti sono identiche per versione/nome/hash, zero commerce. Funzione remota e DB isolato MD5 `588c797e1d304291e34b0628f58b6c4e`; owner postgres e ACL precedenti invariati, anon/authenticated EXECUTE negati. Backup0600 e restore/reapply isolati effettuati. Advisor security/performance: **0 nuovi** rispetto al preflight. Il nome file iniziale184000 è riconciliato con il timestamp assegnato; sola riga vuota EOF rimossa, istruzioni SQL invariate. SHA256 file finale `45e84b6070d35daeb4d1a15b32be3e558303cd67f0286e805719f36ea0559f60`; input applicato `4a863559f6cda50fe7c177ed176d6c5fe3d3837a5c28037b2413039dc2e40d4d`.
- Build Mini nel progetto importato aggiornata al merge applicativo08cb400, protocollo diretto/base staging e flag OFF; WXML sorgente/dist identici, bundle contiene preview/recovery/lifecycle nuovi. Manifest dist SHA256 `cf44d02ae23f0d727aacd4aaef23dbde2c850b62eb11c534319aa0154d752d54` (path+NUL+bytes+NUL ordinati). **Nuovo smoke DevTools OFF5/5 PASS** al 2026-09-25T19:03:05.409Z: Mac tornato accessibile, compilazione ufficiale e tutte5tab controllate tramite UI e SDK ufficiale;0nuove eccezioni, nessuna sessione/shop, featureReady=false. Primo tentativo SDK fallito con metadato pagina `rawPath` nullo; secondo dopo disponibilità della pagina PASS, senza patch applicativa o mock. Questa prova è distinta dal precedente5/5 e non valida business/telefono/anteprima autenticata.

La ricevuta delle18:51UTC appartiene alla fase precedente: AppSecret assente e tutti flag OFF allora. L'input protetto è stato completato e l'enrollment è stato attivato successivamente come documentato sopra; non richiedere nuovamente il secret. Gli smoke OFF restano evidenza storica della stessa sorgente, non prova della configurazione enrollment corrente.

Le PR di ricevuta collegano questo report allo stato finale Git/CI senza un hash autoreferenziale: [Mini PR21](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/21), [Admin PR110](https://github.com/XNIW/merchandise-control-admin-web/pull/110). Successiva [Mini PR22](https://github.com/XNIW/MerchandiseControlWeChatMiniProgram/pull/22) registra il nuovo smoke dopo sblocco. Nessuna nuova logica applicativa in tali ricevute; la rinomina non riapplica DDL e non richiede un altro deploy. **REVIEW / BLOCKED_EXTERNAL; CODE_COMPLETE limitato ai difetti corretti; LIVE_VALIDATED NO, PHONE_VALIDATED NO, PUBLIC_RELEASE_READY NO. Nessun DONE.**

## Prosecuzione residui del 25 settembre — evidenza precedente all'enrollment

Ripartenza verificata: Mini main `c0efc26f2074109aa941c615dc83c3d829ae9d58`, Admin main `0722fa3a916bd330244040b7a92a39c09b5d59dc`, remoti allineati e checkout puliti prima dei nuovi rami. F01–F07 e le prove precedenti qui sotto sono riusati per i byte invariati, non rieseguiti né riclassificati come live. Worker e registry143 verificati di nuovo: versioni/nomi corrispondono esattamente al backup142 più la migrazione funzionale; hash delle due funzioni pertinenti invariati, zero commerce. Alle18:40UTC binding AppSecret ancora assente, sette flag OFF, target/protocollo/allowlist esatti e tracing disabilitato. Input protetto richiesto una sola volta con l'interprete bundled verificato; nessuna risposta materiale acquisita.

Sei residui di codice D corretti nel nuovo delta: upload immutabile parziale non riconciliato; finalize riuscito con risposta persa trattato come errore terminale; solo20 miniature visibili su50 per evizione LRU; assenza di anteprima/consenso prima della rete; assenza di rinnovo limitato dopo errore immagine; permessi camera indistinti dall'errore upload. Il server verifica i byte JPEG esistenti e restituisce URL null solo per varianti già corrette; firma soltanto quelle mancanti, senza upsert. Un replay ready restituisce noop solo per la versione ancora corrente del prodotto attivo. Diniego esplicito resta403, revalidation incerta503 mantiene journal/file. Lock prodotto→versione evita classificazioni intermedie durante finalize concorrente sul contratto condiviso. Anteprima main+thumb prima dell'intent, annullamento senza scritture; hide/unload/cambio contesto invalidano preparazioni e risposte tardive. Rinnovo URL una sola volta per contesto/versione con placeholder finale.

Prove nuove: Mini Node26.7 `verify` PASS,110TS+39MJS=149; Admin Node22 `verify` PASS e foundation1030PASS/2skip,25test mirati servizio;41pgTAP immagini PASS (prima1FAIL sul replay ready), restore/reapply della sola funzione riuscito. Harness SQL due sessioni su clone locale usa-e-getta: baseline invalid_state FAIL, patch noop stessa versione PASS, clone eliminato. Questa prova modella il contratto condiviso, non due chiamate Mini già serializzate dal gateway. Regressioni UI iniziali2FAIL (20/50 e handler mancante), poi ulteriori3FAIL lifecycle dalla review, infine7/7PASS. Due review indipendenti APPROVED: UI7/7, recupero25Admin+32Mini. Manifest UI8file SHA256 `53c1f1cbbcbca368ec73fa66cc8efc60f5e07ebb21e310f0055ccfb28f27debf`; recupero7file `73c0ebefc32910b302e58986d18769f852bbffa1a9fa10dda537ea83e7a14457`. Integrazione completata nelle PR20/109; ricevute sopra. Le nuove prove sono isolate: nessun passaggio autenticato Tencent o business, nessun tempo utente misurato.

| Requisito originale | Percorso UI/API | Implementazione ed evidenza disponibile | Prova/azione ancora necessaria |
|---|---|---|---|
| A Account/sessione/shop | Account, selettore → direct auth/session/profile/shops | Esistente; suite isolate identità/scope/risposte tardive; privacy pubblica invariata, evidenza precedente riusata | Credenziale, pairing personale, login distinto, profilo/shop esatti, scadenza/riaccesso, foreground/logout e scelta pending autentici |
| B Letture/vendite | Home/Sales/History/Database → summary, period/detail, catalog/entities | F01/F02/F06 integrati; paging/filtri/DST/gross-refund-net/empty-error e ruoli negativi isolati | Prima verticale e runner autenticati; confronto dati esistenti e più pagine, senza creare transazioni |
| C Catalogo/prezzi | form prodotto/entity picker/prices/lifecycle → mutations | F01–F05 integrati, journal base/acquisto/vendita e conflitti verificati localmente | CRUD/archive/restore, duplicati/revisioni/replacement, relazioni e prezzi oltre pagina1, CLP/frazioni/legacy sul runtime reale |
| D Immagini | detail camera/gallery/preview, Database thumbnail → intent/Storage/finalize/read/remove | Sei mancanze corrette come sopra;149Mini/25server/41SQL e concorrenza isolata | Upload/sostituzione/rimozione autentici, riavvio/rete/URL scaduto; camera/permessi/orientamento/qualità compressione su telefono |
| E Offline/sync/recupero | form/outbox/Account/History → sender/delta/readback | F04/F05 e nuovi replay immagini: prove isolate chiavi/bytes/commit perso/lifecycle | Offline→online sulla stessa schermata, invio automatico, riapertura tra fasi, History/scroll/bozze su runtime autentico; fault injection solo isolata se non sicura live |
| F Convergenza | Mini → backend/Admin → Android/iOS e ritorno | Contratti canonici e suite esistenti; nessuna modifica sorgenti native | Stessi ID/shop e stato finale realmente letti; inventario attuale0Android adb e0iOS fisici collegati, non prova di assenza assoluta di un telefono |
| G Usabilità/lingue | Pagine autenticate e messaggi in4lingue | Traduzioni nuove tipizzate;7regressioni UI locali, privacy invariata | Leggibilità/loading/empty/error/offline/CTA/conferme/bozze e tutte4lingue nei flussi autentici |
| Telefono e prestazioni | DevTools ufficiale e dispositivo fisico, sei percorsi temporizzati | Mac/DevTools nuovamente accessibili; build nuova verificata OFF5/5; nessuna prova telefono nuova | Login/camera/lifecycle/rete reali. Login/prima pagina/ricerca/save/immagini/convergenza:0campioni, p50/p95 **NON_MISURATO**, rete/cache/dataset non osservati |

**CODE_COMPLETE** riguarda F01–F07 e i residui di codice qui verificati, non l'intero pilot. **LIVE_VALIDATED: NO; PHONE_VALIDATED: NO; PUBLIC_RELEASE_READY: NO.** Task in FIX per il challenge enrollment; login Admin e input AppSecret già completati. I successivi consensi personali restano da eseguire dopo il ripristino tecnico. Nessun DONE. Zero fixture business staging, zero cleanup business necessario; fixture SQL annullate e clone concorrenza rimosso. Runner invariato e mai eseguito in fase business in questa prosecuzione. Quando auth sarà disponibile, il nuovo passaggio di conferma anteprima dovrà essere attraversato dall'adapter UI reale e verificato subito, non attestato da test sintetici. Nessuna promessa di ripresa in background.

## Baseline riusata e limiti funzionali

F01–F07 restano integrati: formato cileno/CLP interi e preservazione prezzi legacy, relazioni paginabili e lookup puntuale, storico prezzi paginato, journal multiphase e ripresa automatica foreground/rete, date vendite nel giorno commerciale, errori/permessi distinti e fotocamera/galleria separate. Le ricevute precedenti134Mini,337pgTAP,48UI+2pairing,33guard runner e5tab OFF sono conservate nell'[archivio F01–F07](archive/WECHAT-010-F01-F07-RECEIPTS-20260925.md), insieme alle PR18/19/107/108. Le suite nuove sopra sostituiscono i conteggi per i file modificati; nessun doppio conteggio di PASS live.

Il salvataggio base/acquisto/vendita è recuperabile, non una singola transazione; una fase confermata può essere visibile prima della successiva. Le bozze non salvate sono protette dall'avviso di uscita, senza promessa di persistenza di ogni battuta. Il polling adattivo foreground non garantisce3secondi. URL immagini già emessi restano bearer fino al TTL. Orientamento, qualità compressione, lifecycle/rete sul telefono e convergenza richiedono ancora osservazioni autentiche.

Il mandato TEST per la credenziale corrente esposta resta valido: **ROTATION NOT_PERFORMED / ACCEPTED_FOR_TEST_ONLY**. OneID, numero cinese e rotazione non diventano prerequisiti del pilot; uso pubblico resta escluso. Input protetto già completato; non ripetere l'installer. Nessuna attestazione di validità Tencent dalla sola presenza del binding.

Enrollment server→client completato con business OFF. Restano: primo wx.login/code2Session; trasferimento monouso e confronto/approvazione Admin personale; seconda prova e consenso Mini; verifica mapping; enrollment chiuso; login distinto e sole letture; verticale profilo/shop/catalogo, poi gate mutazioni. Nessun mapping SQL, token/sessione artificiale, gesto personale simulato o attestazione PASS anticipata. Nessuna attivazione business finché i relativi gate non sono soddisfatti.

Ulteriore fallback read-only CLI `islogin` sul port IDE esistente: timeout6s
alle23:29:42UTC, nessuno stato Auth o UI attestato; zero SDK/business writes.
