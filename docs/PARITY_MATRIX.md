# Matrice funzionale corrente — WECHAT-010

2026-09-25. Fonte di stato: [report canonico](testing/WECHAT-010-REPORT.md). Il confronto nativo e le classificazioni precedenti sono [storici](testing/archive/PARITY_MATRIX-before-20260925.md). I contratti Admin sono canonici; Android/iOS non sono stati modificati né certificati live in questa esecuzione.

Legenda: VERIFIED_LOCAL = regressione automatica locale, mai live; IMPLEMENTED_UNVERIFIED = codice raggiungibile ma prova reale mancante; EXTERNAL_ACTION_REQUIRED = dipendenza materiale/personale; OUT_OF_SCOPE = esclusione esplicita. DevTools e telefono indicati separatamente. Endpoint relativi alla base Admin `/api/mini-program/v1`, salvo auth/image.

| Requisito | Schermata / azione | Client → endpoint/RPC | Permesso | Stato / test | DevTools | Telefono | Residuo |
|---|---|---|---|---|---|---|---|
| Pairing diretto | Account→pairing, due consensi | auth-client→auth/wechat/mini→pair/proof | personale + allowlist | EXTERNAL_ACTION_REQUIRED;55 pgTAP + component | NOT_RUN autentico | NOT_RUN | input protetto; consensi personali |
| Login distinto/sessione/revoca | Home/Account | auth-client/session-store→direct_issue/session_resolve | mapping attivo/device/generation | VERIFIED_LOCAL | NOT_RUN | NOT_RUN | Tencent autentico |
| Profilo/provider/shop | Account, selettore | sales-api→account/shops→account_profile/authorized_shops_v2 | membership attiva | VERIFIED_LOCAL | NOT_RUN | NOT_RUN | readback account designato |
| Privacy/cancellazione | Account link pubblico | contenuto incluso/versionato | nessuna auth | VERIFIED_LOCAL |47 prove storiche invarianti | apertura/scroll ZH storico limitato | nessun nuovo delta privacy |
| F01 prezzi CLP/quantità | form/catalogo/detail/prezzi/vendite | catalog-numbers; wire numerico | scrittura capability server | VERIFIED_LOCAL; parsing/limiti/roundtrip | NOT_RUN | NOT_RUN | layout/input reali |
| Catalogo nome/barcode/sort/filter/page | Database | sales-api→catalog→catalog_page_v1 | can_read_catalog | VERIFIED_LOCAL; bounded/window SQL/client | NOT_RUN | NOT_RUN | testo reale/scroll |
| Dettaglio/associazioni | prodotto | productDetail→product_detail_v1 | shop read | VERIFIED_LOCAL; fuori pagina/reload | NOT_RUN | NOT_RUN | readback live |
| Create/update prodotto | form Save | durable intent→catalog mutations→catalog_mutate_v1 | can_write_products | VERIFIED_LOCAL; intent/revision/idempotenza | NOT_RUN | NOT_RUN | fixture run live |
| Duplicato barcode / conflitto | errore e reload/manuale | stesso boundary | server reauthorization/CAS | VERIFIED_LOCAL; regressioni + SQL | NOT_RUN | NOT_RUN | esito UI autentico |
| Archive/restore | detail/lifecycle | mutation client→catalog_mutate_v1 | capability per entità | VERIFIED_LOCAL; SQL + fence dialoghi | NOT_RUN | NOT_RUN | conferme/readback |
| F02 categorie/fornitori250 | liste/search/more | sales-api→categories/suppliers→page_v1 | shop read | VERIFIED_LOCAL;250+250 SQL/client | NOT_RUN | NOT_RUN | finestra reale |
| Editor/replacement oltre100 | entity-form e product picker | ID lookup shop-scoped + keyset | write category/supplier | VERIFIED_LOCAL; server lookup/offpage | NOT_RUN | NOT_RUN | replacement fixture live |
| Create/rename/replacement/restore | entity-form/lifecycle | catalog_mutate_v1 | server capability/CAS | VERIFIED_LOCAL;86 catalogo SQL | NOT_RUN | NOT_RUN | conteggi/riferimenti live |
| Prezzi correnti/append-only | product form/detail | mutation→price history | can_change_prices | VERIFIED_LOCAL; durable base/purchase/retail | NOT_RUN | NOT_RUN | native convergence |
| F03 storico185eventi | detail more/retry/end | priceHistory→price_history_page_v1 | shop read | VERIFIED_LOCAL; tie/dedup/refresh gap | NOT_RUN | NOT_RUN | storia reale |
| Immagini camera/galleria | detail pulsanti separati | platform→image client→private image routes | can_manage_images | VERIFIED_LOCAL; source/size/orientation/upload/replay | NOT_RUN | NOT_RUN | camera/permessi e upload autentici |
| Immagini replace/remove/TTL | detail/thumbnail | private version+signed URL | reauthorization shop/version | VERIFIED_LOCAL;38 SQL + client | NOT_RUN | NOT_RUN | file run/cleanup e TTL live |
| Home/Oggi gross/refund/net/count | Home | summary + page read RPC | sales read | VERIFIED_LOCAL; giorno shop/cache/errors | NOT_RUN | NOT_RUN | oracle fixture vendite locale/live read |
| Periodi/lista/dettaglio/filtri sales | Sales | period/page_v2/detail_v2/facets | viewer metadata mascherata | VERIFIED_LOCAL;49 parity +27 auth/sales | NOT_RUN | NOT_RUN | mai creare vendite reali |
| History catalogo e sync | History/filter/more | catalog_history_page_v1/sync_history_page_v1 | can_read_catalog_history | VERIFIED_LOCAL; applied filters/gap/refresh | NOT_RUN | NOT_RUN | eventi reali |
| F06 giorno/DST/errori | Home/Sales/History | server calendar/read deny DTO | membership/profile/shop live | VERIFIED_LOCAL;23/25h microsecondi | NOT_RUN | NOT_RUN | fuso telefono distinto |
| F04 drain foreground/rete | automatico + Account pending | outbox-drain→catalog client | account/shop/generation | VERIFIED_LOCAL; deadline/quota/network | NOT_RUN | NOT_RUN | rete/lifecycle fisici |
| F05 tutte fasi/restart | Save→journal | enqueueSequence/CAS receipts | invarianti server | VERIFIED_LOCAL; kill/lost-response model | NOT_RUN | NOT_RUN | process kill autentico |
| Recovery/corruzione/scarto | Account conferme | preserved raw/index/whole intent/retry same key | current canonical account | VERIFIED_LOCAL;corruption/exhaustion tests | NOT_RUN | NOT_RUN | storage device |
| Isolamento/ritardi/logout | tutte le pagine operative | scope cache/session/generation fences | fail closed | VERIFIED_LOCAL; cross-shop/account/late callbacks | NOT_RUN | NOT_RUN | account reali autorizzati |
| Localizzazione4lingue/tab | UI es/it/en/zh-Hans | typed dictionary/app tab locale | nessuno | IMPLEMENTED_UNVERIFIED; typecheck | privacy storico, business NOT_RUN | business NOT_RUN | layout nuovi controlli |
| Mini↔Admin↔Android/iOS | stesse entità canoniche | boundary + native readback | stesso profile/shop da verificare | EXTERNAL_ACTION_REQUIRED | NOT_RUN | NOT_RUN | login/device autentici |
| Performance end-to-end | login/search/save/image/sync | runner timing | singleton TEST | EXTERNAL_ACTION_REQUIRED;campioni0 | NOT_RUN | NOT_RUN | p50/p95 reali |
| Excel/scanner camera/POS writes/admin | nessuna UI | nessun endpoint nuovo | escluso | OUT_OF_SCOPE | — | — | DEC-002/mandato |

Le prove indipendenti dei reviewer approvano il delta locale OFF; non certificano l'intera matrice live. Il vecchio requisito di gateway WebSocket non si aggiunge al mandato: polling adattivo è il fallback documentato, senza SLA garantito.
