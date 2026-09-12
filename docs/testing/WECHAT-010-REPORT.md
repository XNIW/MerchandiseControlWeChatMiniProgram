# WECHAT-010 — Mini diretto, privacy nativa e accettazione

2026-09-12. Stato: REVIEW / EXTERNAL_ACTIVATION_REQUIRED. Questo report sostituisce i riepiloghi operativi precedenti; lo storico resta in Git e TASK_HISTORY. Nessun DONE auto-approvato.

## Decisioni e confine applicativo

Il mandato designa il profilo canonico già nel packet e TASK068E_260618231325. La verifica puntuale ha confermato auth.users/profiles, account e shop attivi, membership shop_owner, identità Google e nessuna custom:wechat. Non prova che Android/iOS/POS usino lo stesso shop. Non è stato impersonato il profilo né creato un mapping amministrativo.

OneID resta sospeso. Il Mini implementa il protocollo esplicito `wechat-mini-code2session-v1`, selezionato su entrambi i lati e senza fallback da un errore OIDC. wx.login e code2Session producono una prova WeChat scoped ad AppID, un mapping applicativo e una sessione Mini opaca in memoria con durata massima 900 secondi. Non vengono creati utenti/identità Supabase, email, password o JWT fittizi. Web/Android/iOS mantengono il contratto OIDC precedente.

Il pairing richiede sessione Admin personale verificata da getUser e auth.sessions, consenso iniziale, codice di trasferimento monouso, confronto visivo, approvazione Admin e nuova prova WeChat con consenso Mini. Scadenza cinque minuti, capability separate conservate in memoria e solo hash in DB. Collisione tra profili negata, ripetizione sullo stesso profilo idempotente, unlink revoca sessioni e pairing pendenti. Le RPC business derivano l'attore dal token/device; sessione, mapping e autorizzazione sono ricontrollati nella stessa transazione. Storage riusa queste prove prima delle operazioni e della pubblicazione URL. Un URL già emesso rimane bearer fino alla sua scadenza prevista.

## Privacy effettiva

La fonte Admin `src/lib/legal/policies.json` conserva sei sezioni privacy e quattro sezioni cancellazione, tutti i paragrafi e il contenuto effettivo esistente. Versione contenuto 2026-08-14; revisione traduzioni 2026-09-12. Lingue en/it/es/zh-Hans. SHA256 della rappresentazione canonica: `3b77d67b3817f15ffa6e9a98ec9df35358da4501e5c184f7ffd2313d70516313`. Generazione Mini verificata e confronto con la fonte Admin; nessun contatto o servizio di cancellazione inventato.

Accesso pubblico senza authClient/sessione/rete, contenuto incluso nella build, scelta lingua, scrolling e ritorno. DevTools ha mostrato e reso leggibili privacy e cancellazione native in cinese e cancellazione in inglese, con Auth OFF; italiano/spagnolo e sessione scaduta sono verificati deterministicamente. La conclusione della prova runtime offline/ritorno attende lo sblocco del Mac richiesto da Computer Use. La precedente web-view H5 rifiutata non è più l'unica modalità. `privacyWebView` non diventa PASS: V2 usa un'attestazione nativa separata. V1 resta esclusivamente OIDC/H5 e rifiuta protocollo/fase/allowlist discordanti. Obblighi del portale WeChat separati e non certificati.

## Matrice delle prove

| Funzione | Codice e test locali | DevTools | Staging autenticato / telefono |
|---|---|---|---|
| Privacy/cancellazione pubbliche | PASS completezza, quattro lingue, OFF/sessione scaduta, navigazione | Contenuto cinese/inglese e scroll verificati; ulteriori prove indicate sopra | Accesso pubblico distinto dal business; telefono NOT_RUN |
| Pairing, sessione, mapping, revoca | PASS protocollo, claim/replay, doppio consenso, collisione/idempotenza, scadenza, account ban, device, UI scaduta e unlink OFF | Build OFF; prova WeChat autentica NOT_RUN | NOT_RUN: manca credenziale sostitutiva Tencent |
| Profilo/shop/ruoli e isolamento | PASS attore derivato, allowlist, actual service_role/anon/authenticated, cross-shop, viewer | Business OFF | NOT_RUN |
| Home/vendite/periodi/dettaglio/History | Contratti e regressioni esistenti PASS; formule e timezone conservate | Business OFF | NOT_RUN |
| Catalogo, categorie, fornitori, prezzi e lifecycle | CRUD controllato, replacement, revision/idempotency e negativi SQL/client PASS | Business OFF | NOT_RUN |
| Immagini camera/galleria/compressione/cache/upload/replace/remove | Regressioni esistenti più scope/revoca Storage PASS; API supportate conservate | Business OFF | NOT_RUN |
| Sync incrementale, outbox, offline/reconnect/conflitti | Batching, watermark dopo apply, ordine dipendenze, retry stessa chiave, logout/risposte tardive PASS | Lifecycle business NOT_RUN | NOT_RUN |
| Mini↔Admin↔Android/iOS | Contratti preservati; nessuna sostituzione account/shop | NOT_RUN | NOT_RUN |

Non si dichiara replica offline dell'intero catalogo, cancellazione di scritture già confermate, login WeChat multipiattaforma o business E2E da uno smoke OFF.

## Validazione e misure

Mini verify: 98 test TypeScript più 3 readiness, typecheck/lint/build/governance/secret scan PASS. Admin foundation: 1013 PASS, 2 skip già previsti; verificato con sorgente Win7POS read-only esistente perché il checkout principale non contiene due file legacy richiesti dai test. Nessun sorgente POS modificato. Admin verify/typecheck/lint/security/build e build Cloudflare PASS; UI pairing Chromium 2/2 PASS con risposte HTTP simulate. Il trasporto node:https è eseguito nel runtime Worker locale con outbound intercettato: PASS, nessuna richiesta Tencent.

Database: ricostruzione isolata PostgreSQL 17.6 dalle sole 141 migration dello staging e nuovo delta additive 20260912142454; le due commerce non incluse. Ruolo DDL postgres temporaneamente elevato soltanto nel container creato per questa prova, poi demozione prima dei test; utenti/ruoli reali service_role/anon/authenticated testati senza bypass. 313 controlli WeChat PASS, inclusi 53 diretti con collisione/idempotenza. Le fixture sono isolate e i test pgTAP fanno rollback.

Concorrenza locale: unlink mantiene il lock della transazione mentre una lettura business e una conferma pairing attendono in due connessioni reali; dopo il commit entrambe negano l'accesso. Misura RPC sessione→profilo locale, 10 warmup e 100 campioni, un profilo/shop fixture: p50 0,1425 ms, p95 0,168 ms, payload 302 byte. Non include rete, Worker o Tencent.

Regressioni prestazionali riusate e rieseguite: Home 20 cicli simulati in un minuto, 24 GET; finestra catalogo 100 righe con 1/16/17/250/500 ID cambiati sempre due GET e zero GET per prodotto; envelope HTTP 128 KiB, cinque eventi per pagina e dieci pagine per ciclo; sospensione timer in background. Le cifre sono conteggi e limiti locali, non misure telefono. Memoria/immagini/latency p50-p95 business reali e convergenza multipiattaforma restano NOT_RUN.

## Review e difetti corretti

Due reviewer indipendenti hanno approvato il disegno prima dell'implementazione; SHA256 iniziale del disegno `bfeedbb3b9586cb0fd856b850aaeee0e912cf46e99922ff1b614ec3bbece0f89`. La review implementativa ha richiesto correzioni: pairing approvato prima di unlink poteva riattivare mapping; protocollo della sessione doveva coincidere con quello configurato; helper sync doveva ripristinare i claims service_role moderni fra due transizioni; V1 readiness ammetteva contesto discordante; scadenza pairing non consentiva restart UI; enrollment_required si perdeva nel client; enrollment OFF nascondeva la revoca. Riprodotti e corretti con regressioni mirate e concorrenza SQL. Entrambe le review finali APPROVED: Mini `74605c117ba91efd816805aaf386a0f42aa21f31`, Admin `9bc0f0fce274707b2108cf7f67314aafb75c16b6`. Security ha rieseguito 7 test server e 3 readiness; tecnico/privacy 19 test selezionati e parità quattro lingue. Nessun finding bloccante aperto; approvazione integrazione OFF, non pilot live.

## Integrazione e stato lasciato

Baseline Mini 3834885d696293a5d83df7209e6ccbd6d98b334e, Admin e5babfe83fded4fa13ffe06cc1276df204f0a938. Root unico writer nei due worktree `codex/wechat-010-native-direct`. PR Mini16 e Admin106: CI Mini34702749828, Admin34702749008 e Cloudflare34702748992 PASS sui commit applicativi revisionati. Integrazione e deploy effettivi saranno registrati nell’appendice finale del packet privato prima della consegna. Release derivata da 91f3d8e57f3c47740852974b73a5d66efc4189db selezionando soltanto il delta revisionato; mai merge del ramo staging vecchio in main. Nessuna modifica produzione.

Il pilot non è attivabile senza credenziale sostitutiva e prova TEST: Auth, enrollment e mutazioni rimangono OFF. Allowlist designate nel packet, nessuna wildcard. Nessun secret reale letto/inserito. Le URL ufficiali WeChat negate non sono state ritentate con altri strumenti; il contratto wx.login del pacchetto ufficiale installato e il protocollo generale non certificano il TEST specifico.

## Unica dipendenza materiale Auth e punto di ripresa

Tencent deve fornire la procedura supportata e una credenziale TEST sostitutiva. Chat aperta non equivale a messaggio inviato; l'invio WeChat già approvato è ancora senza ricevuta verificata. OneID escluso dal percorso critico. Il packet contiene testo esatto approvato e `mini-secret-install.py`: inserimento personale nascosto, diretto al secret store Worker staging via stdin, senza file/argomenti/log del valore. Non è stato eseguito con un secret.

Dopo sostituzione ufficiale: input protetto nel solo store staging; configurazione server e attestazione runtime corrente; gate V2 enrollment con business OFF; pairing reale dal profilo personale esistente; attestazione TEST/enrollment autentica; gate readonly, build client e prima verticale login→sessione→profilo→shop→catalogo. Poi letture, mutazioni/immagini, sync e scenari avversi sulle sole fixture designate. Nessun PASS preventivo nel JSON e nessuna promessa di lavoro in background.
