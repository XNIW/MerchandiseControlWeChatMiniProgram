# WECHAT-010 — completamento funzionale e accettazione

Stato corrente al 2026-09-25: **EXECUTION**, delta applicativo verificato localmente e revisionato; integrazione OFF in corso. Questo è il riepilogo operativo canonico. La [matrice](../PARITY_MATRIX.md) separa codice, test locali, DevTools e telefono. I report precedenti sono [storici](archive/WECHAT-010-REPORT-20260912.md); le loro cifre e prerequisiti non descrivono lo stato attuale. Nessun DONE auto-approvato.

## Risultato applicativo

F01: parsing/formattazione cilena centralizzati. `47.100` prezzo diventa numero47100; quantità `1,250` diventa1.25 e `1.234,567` diventa1234.567. Prezzi nuovi CLP interi, quantità nuove massimo3 decimali. La precisione canonica Admin preesistente resta invariata: valori frazionari già memorizzati tornano identici sul wire quando non modificati; nessun arrotondamento o migrazione massiva. Form, catalogo/dettaglio, prezzi e totali vendite usano la presentazione localizzata indipendente dalla lingua.

F02/F03: categorie/fornitori a pagine100, ricerca, cursori nome+UUID, picker e replacement; lettura puntuale shop+ID per editor oltre prima pagina. Le associazioni correnti mantengono ID ed etichetta anche fuori pagina e dopo reload di conflitto. Prezzi a pagine50, errori/ripresa/fine, deduplicazione e cursore riposizionato dopo refresh:125 eventi e60 inserimenti intermedi producono185 eventi senza buchi. Le liste conservano la finestra navigata durante sync. Il DB vieta nomi attivi uguali nello stesso shop; i pareggi sono coperti in aggiunta nel client.

F04/F05: coordinatore unico foreground con deadline persistita, evento rete e stop/resume; sender per account/shop/generazione. Tutte le fasi base/acquisto/vendita sono journalizzate prima della prima richiesta; i token di revisione derivano dalle ricevute server. Risposta persa conserva chiave/payload; interruzione riprende le fasi residue. Scartare una fase cancella l'intento intero; assenza della coda non equivale a Saved. Conflitto richiede reload o riapplicazione esplicita. Errori definitivi correggibili sbloccano il form; esito incerto protegge la bozza. Account mostra pending/errori e azioni di recupero/scarto; retry esaurito riparte esplicitamente con la stessa chiave. Storage corrotto è preservato: recupero conservativo, backup dei byte originali, quarantena degli intenti incompleti; indice ricostruibile senza perdere gli altri scope. Quota storage non causa invii non registrati né loop50ms.

F06: Sales risolve il giorno dallo shop tramite summary; History manda date di calendario e il server applica `storefront_settings.catalog_time_zone`. Fine inclusiva convertita in mezzanotte successiva meno1µs, inclusi giorni23/25h. Filtri in bozza separati da quelli applicati, notifiche durante caricamento recuperate. Rete, timeout, rate limit, sessione, membership, sospensione e permessi hanno stati distinti; caricamento fallito non diventa zero vendite. Form/dialoghi/letture ignorano risposte e consensi del vecchio contesto. Fotocamera primaria e galleria hanno pulsanti distinti.

Il salvataggio multiphase è recuperabile, non una singola transazione: una fase già confermata può essere visibile prima della successiva. Le bozze non ancora salvate restano locali alla pagina e sono protette dall'avviso di uscita; non si dichiara persistenza di ogni battuta. Polling foreground adattivo, non push privato né SLA3s. URL immagini privati già emessi restano bearer fino al loro TTL.

## Verifiche eseguite

- Mini Node26.7.0/npm11: `verify`, governance/privacy/secrets, typecheck, lint,102 test TS e32 test MJS, build. Gli ultimi2 test riguardano lifecycle e sono riportati solo dopo l'esito nel worklog.
- Admin Node22: `verify` (lint/typecheck/security/build), foundation1015 PASS/2 skip. Il primo tentativo con checkout Win7POS incompleto aveva2 errori ENOENT; riesecuzione con checkout esistente read-only `wechat-006/Win7POS`, nessuna modifica nativa.
- PostgreSQL17.6, database locale separato, schema senza dati reali:337 pgTAP PASS in8 suite (49 letture,86 catalogo,38 immagini,52 BFF/sync,55 pairing/sessioni,22 nuove letture,8 rate lock,27 auth/vendite). Fixture in transazioni ROLLBACK. Il database sorgente locale e staging non sono stati resettati.
- Nuove regressioni: numeri/limiti e frazioni esistenti;250 categorie+250 fornitori; ID fuori pagina;185 prezzi; retry automatico rete; quota/corruzione indice/journal; due shop/sessioni; piano interrotto/conflitto/scarto; date server/DST; filtri draft/sync; conferme dopo cambio account; ripristino archiviati. Difetti iniziali numeri, coda corrotta, lock cross-shop e lifecycle sono stati osservati fallire prima dei fix; review ha riprodotto ulteriori casi prima della correzione.

Queste sono prove locali/fixture, non autenticazione Tencent o accettazione business reale. Privacy nativa invariata: si riusano le47 prove DevTools del12settembre, quattro lingue/online-offline, e le limitate schermate iPhone descritte nel packet; non si estendono a queste nuove schermate business.

## Matrice e performance

[PARITY_MATRIX](../PARITY_MATRIX.md) è l'inventario requisito→azione→client→RPC→permesso→test→DevTools→telefono→residuo. Nessuna percentuale arbitraria. I conteggi locali coprono pagine100/50 e finestre250/185; limiti HTTP128KiB e batch immagini16 restano verificati nelle suite esistenti. Non sono latenze utente. Login/prima pagina/ricerca/save/immagine/convergenza reali: campioni0, p50/p95 NOT_RUN, rete/cache non osservate. Nessun seed massivo nel negozio condiviso; nessuna vendita/pagamento/refund reale creato.

## TEST, release e dipendenza materiale

Riletto Worker `merchandise-control-admin-web-staging`, progetto `jpgoimipbothfgkokyvm`, protocollo `wechat-mini-code2session-v1`, allowlist singleton del packet. Prima dell'integrazione funzionale: Worker3185ab67, release isolatab0e306f1,142 migration (ultima20260912142454), zero commerce; sette flag OFF. Il binding AppSecret risulta assente nella verifica protetta di questa esecuzione. Un'installazione sarebbe soltanto prova del binding, non della validità Tencent o del pairing.

Il mandato14settembre autorizza la credenziale TEST attuale precedentemente esposta: **ROTATION NOT_PERFORMED / ACCEPTED_FOR_TEST_ONLY**. La sostituzione non è prerequisito del pilot autorizzato, resta necessaria prima dell'uso pubblico. OneID non è dipendenza. L'unico gesto materiale richiesto ora è l'input nascosto in `mini-secret-install.py` nel packet già autorizzato; richiesta inoltrata senza chiedere il valore e non ripetuta. La licenza Xcode non accettata su questo Mac può impedire il Python di sistema: esiste il runtime Python bundled, senza necessità di accettare licenze per questa task.

Dopo input verificato: enrollment server→client con business OFF; vero wx.login/code2Session; trasferimento monouso, confronto e approvazione dalla sessione Admin personale; seconda prova e consenso Mini; verifica mapping; enrollment OFF; letture server/client; login distinto; poi gate mutazioni. Gesti personali mai simulati, nessun mapping SQL/sessione/JWT artificiale. Telefono e readback Android/iOS sui medesimi ID restano prove autentiche separate.

La release Admin deve derivare da b0e306f1 con soli6 file route/server e migrazione WeChat necessari. Vietato distribuire main intera o migration commerce. Backup delle2 definizioni sostituite, ACL e registry prima dell'applicazione; recupero funzionale mediante flag OFF e ritorno al Worker precedente, senza rollback dei dati business. Esiti effettivi PR/CI/deploy verranno aggiunti dopo l'esecuzione: non sono PASS anticipati.

## Review e classificazione

Due reviewer read-only, writer unico. F04/F05 approvato con42/42 test indipendenti Node26.7; F01–F03/F06 approvato con12/12 test e diff-check. Hash e ultimo delta lifecycle nel worklog; approvazione vincolata ai byte revisionati e all'integrazione OFF.

**CODE_COMPLETE**: delta F01–F06 revisionato localmente; acceptance integrale runner/business ancora in esecuzione. **LIVE_VALIDATED: NO. PUBLIC_RELEASE_READY: NO.** Task resta aperta per prove autentiche e conferma prevista dalla governance. Non basta CI verde, HTTP200, toast o file runner presente per trasformare NOT_RUN in PASS.
