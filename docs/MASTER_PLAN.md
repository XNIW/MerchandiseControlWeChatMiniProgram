# MerchandiseControl WeChat Mini Program — Master Plan

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

## Aggiornamento 2026-09-27 — icone e ritest immagini

Dopo lo sblocco, ricompilazione ufficiale e login WeChat autonomo eseguiti.
Il ritest images-lifecycle supera preparazione/anteprima, poi fallisce
IMAGE_UPLOAD_ERROR. SELECT indipendente:1intento e1versione failed con
jpeg_metadata_forbidden, cleanup pending, prodotto senza immagine primaria.
Tentativo riconciliato come fallimento con cleanup pendente, non NO_WRITE o PASS.
Una diagnosi successiva PREVIEW_ONLY è fermata nel picker dal nuovo blocco del Mac;
prima di proseguire occorre annullarla e riconciliarla, senza confermare upload.

L’utente chiede verifica icone: UI e app.json confermano assenza delle5icone tab.
Delta circoscritto:10PNG locali normali/selezionati, generator asset opzionale e
copia PNG nella build. Verify155PASS e controlli formato/copia asset PASS;
verifica visiva nel runtime aggiornato ancora da eseguire dopo review/integrazione.
Mac bloccato di nuovo: owner utente, sblocco OS manuale richiesto; login autonomo
già autorizzato. Restano17letture/13casi catalogo PASS; nessun nuovo PASS immagini,
telefono o convergenza. Le ricevute datate precedenti restano storiche.

## Ricevuta precedente 2026-09-26 — collaudo parziale e sync verificato

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
Debugger: buffer nativo cross-realm rifiutato da instanceof. Fix PR28 integrato,
152test e CI verde; nuova build TEST caricata con riaccesso autonomo.
Il ritest reale rileva un secondo difetto: picker hide/show invalida l’anteprima
prima della conferma. Diagnosi NO_WRITE riconciliata; fix lifecycle PR29 integrato
60392f8d con155test e CI/head/main PASS. Build TEST modifica soltanto il dettaglio
prodotto, config invariata; nuova ricompilazione DevTools/ritest ancora necessari.
Android: recupero UI fallito con rollback per device identity mancante dopo
verifica cache vuota; iOS: decoder catalog e gate storia compressa bloccano
il recupero. Accessi Google validi; sorgenti e dati ordinari nativi invariati.
L’utente autorizza il riaccesso WeChat autonomo dopo scadenza e le operazioni
autonome nel perimetro TEST; riaccesso UI riuscito. Mac bloccato di nuovo alle18:40UTC:
BLOCKED_EXTERNAL runtime, owner utente, sblocco OS manuale richiesto dal controllo UI.
Nessun DONE; codice revisionato e integrato, accettazione runtime ancora incompleta,
LIVE_VALIDATED parziale, PHONE_VALIDATED NO. Il report canonico dettaglia i residui.
Le sezioni datate precedenti sono storiche.

## 2026-09-25 — Residui immagini in REVIEW, accettazione BLOCKED_EXTERNAL

Nuovo delta circoscritto: anteprima e permessi, tutte50miniature, rinnovo URL limitato,
replay upload parziale/finalize incerto e revalidation temporanea. Root unico writer,
due reviewer read-only;149test Mini e1030Admin PASS/2skip,41pgTAP immagini e concorrenza
SQL isolata PASS. Review approvate, PR20/109 integrate e release staging selettiva verificata.
Mac tornato accessibile: nuova build verificata DevTools OFF5/5, senza sessione/shop;
nessuna accettazione business o telefono. Stato
corrente e matrice A–G nel [report canonico](testing/WECHAT-010-REPORT.md). Input protetto AppSecret
ancora assente; nessuna prova business/telefono e nessun DONE. Note precedenti storiche.


> Stato operativo corrente2026-09-25: [report canonico](testing/WECHAT-010-REPORT.md), matrice locale/DevTools/telefono separata. Il resto delle note datate precedenti è storico. Mandato TEST14settembre valido; rotazione NOT_PERFORMED/ACCEPTED_FOR_TEST_ONLY. Integrazione funzionale e release staging OFF completate; nessun DONE/live implicito.

## 2026-09-25 — Functional delta in REVIEW; authentic acceptance BLOCKED_EXTERNAL

F01–F07 fixes and selective OFF release are integrated; two independent read-only reviewers approved the application/runner deltas. Canonical report contains exact CI/source/Worker/migration receipts. External owner: user, protected TEST credential input via the already authorized installer, then personal pairing gestures. Binding absent; no authentic business/phone acceptance or DONE. Work still possible without that input is limited to already documented local checks and preparation, completed this session. Historical entries below are not current status.

## 2026-09-14 — Explicit TEST credential exception

WECHAT-010 continues in EXECUTION under the new user mandate. The existing exposed
TEST AppSecret may be used only with the designated staging Worker/AppID and exact
personal tester/shop. Rotation remains NOT_PERFORMED and residual risk is accepted
for TEST only, not resolved or extended to production/public users. Add narrowly
scoped readiness states and retain the ordinary replacement and legacy OIDC paths.
Actual secret installation, Tencent exchange, pairing and business acceptance are
separate evidence. Root remains the sole writer; two independent reviewers maximum.
No application identity, TLS, authorization, session or storage invariants are relaxed.

## 2026-09-12 - Explicit native privacy and direct Mini mandate

WECHAT-010/TASK-159 continues in EXECUTION. The operator designates the existing
private profile and TASK068E_260618231325 as pilot target; current canonical
identity, active membership/shop and shop_owner role were rechecked read-only.
This does not prove native clients use the same shop. No impersonation.
Authorized: shared/versioned native privacy available without Auth; explicit
Mini-only code2Session architecture revision, secure initial pairing to the
existing profile, opaque sessions and restricted authorization, additive reviewed
migrations if required. OneID remains paused. OIDC guarantees for other surfaces
remain unchanged. Root sole writer in both existing isolated worktrees; at most
two independent read-only reviewers. No production or activation before proof.
Prior narrower scope is superseded only by this explicit amendment.

Historical status follows; the amendment above is current.

**WECHAT-010** resta in `REVIEW / EXTERNAL_ACTIVATION_REQUIRED`. Il nuovo link
privacy pubblico e verificato in DevTools con Auth OFF, verify89/89 e review
indipendente APPROVED; H5 rifiutata, business domain assente. Baseline dopo la chiusura
tecnica autorizzata dal mandato WECHAT-011: cinque finding corretti e approvati da
due reviewer indipendenti; Mini PR12 e Admin PR104 integrate, CI verde; release
isolata `91f3d8e5` distribuita come Worker `29d0c715` al 100%, smoke HTTPS OFF9/9.
Mini88/88 e nuova UI DevTools OFF verificate; Auth reale resta NOT_RUN. Credenziale
TEST, qualifica OneID e tester/shop designati restano prerequisiti distinti.
Il report unico governa prove, limiti e ripresa. Nessun DONE globale.

Baseline precedente: **WECHAT-010** era in `REVIEW / EXTERNAL_ACTIVATION_REQUIRED` for manually confirmed TEST-account domains,
AppSecret rotation prerequisites, current staging/DevTools checks and bounded
first-live preparation. Mini 84/84, DevTools domains/OFF audit and four public
runtime probes pass; real Auth remains NOT_RUN. See `docs/tasks/WECHAT-010.md`
and `docs/testing/WECHAT-010-REPORT.md`. Flags remain OFF.

**WECHAT-009** is in `REVIEW / EXTERNAL_ACTIVATION_REQUIRED` for real Auth prerequisite
inventory, verified performance fixes and conditional staging acceptance. See
`docs/tasks/WECHAT-009.md`. No live PASS or DONE is implied.

Historical baseline: **WECHAT-007** was in `EXECUTION` for assisted official registration and live
validation on the user-authorized `SHARED_PUBLIC_STAGING` target. `WMP-047` is
the single active Mini lane with `OPERATOR_ACTION_REQUIRED —
WECHAT_PORTAL_REGISTRATION_PACKET`; WMP-048…052 are ordered. FAST BASELINE and
the restricted operator packet pass, while all AppIDs and real OIDC bridge
values remain absent and every WeChat flag stays OFF. No different production
environment or public application publication is in scope.

**WECHAT-006** is in `REVIEW / EXTERNAL_ACTION_HANDOFF_COMPLETE`; its verified
backup/schema/Worker/native evidence remains historical and is not repeated.

**WECHAT-005** remains historical `REVIEW / CHANGES_REQUIRED`; its external
blockers are superseded only where the WECHAT-006 mandate supplies specific
authorization or new evidence. Its factual gate results are not rewritten.

**WECHAT-004** is `DONE` with classification
`MERGED_CODE_COMPLETE_EXTERNAL_ACTIVATION_REQUIRED` and result
`INTEGRATED_SYNC_POLICY_PARITY_PASS`. Corrective parents **WECHAT-001**,
**WECHAT-002** and **WECHAT-003** retain their historical review states.

This is the source of truth for the Mini Program vision, scope, milestones, tasks, dependencies, risks, and completion criteria. The canonical WeChat identity decision belongs to the Admin Web ADR; this repository consumes it and must not create a competing Auth architecture.

## Vision and boundaries

Deliver a native TypeScript Mini Program that lets a canonical MerchandiseControl personal account consult authorized shops, sales history, catalog/images, categories, suppliers, prices, sync history and account state. Sales, payments, refunds, voids, POS history and staff operations remain read-only. WECHAT-003 additionally permits controlled catalog/product/category/supplier/price/image mutations for authorized personal users, exclusively through the canonical Admin-owned server boundary. The client never owns WeChat AppSecret/code exchange, Supabase migrations, role assignment, direct database writes, trusted audit creation or sync-event construction.

Non-goals include POS staff login, staff/device/role writes, sales/refund/void/payment operations, direct Supabase-table access, platform administration, publication or production rollout. Camera barcode scanning remains excluded. Excel import is `DEFERRED_BY_ARCHITECTURE_DECISION` under WMP-021; no parser or placeholder UI belongs in the Mini Program.

## Cross-repository dependencies

- Admin Web: selected identity/session contract, server boundary, Supabase configuration, canonical migrations, shop-scoped read APIs, mutation services, permissions, audit/outbox/sync and private image Storage boundary.
- WeChat Open Platform: AppID, account association/UnionID eligibility, request domains, privacy configuration, review and approval.
- Supabase: custom OIDC provider and verified official session handoff.
- Android/iOS: behavior and UX consistency; neither defines a separate identity contract.

## Milestones

| Milestone | Objective | Dependencies | Acceptance/checks | Main risk | Status |
|---|---|---|---|---|---|
| M0 | Repository foundation and governance | User authorization | Governance, ledgers, remote/main, one bootstrap commit, secret/diff checks | Independent review pending | REVIEW_READY |
| M1 | Official WeChat technical feasibility | Official docs; WECHAT-001 | Evidence-backed Mini Program constraints and contract fit | External docs/approval unavailable | IN PROGRESS (parent) |
| M2 | Mini Program application foundation | M0, M1 decision gate | Pinned toolchain, deterministic scripts, CI, build | DevTools live proof pending | REVIEW_READY |
| M3 | Secure identity/session integration | Canonical Admin ADR/API | `wx.login` adapter, replay-safe backend handoff, session lifecycle tests | Bridge/device proof pending | REVIEW_READY |
| M4 | Authorized shop selection | M3, shop RPC | Only active authorized shops visible | Live cross-shop proof pending | REVIEW_READY |
| M5 | Daily sales read model | Admin migration/RPC | Correct timezone/currency/net/refunds/pagination | Live financial fixture pending | REVIEW_READY |
| M6 | Dashboard and paginated list | M4, M5 | Loading/empty/error/offline/session states; zh-Hans complete | Visual DevTools QA pending | REVIEW_READY |
| M7 | Automatic refresh/realtime fallback | Runtime feasibility | Adaptive bounded 3–30s polling, stop/resume, backoff | No private invalidation or measured live latency | REVIEW / CHANGES_REQUIRED |
| M8 | Security, privacy, cross-shop validation | M3–M7 | Threat model, secret scan, cross-shop contract tests | External activation gates remain | REVIEW_READY |
| M9 | WeChat DevTools and external activation | AppID/domains/approval/test account | Authorized DevTools/live evidence | External prerequisites | EXTERNAL_PREREQUISITES_REQUIRED |
| M10 | Final review and release readiness | M0–M9 | Full gates, evidence, review decision | Unproven live behavior and global legacy pgTAP crash | REVIEW / CHANGES_REQUIRED |
| M11 | Controlled mutation contract and permissions | WECHAT-003; Admin ADR/service/schema | Typed idempotent revision-guarded service; viewer/shop A-B denial | Canonical ADR/evidence under review | REVIEW / CHANGES_REQUIRED |
| M12 | Product, category, supplier, price and image management | M11; shared text/image contracts | Authorized UX, archive/restore, replacement, price history, private images | Live/visual and full integration evidence absent | REVIEW / CHANGES_REQUIRED |
| M13 | Catalog history and cross-platform convergence | M12; audit/outbox/sync | Safe history projection; complete idempotent events; Android/iOS fixtures | Live convergence unproved | REVIEW / CHANGES_REQUIRED |
| M14 | Excel import decision | Admin canonical import pipeline | Evidence-based thin-adapter gate | Public upload/recovery boundary insufficient | DEFERRED_BY_ARCHITECTURE_DECISION |
| M15 | Remaining Auth, refresh and integrated QA | M3, M7, M11–M14; external activation | Official adapters/bridge, private invalidation or declared fallback, DevTools/full gates | Bridge/iOS provider/AppID/domains/live QA absent | REVIEW / CHANGES_REQUIRED |
| M16 | Opaque Mini session and legacy-sink closure | WECHAT-004; Admin BFF/session migration | No general Supabase bearer; controlled service-only reads/mutations and revocation | External provider activation | DONE |
| M17 | Durable outbox and incremental sync parity | M16; canonical sync_events | Restart-safe ordered outbox, watermark/delta/gap/epoch/reconcile and explicit conflicts | Private push not proven; polling limitation | DONE |
| M18 | Local cross-platform E2E and security closeout | M16–M17; Android/iOS apply engines | Real local Supabase mutation/event/readback, production apply tests, targeted security scan | Staging/device/provider external | DONE |
| M19 | Four-repository GitHub integration | M16–M18; green local gates | Normal PR/CI/merge, post-merge verification, clean published heads | External activation only | DONE |
| M20 | Staging activation and live cross-platform validation | M19; verified non-production environments; official apps/provider/devices | Staging schema/deploy, progressive flags, factual live identity/sync/Storage/sales evidence and closeout | Target is labelled Production/no backup; writer, apps, provider and devices absent | REVIEW / CHANGES_REQUIRED |
| M21 | Shared public staging activation and live closeout | M19–M20; explicit staging designation and writer/deploy mandate | Manual restorable backup, current schema/Worker, official adapters, progressive E2E, normal GitHub integration and factual 54-field closeout | External WeChat registration and physical devices may bound live coverage | REVIEW / EXTERNAL_ACTION_HANDOFF_COMPLETE |
| M22 | Assisted official registration and essential live staging E2E | M21; operator public config; real provider/apps/devices | Operator packet, progressive Auth, official DevTools, essential catalog/image/sales/sync proof, performance and factual closeout | Portal/provider approvals and measured polling defects | EXECUTION |

## Task sequence

WMP-001 through WMP-008 retain their historical `REVIEW_READY` state under WECHAT-001, which now has changes requested. WMP-011, WMP-013, WMP-014 and WMP-015 remain in `REVIEW`; WMP-012 and WMP-016 remain `REVIEW / CHANGES_REQUIRED` under WECHAT-002.

WECHAT-003 and WMP-017…WMP-025 retain their historical `REVIEW` states. WMP-017…WMP-020 and WMP-022 are `CHANGES_REQUIRED`; WMP-021 records `DEFERRED_BY_ARCHITECTURE_DECISION`; WMP-023 records `EXTERNAL_ACTIVATION_REQUIRED / CHANGES_REQUIRED`; WMP-024 records `REVIEW_WITH_LIMITATION / CHANGES_REQUIRED`; WMP-025 is `CHANGES_REQUIRED`. The older unstarted WMP-009/WMP-010 backlog is preserved but superseded in planning by WMP-025 for the expanded scope. None of these older tasks is retroactively promoted to `DONE`.

WECHAT-004 supersedes the repository-controlled blockers without rewriting that
history. WMP-026…WMP-031 are `DONE` after normal merges and post-merge gates.
Auth remains `DONE_CODE / EXTERNAL_ACTIVATION_REQUIRED`, Excel remains deferred
and DevTools/live evidence remains externally blocked.

WECHAT-005 adds WMP-032…WMP-038 without rewriting WECHAT-001…004. The target,
migrations, staging deployment, official runtime and client prerequisites were
fully inventoried; independent Mini/Admin/local DB/Android/iOS gates pass and
official WeChat DevTools is installed. WMP-032…WMP-037 are now
`BLOCKED_EXTERNAL`; WMP-038 and the parent are `REVIEW / CHANGES_REQUIRED`.
No unavailable surface is presented as live.

WECHAT-006 adds WMP-039…WMP-046 under an explicit user mandate that designates
the exact Supabase project and Worker as `SHARED_PUBLIC_STAGING`, authorizes the
stale Admin writer handoff, a restricted manual backup, staging migration/deploy
and normal GitHub integration. Backup, seven migrations, Admin PR/merge, Worker
deploy, Mini automated gates, Android audit/gates and iOS device-free provider
gates are complete. Admin #86/#87 and iOS #7/#8 are merged normally; WMP-042
is in REVIEW. Portal/DevTools/live E2E remain exact external work; all
flags are OFF. The production/publication boundary remains unchanged.

WECHAT-007 adds WMP-047…WMP-052 without repeating the stable WECHAT-006
baseline. WMP-047 is active for operator-assisted application inventory;
WMP-048…052 cover real provider activation, live Auth, official Mini runtime,
essential live E2E, performance and normal GitHub closeout. Direct portal
automation is not attempted, and missing OIDC data never produces an invented IdP.

## Completion criteria

The repository may become release-ready only after the canonical identity contract, authorized shop isolation, financial semantics, controlled catalog mutation permissions/concurrency/idempotency, audit/outbox/sync convergence, private image lifecycle, deterministic build/tests, security review and official WeChat live/DevTools checks are all evidenced. Missing external approval is reported explicitly; it is never replaced by fixture evidence. No task becomes `DONE` without explicit user/designated-reviewer approval.

WECHAT-009: Mini74/74, Admin996+2skip/focused9/UI48 pass; no new P0/P1 in
manual diff review. No live Auth/essential staging PASS, migration or deploy.
See `docs/testing/WECHAT-009-REPORT.md` for the current acceptance matrix.

WECHAT-009 integrazione applicativa: Mini PR8 / Admin PR101 merged normalmente
dopo CI verde; pgTAP2627 e Cloudflare smoke PASS. Report unico aggiornato,
stato REVIEW / EXTERNAL_ACTIVATION_REQUIRED; staging e produzione invariati.
