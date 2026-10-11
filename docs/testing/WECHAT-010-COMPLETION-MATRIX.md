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

## Checkpoint corrente — 2026-10-11 18:32 America/Santiago

Sblocco umano verificato in DevTools; nuovo GO N issued8c04b589,
21:09:04→21:24:04 UTC, per il caso distinto C04 R2 7beba10f.
Worker TEST protetto aggiornato all'ingresso e SELECT before autentica
21:10:12.327857 UTC/9da33ce0. Un solo accesso WeChat ordinario: challenge
HTTP200 con contratto valido, ma nessuna sessione valida attestata.
Il guard iniziale ha fermato prepare-stale-edit alle21:10:16.733 UTC:
**FAIL / SESSION_OR_SCOPE_INVALID**, eccezioni0, nessuna bozza o input catalogo,
AdminSave0/MiniSave0/Reload0. Reload e runtime acceptance restano NOT_RUN.

Release complessiva effettiva21:14:22.307502 UTC/d455de19 prima del cutoff:
runner proprietario assente, disconnect certo, lock/fence globale assenti,
finestra archiviata. Nessun secondo login, replay, retry o modifica business.
Il FAIL originale b3d3e6fd e il recupero338160bc restano byte-preservati.

Il log corrente dell'IDE alle21:09:58.356 UTC indica errcode-80001,
needToken1, forceLogin-1. Il codice ufficiale installato identifica -80001
come DEV_NEED_RELOGIN; questa prova dell'host non attesta da sola la causa
completa del login business. Ispezione UI esclusiva successiva: profilo mostra
soltanto «退出登录» (Esci), nessun QR. Logout/login business/SDK/SQL zero;
release21:21:42.392772 UTC/918527a5 prima del cutoff. Richiesto all'utente il
normale nuovo accesso al profilo dell'IDE con scansione QR personale, stesso
account, cache/dati/progetto preservati e senza ricompilazione. Owner utente;
unblock «DevTools autenticato», poi nuova finestra e preflight autentici.

Correzione separata del messaggio Home preparata: il fallback senza sessione
usa retryableError nelle quattro lingue già corrette in PR53, evitando di
presentare un login fallito come aggiornamento fallito. Solo un'espressione
text; sessioni, autenticazione, error mapping e viewState invariati.
Source3a55a3f6/patch e45d9777/freeze a35922f1: review indipendente2/2
APPROVED, pair0d4d12a3. Primo verify effettivo21:28:49→21:28:51 UTC **FAIL**:
TS111 PASS; MJS119 PASS/1 FAIL, aspettativa del vecchio testo in un test esistente.
Release2beb3415, process group proprietario assente, SDK/UI/SQL/network/login/Save0.
Aggiornata soltanto quell’aspettativa a retryableError; tutti i controlli di
rientro, scope e markup preservati. R2 patchf484cfd1/testd233b55a/freeze b70c31c7,
review indipendente2/2 APPROVED/pair57689b56. Secondo verify effettivo
21:31:44→21:31:46 UTC **PASS**:231 test/0 FAIL/0 SKIP, controlli governance,
privacy, secret scan, typecheck, lint e build inclusi. Release9b22b969 prima
del cutoff/deadline, process group proprietario assente e runtime input0.
Primo FAIL conservato. Integrazione sorgente in preparazione; **NOT_INSTALLED**.
PR53 integrata a7166d23, CI head38174582111 e main38174642319 SUCCESS;
PR52 e recupero già integrati. Runtime V12/e305 e configurazione preservati.

N ha comunicato CI iOS38173188925 SUCCESS e merge normale PR22/d57876ed;
installazione e collaudo nativi restano nella lane N. W0SDK/UI/input/heavy.
Pending, convergenza quattro-client, prestazioni e telefono restano aperti.
WECHAT-010 EXECUTION, nessun DONE o accettazione globale.

## Checkpoint storico — 2026-10-11 18:00 America/Santiago

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


C04 è stato eseguito sul caso d072e509, con un solo Save Admin e un solo
Save Mini respinto come stale_version. La lettura finale indipendente delle
15:56:53 UTC conferma nome Admin preservato, nessuna scrittura Mini riuscita,
una sola ricevuta bloccata e fixture/dettagli/history invariati.

Il ricaricamento UI non è accettato: il primo collector si ferma su
ORACLE_STALE prima del SDK; la continuazione in sola lettura, revisionata 2/2,
restituisce FAIL SESSION_OR_SCOPE_INVALID dopo la scadenza della sessione
iniziale. I FAIL restano preservati, senza nuovi Save o login. Connessioni
chiuse, lock assente e finestre chiuse; fence conservato per il recupero UI.
Il Mac è nuovamente bloccato; sblocco manuale richiesto. Nessun DONE.

Riconciliazione backend b3d3e6fd, release94f7a491, oracolo finale2ddda532.
V12/e305 e Workerfdfb/sourceacb/registry158 invariati; le altre lane restano
distinte e aperte. Dettagli nel report canonico e nella matrice corrente.

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

La matrice conserva39 casi. Il checkpoint del9ottobre aggiorna la lane Mini;
le versioni native del3ottobre sotto sono storiche e richiedono le prove correnti
della lane N. I PASS preservati non vengono ampliati dalla preparazione v12. Dettagli, integrazione,
metodi prestazionali e dipendenze nel [report canonico](WECHAT-010-REPORT.md).

| ID | Requisito | Repository | Stato attuale | Evidenza/build | Azione mancante | Accettazione |
|---|---|---|---|---|---|---|
| A01 | Pairing e login personale distinto | Mini/Admin | PASS storico preservato | Pairing/login personale autentici; mapping invariato | Nessun nuovo pairing | Identità canonica e login distinto |
| A02 | Sessione attuale e rientro dopo scadenza | tutti | PASS storico Mini scadenza naturale e rientro senza pending; expiry pending NOT_RUN; accesso corrente non attestato | V12: rientro storico gen7/sidecar aa02e734. Nuovo tentativo21:09: challenge200 valido, session guard FAIL; host IDE DEV_NEED_RELOGIN, causa completa business non attestata | Accesso IDE con QR personale e nuova verifica autentica; scadenza durante pending e prove native residue | Scope esatto e margine sessione sufficiente |
| A03 | Logout/foreground con pending conserva/elimina | Mini | PASS v12 logout locale offline senza pending/rientro; conserva/elimina NOT_RUN | Caso5258e46a: un tap, gen5→6→7, registry invariato, pending0; terminal5125a336/release55679684 e review2/2; FAIL storici preservati | Conserva/elimina con pending autentico in nuovo handoff/sessione | Consenso rispettato, pending persistito o eliminato esplicitamente |
| A04 | Cambio account/shop, cache e callback tardive | tutti | PASS isolato; runtime cross-client NOT_RUN | Mini fences e native scope/cancellation/restore guard PASS | Cambio contesto effettivamente autorizzato, callback/cache/outbox osservate | Zero invii o applicazioni tardive fuori scope |
| B01 | Home e vendite readonly, ricerca/dettaglio | Mini/Admin | PASS autentico preservato | 17scenari storici attribuibili ai byte invariati | Preservare le prove | Valori e identità concordi con SELECT |
| B02 | Filtri/sort/pagine/errori vendite residui | Mini | PASS isolato/parziale; multipagina reale NOT_RUN | Quattro lingue/30giorni/empty;100+1 isolato | Paging reale solo se dataset esistente idoneo; niente scritture finanziarie | Nessuna mutazione finanziaria; pagine e filtri coerenti |
| C01 | Catalogo CRUD e ciclo archivia/ripristina | Mini/Admin | PASS autentico preservato | 13 CRUD/lifecycle originari e cinque fixture | Preservare ID/revisioni/readback | Identità confermate dal server, readback esatto |
| C02 | Fornitori/categorie rinomina e riassegnazione | Mini/Admin | PASS autentico preservato | Rinomina/riassegnazione e riferimenti verificati | Preservare prove | Riferimenti attivi corretti e tombstone coerenti |
| C03 | Ricerca/paging catalogo e relazioni | Mini | PASS DevTools campionato | Nove limiti Unicode, sette letture/lingua, paging7×50 e sort3×150 concordi SQL | Nessun claim intero dataset/telefono | Nessun duplicato/omissione; contesto stabile |
| C04 | Duplicati, double tap, revision conflict | Mini/Admin | Doubletap PASS; stale rejection/no overwrite verificati; recupero locale failed-case PASS; reload originale FAIL preservato; nuovo R2 FAIL di prerequisito, reload NOT_RUN | d072:1 Admin Save/1 Mini stale Save; final080a4449/recovery338160bc/release7926bf7f. Nuovo7beba10f: session guard FAIL, bozza/Save/Reload0, before9da33ce0/released455de19 | Nuovo accesso IDE con QR personale, nuova prova distinta, lease e preflight freschi; nessun replay dei due casi | Nessuna sovrascrittura o duplicazione; terminale form e coda osservati nel contesto valido |
| C05 | Prezzi CLP/frazioni/legacy e History multipagina | Mini/Admin | PASS isolato/readback; multipagina runtime NOT_RUN | CLP/frazioni/legacy,185eventi isolati, quattro lingue/SQL | History multipagina solo con dati disponibili | Valore persistito invariato; ordinamento e audit esatti |
| D01 | Upload/sostituzione/rimozione DevTools | Mini/Admin | PASS DevTools autentico preservato | Upload camera/sostituzione galleria/rimozione osservati | Preservare limiti DevTools | Versioni e primaria corrispondono alla UI |
| D02 | Picker/anteprima annullati e file temporanei | Mini | NOT_RUN residuo runtime | Regressioni/preview diagnostiche riconciliate | Picker/preview cancel e gestione file temporanei nel runtime | Zero intent involontari e nessun file necessario perso |
| D03 | Upload interrotto/ripreso e identità operazione | Mini/Admin | NOT_RUN runtime | Replay/finalize isolati PASS | Interruzione/ripresa autorizzata e riconciliazione senza duplicare intent | Stessa key/payload; un solo effetto finale |
| D04 | Cache immagini e miniatura cross-client | tutti | NOT_RUN quattro-client | Nessuna convergenza immagini autentica completa | Un ciclo condiviso con destinatari pronti, accorpato alle misure | Nessuna vecchia immagine dopo invalidazione prevista |
| D05 | Cleanup versioni storiche/Storage | Admin | PASS autentico/readback155 preservato | 19:15:37:3versioni complete,0primarie, metadata scoped0oggetti/6path e0extra | Nessuna nuova cancellazione; non dedurre download o cross-client | Manifest esatto, primaria nulla, versioni/audit conservati |
| D06 | Scadenza URL immagine/rinnovo limitato | Mini/Admin | NOT_RUN runtime | Rinnovo/scope/version fence isolati | Scadenza reale di URL corrente e rinnovo bounded | Rinnovo bounded, versione corrente, nessuna applicazione tardiva |
| E01 | Offline→online stesso modulo | Mini | PASS autentico preservato | Stesso form Saved/outbox0/History7→8 | Preservare prova | Una mutazione causale e feedback coerente |
| E02 | Riavvio con pending e rete intermittente | Mini | NOT_RUN runtime | Pending helperv14/41pure distinto da C04; nessun nuovo Save | Dopo C04 accettato: retain/logout/restart/rientro sullo stesso intent | Pending durevole, invio automatico e zero duplicati |
| E03 | Scadenza sessione durante recovery | Mini | NOT_RUN pending runtime | Prepare A03 scaduto non prova expiry con pending | Scadenza reale900s senza TTL esteso; rientro ordinario | Nessuna mutazione fuori sessione; rete ripristinabile |
| E04 | Readback negato/temporaneo, errore definitivo | Mini/Admin | PASS isolato; fault runtime NOT_RUN | Readback negato/temporaneo/definitivo differenziati | Fault autentico riproducibile senza bypass e senza falso Saved | Mai falso Saved o perdita draft/pending |
| E05 | Nuove modifiche sul modulo durante recovery | Mini | PASS modello; widget/runtime NOT_RUN | Pending41/C04v14/48 sono suite diverse, non widget acceptance | Nuovo input durante pending e dopo completion osservati | Risposte vecchie non sovrascrivono input nuovo |
| F00 | Build native corrente, scope e recovery | Android/iOS | Nuovi gate nativi PASS; vecchi FAIL autentici preservati; ritest NOT_RUN | Android1110/Compose5/TEST3cc/main04f6CI SUCCESS; iOS1464/signed2783/main8dfCI SUCCESS | Build correnti/sessione/scope e recovery terminale durevole su target preservati | Autenticazione valida, recovery concluso e dati scoped |
| F01 | Mini → Admin/Android/iOS automatico | tutti | NOT_RUN quattro-client completo | Mini/SQL creazione storica; ReloadAdmin manuale distinto | Dopo F00: origine Mini e tre destinatari automatici | Stesso ID/revisione senza refresh manuale |
| F02 | Admin → Mini/Android/iOS automatico | tutti | NOT_RUN quattro-client completo | Nessuna prova completa corrente | Origine Admin e destinatari automatici | Stesso ID/campi, outbox coerente |
| F03 | Android → Mini/Admin/iOS automatico | tutti | NOT_RUN quattro-client completo | Nuovi gate Android isolati PASS | Origine Android dopo READY, propagazione automatica | Persistenza e propagazione automatiche |
| F04 | iOS → Mini/Admin/Android automatico | tutti | NOT_RUN quattro-client completo | Nuovi gate iOS isolati/mainCI PASS | Origine iOS dopo READY, lifecycle/tombstone dove autorizzati | Persistenza e propagazione automatiche |
| F05 | Foreground/reconnect/eventi mancanti e pagine | tutti | PASS isolati aggiornati; runtime cross-client NOT_RUN | Continuation/reopen/disk-backed native e canonical verdi | Foreground/reconnect/catch-up autentici dopo F00 | Nessuna perdita eventi; stesso clock osservatore |
| F06 | Eventi duplicati/riordinati/concorrenza/tombstone | tutti | PASS isolati; runtime cross-client NOT_RUN | Duplicati/riordino/tombstone Mini e guardie native verdi; RED conservati | Idempotenza/concorrenza/tombstone autentici durante F01–F04 | Idempotenza, conflitti espliciti, nessuna ricomparsa |
| G01 | Cinque icone e catalogo quattro lingue | Mini | PASS DevTools storico; assetv11 attribuibili | Cinque tab/10PNG nel manifest102 file; layout/catalogo quattro lingue storici | Nessun full-app/telefono dedotto | Titoli/tab/testi leggibili, prezzo contenuto |
| G02 | Altre schermate/dialoghi/errori quattro lingue | Mini | PASS Account online/offline quattro lingue v12; dialoghi residui NOT_RUN | Otto JPEG nativi nuovi ispezionati, picker reale/errore ritradotto; terminal80591422/release18182acf; ritorno zh-Hans/Online e fresh Account/Shops200 | Dialoghi pending/conflitto e altre schermate residue in handoff distinto | Cambio lingua completato; nessun testo troncato |
| P01 | Catalogo apertura/navigazione/ricerca/paging | Mini | Misure storiche parziali; residui NOT_RUN | 20warm/10search/6paging e due HTTP400 preservati | Cold/cache/sort e serie attribuibili alla versione; nessun SLA inventato | Inizio/fine app espliciti; soglie canoniche o nessun PASS SLA |
| P02 | Save online e ripresa outbox | Mini | Save singolo osservato; serie/outbox NOT_RUN | 1093ms n1 inclusi SDK/poll75ms, SQL escluso | Misure accorpate ai Save/pending autorizzati, niente write di warmup | p50/p95 solo con n adeguato, fallimenti inclusi |
| P03 | Convergenza quattro client | tutti | NOT_RUN | Nessun campione quattro-client autentico | Misurare submit→ultimo readback con clock osservatore coerente | Clock unico e nessun refresh artificiale |
| P04 | Upload/sostituzione/visualizzazione immagine | Mini/Admin | NOT_RUN | Vecchie durate includevano picker | Misure rete/UI durante D03/D04 separate dal coordinamento picker | Payload/ambiente dichiarati e errori conteggiati |
| P05 | Login e prima Home | Mini/Admin | FAIL setup cold storico; nuova serie NOT_RUN | Login singoli13.419s/7.964s e setupFAIL preservati | Cold/warm distinti, errori inclusi; niente p95 da n1 | Metodo e campioni espliciti; nessun percentile da n=1 |
| H01 | Telefono fisico WeChat/hardware/lifecycle | Mini | BLOCKED_EXTERNAL hardware | SDK03:02/04: Android: 0 dispositivi fisici online; unico tunnel Apple connesso coincide con SIM459;2 stati non classificati, nessun WeChat/TEST fisico validato | Owner utente: collegamento telefono, nuova verifica WeChat/shop TEST | Camera/galleria/permessi/rete reali; nessun PASS simulato |
| I01 | Integrazione e smoke combinazione finale | tutti modificati | Main/CI Mini verificati; runtime v12 e smoke finale aperti; baseline native sotto storiche | Mini49/50 main e305/CI37227922782 SUCCESS; Android14/main04f6 e CI37091905186; iOS14/main8df e CI37084694560 SUCCESS; Admin129/553c/Worker221/registry155 | Dopo prerequisiti e accettazione backend: integrazione Admin residua, smoke autentico finale | origin/main e runtime TEST riconducibili ai sorgenti |
| I02 | Cleanup fixture run e report finale | Mini/Admin | NOT_RUN finale | Diagnosi e sei fixture preservate; D05 PASS | Dopo accettazione/readback: soli cleanup previsti e chiusura/review finale | Nessun oggetto estraneo o diagnostico cancellato |

## Checkpoint storico — 2026-10-02 16:39 UTC

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
