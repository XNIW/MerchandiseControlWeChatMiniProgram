# Active task

## Stato corrente — collaudo autentico parziale, sync Mini verificato

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
Diagnostica delle API JPEG riuscita; causa nel percorso app ancora da localizzare.
Android: recupero UI fallito con rollback per device identity mancante dopo
verifica cache vuota; iOS: decoder catalog e gate storia compressa bloccano
il recupero. Accessi Google validi; sorgenti e dati ordinari nativi invariati.
Mac bloccato e sessione Mini scaduta: sblocco e login personali richiesti per
continuare il debugger e il collaudo disponibile. Nessun DONE; REVIEW del fix,
LIVE_VALIDATED parziale, PHONE_VALIDATED NO. Il report canonico dettaglia i residui.
Le sezioni datate precedenti sono storiche.

## 2026-09-25 — Residui immagini in REVIEW, accettazione BLOCKED_EXTERNAL

Nuovo delta circoscritto: anteprima e permessi, tutte50miniature, rinnovo URL limitato,
replay upload parziale/finalize incerto e revalidation temporanea. Root unico writer,
due reviewer read-only;149test Mini e1030Admin PASS/2skip,41pgTAP immagini e concorrenza
SQL isolata PASS. Review approvate, PR20/109 integrate e release staging selettiva verificata.
Mac tornato accessibile: nuova build verificata DevTools OFF5/5, senza sessione/shop;
nessuna accettazione business o telefono. Stato
corrente e matrice A–G nel [report canonico](../testing/WECHAT-010-REPORT.md). Input protetto AppSecret
ancora assente; nessuna prova business/telefono e nessun DONE. Note precedenti storiche.


> Stato operativo corrente2026-09-25: [report canonico](../testing/WECHAT-010-REPORT.md), matrice locale/DevTools/telefono separata. Il resto delle note datate precedenti è storico. Mandato TEST14settembre valido; rotazione NOT_PERFORMED/ACCEPTED_FOR_TEST_ONLY. Integrazione funzionale e release staging OFF completate; nessun DONE/live implicito.

## 2026-09-25 — Functional delta in REVIEW; authentic acceptance BLOCKED_EXTERNAL

F01–F07 fixes and selective OFF release are integrated; two independent read-only reviewers approved the application/runner deltas. Canonical report contains exact CI/source/Worker/migration receipts. External owner: user, protected TEST credential input via the already authorized installer, then personal pairing gestures. Binding absent; no authentic business/phone acceptance or DONE. Work still possible without that input is limited to already documented local checks and preparation, completed this session. Historical entries below are not current status.

## WECHAT-010 — Native privacy and direct Mini execution

- Status: `BLOCKED_EXTERNAL` — authentic TEST acceptance requires protected credential input; integrated delta is in REVIEW (2026-09-25)
- Root sole writer; two independent read-only reviewers.
- Contract: [WECHAT-010](WECHAT-010.md)
- Report: [Single execution and acceptance report](../testing/WECHAT-010-REPORT.md)
- The user designated the existing private canonical profile and TASK068E_260618231325. No further target confirmation required.
- Direct Mini implementation and native privacy delivered for final review; actual Tencent TEST credential/login and business E2E NOT_RUN.
- OneID paused. Auth/enrollment/mutations OFF pending evidence. No self-approved DONE.
- The 2026-09-14 mandate permits the existing exposed credential only for the designated TEST AppID, staging Worker and singleton pilot scope. Rotation is NOT_PERFORMED; risk accepted for TEST only, and actual validity/pairing/business remain independent evidence. Previous rotation-before-testing requirements are superseded in this exact scope.
