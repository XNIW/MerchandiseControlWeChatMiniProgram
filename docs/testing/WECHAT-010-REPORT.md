# WECHAT-010 — completamento funzionale e accettazione

Stato corrente: **pilot TEST parzialmente collaudato: 17 scenari lettura e
13 casi catalogo verificati in DevTools. Checkpoint e watermark sync verificati;
immagini, offline e convergenza restano aperti.** Nessun DONE auto-approvato.

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
del percorso app: causa ancora non localizzata, nessun fix speculativo.
Breakpoint mirato nel debugger pronto; nuova prova richiede sessione personale.

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

**BLOCKED_EXTERNAL, owner utente:** il Mac risulta nuovamente bloccato; sblocco e
Sign in with WeChat personale dalla Home richiesti per la sessione Mini scaduta.
Emulatore Android/simulatore iOS non richiedono un nuovo login. Rimangono possibili review e
integrazione offline; la GUI non viene aggirata via SDK mentre il Mac è bloccato.

## Matrice A–G e limiti delle prove

| Mandato | Evidenza disponibile | Residuo effettivo |
|---|---|---|
| A Account/sessione/shop | Pairing, login distinto, profilo/shop, scadenza autentici | Riaccesso dopo ultima scadenza, foreground/logout/pending; negativi isolati separati |
| B Letture/vendite |17scenari UI+SELECT, zero corretto,12documenti storici e History prodotto con5audit | Ulteriori filtri/sort/pagine; edge case solo isolati |
| C Catalogo/prezzi |13casi reali,5fixture, rinomina e sostituzione/archiviazione categoria/fornitore, CLP interi e quantità1,25 | Conflitti live, storico multipagina e legacy invariati |
| D Immagini | Picker reale; errore prima dell’anteprima, NO_WRITE riconciliato; API JPEG diagnostiche riuscite | Localizzare e correggere il percorso app; anteprima/upload/album/versione/rimozione/rete e telefono |
| E Offline/sync | Fix lease integrato; checkpoint200, watermark12425→12430 concorde con5eventi scoped | Salvataggio offline→online senza navigazione, aggiornamento schermate e lifecycle |
| F Convergenza | Emulatore Android/simulatore iOS autenticati sullo stesso IDcanonico/shop/progetto | Recovery Android bloccato da device identity; recovery iOS bloccato; nessun roundtrip attestato |
| G Usabilità/lingue | Rendering prima pagina e percorsi inglesi reali | Ispezione autenticata4lingue, CTA/bozze/offline |
| Telefono/prestazioni | DevTools e simulatori disponibili; nessuna prova telefono | PHONE_VALIDATED NO, p50/p95 NON_MISURATO |

Le durate scenari45.566/14.486/6.602/6.468ms includono readback/orchestrazione,
non latenze utente. La run scritture interrotta non ha emesso campioni UX nel report;
nessun percentile o rispetto budget dedotto. Login/prima pagina/save/immagini/
convergenza richiedono misure comparabili. Zero campioni significa NON_MISURATO.

Cinque fixture della run conservate con marker e ID nel packet; nessun cleanup
automatico. Intent riconciliati, incluso il tentativo immagini FAIL/NO_WRITE; runner lock assente;
controllare nuovamente outbox e journal prima di riprendere o archiviare fixture.
Pairing personale preservato. AppSecret/sessioni/codici/URLfirmati non sono evidenza.
**CODE_COMPLETE** limitato ai delta approvati; **LIVE_VALIDATED parziale**;
**PHONE_VALIDATED NO; PUBLIC_RELEASE_READY NO**. Il pilot completo non è accettato.

Verifica della continuazione documentale: Node26.7.0 `npm run verify` PASS,
110test TypeScript e39test MJS, governance/privacy/secret scan/typecheck/lint/
build inclusi; `git diff --check` PASS. Runner privato continuazione12test PASS;
checkpoint immagini validato contro lo schema originale dopo riconciliazione.
Nessun codice applicativo, distribuzione Worker o migrazione aggiunti in questo delta.

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
