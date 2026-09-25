# WECHAT-010 — completamento funzionale e accettazione

Stato corrente: **FIX: challenge enrollment HTTP400 prima di Tencent**. Report operativo canonico, matrice locale/DevTools/telefono separata. Nessun DONE auto-approvato.

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
