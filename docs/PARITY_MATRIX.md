# WECHAT-003 capability and parity matrix

Reviewed against the current native navigation, not against product assumptions:

- Android roots: `FilePicker`, `History`, `Database`, `Options` in `ui/navigation/RootTab.kt`; detail/edit/import routes in `NavGraph.kt`.
- iOS roots: `InventoryHomeView`, `DatabaseView`, `HistoryView`, `OptionsView` in `ContentView.swift`; product price history, scanner and import flows are subordinate views.
- Mini Program roots: Home, Sales, Database, History and Account in `miniprogram/app.json` after the WECHAT-003 navigation handoff.

`IMPLEMENTED_REVIEW` means the code and fixture contract exist but WECHAT-002 remains in REVIEW. It is not a live-environment or release-readiness claim. `INCOMPLETE` is used for WMP-012 because adaptive polling is only the required temporary fallback, not the requested private invalidation channel.

| Capability | Android | iOS | Mini Program | Backend required | Read/write | Applicable to Mini | Status | Test/evidence | Exclusion reason |
|---|---|---|---|---|---|---|---|---|---|
| Inventory/catalog root | Database root with local/cloud catalog | Database root with SwiftData/cloud catalog | Database tab, bounded catalog | `wechat_catalog_page_v1` | Read | Yes | IMPLEMENTED_REVIEW | Mini API fixture; pgTAP catalog/cross-shop; 20k performance dataset | — |
| Product list | Search/filter product list | Search/filter product list | Name/barcode search, filters, sort, keyset page | catalog RPC + route | Read | Yes | IMPLEMENTED_REVIEW | Unit request bounds; pgTAP; performance script | — |
| Product detail | Edit/detail dialog includes product metadata | Product detail/edit surfaces | Read-only product detail | `wechat_product_detail_v1` | Read | Yes | IMPLEMENTED_REVIEW | Mini contract/build; pgTAP detail | — |
| Product images | Thumbnail/main read plus camera/upload flows | Thumbnail/main read plus picker/upload flows | Lazy thumbnail list, main detail, placeholder/error | Existing private bucket and `product-images/read-urls` | Read | Yes | IMPLEMENTED_REVIEW | Batch max 16 client test; existing server authorization; private version references | — |
| Categories | Picker/quick-create and product association | Import/edit association and counts | Searchable paged list, counts, associated products | `wechat_categories_page_v1` | Read | Yes | IMPLEMENTED_REVIEW | pgTAP shop scope/search; Mini route test | — |
| Suppliers | Picker/quick-create and product association | Import/edit association and counts | Searchable paged list, counts, associated products | `wechat_suppliers_page_v1` | Read | Yes | IMPLEMENTED_REVIEW | pgTAP shop scope; Mini route test | — |
| Current price | Product/database price fields | Product/database price fields | Current retail/purchase values only when schema-backed | catalog/detail RPCs | Read | Yes | IMPLEMENTED_REVIEW | pgTAP fixture; 20k catalog run | — |
| Price history | Purchase/retail series in product dialog | `ProductPriceHistoryView` | Keyset-paged history in product detail | `wechat_price_history_page_v1` | Read | Yes | IMPLEMENTED_REVIEW | pgTAP 2-row history; 10k performance fixture | — |
| Import/update history | History root, generated entries and import review | History root and sync/import history | Sanitized activity History page | `wechat_sync_history_page_v1` | Read | Yes | IMPLEMENTED_REVIEW | pgTAP proves metadata/entity/device identifiers absent | — |
| Account/options | Options root; Google/email/WeChat and sync settings | Options root; Google/email/WeChat and sync settings | Own profile, providers, WeChat state, version, language | `wechat_account_profile_v1` | Read/action | Yes | IMPLEMENTED_REVIEW | pgTAP provider/profile state; session fixture | Privacy/deletion URL remains external configuration |
| Shop switch | Home header and shop repository | Inventory header and `ShopContextStore` | Home and Account switch active authorized shop | existing `wechat_authorized_shops_v1` | Read/local selection | Yes | IMPLEMENTED_REVIEW | session/shop fixture; cross-shop pgTAP | — |
| Today's sales KPI | Not present in current native root navigation | Not present in current native root navigation | Gross/refund/net/count/average/latest sale | summary/page RPCs | Read | Yes | IMPLEMENTED_REVIEW | date/range unit test; pgTAP zero-filled range | Mini-specific core addition |
| Historical sales | Not present in current native root navigation | Not present in current native root navigation | Day navigation, last 7/30 days, current month, totals and daily grouping | period summary + sales page | Read | Yes | IMPLEMENTED_REVIEW | bounded date/range tests; 10k sales performance fixture | Custom arbitrary date range UI deferred; bounded day/range presets exist |
| Sales filters/pagination | Not present | Not present | Status, sale/refund kind, payment, staff/device, sale number; keyset | `wechat_sales_page_v2` + bounded filter facets | Read | Yes | IMPLEMENTED_REVIEW | Client encoding; owner/manager metadata/facet pgTAP | Staff/device values and filters intentionally unavailable to viewers |
| Sale detail | Not present | Not present | Lines, amounts, status, payment, conditional staff/device | `wechat_sale_detail_v2` | Read | Yes | IMPLEMENTED_REVIEW | RPC/API contract tests | — |
| Foreground/pull refresh | Lifecycle-driven cloud sync | Lifecycle-driven sync watcher | Foreground reload, pull-to-refresh, stale request suppression | existing read APIs | Read | Yes | IMPLEMENTED_REVIEW | adaptive controller unit test | — |
| Private live invalidation | Realtime sync-event watcher for native catalog/sync, not a Mini sales proof | Realtime sync-event watcher for native catalog/sync, not a Mini sales proof | No verified compatible private channel; adaptive 3–30s polling only | private shop invalidation or verified gateway | Read signal | Yes | INCOMPLETE | backoff/stop unit test only; no live latency measurement | Official Mini Program WebSocket/Supabase compatibility and gateway are unverified |
| Offline state/retry | Native repositories and sync UX | Local-first SwiftData and sync UX | Error/offline state, retry, bounded cached last page | none beyond read APIs | Local read/retry | Yes | IMPLEMENTED_REVIEW | cache eviction/backoff unit tests | No durable offline database is claimed |
| Localization | EN/ES/ZH/IT resources | EN/ES/ZH-Hans/IT resources | Complete typed ZH/EN/ES/IT dictionary | none | Presentation | Yes | IMPLEMENTED_REVIEW | TypeScript exhaustiveness/typecheck | Tab bar labels stay Chinese by platform design |
| Product create/update/archive/restore | Native local-first mutation/sync path | Native local-first mutation/sync path | Typed Admin mutation client and review UX | `wechat_catalog_mutate_v1`, capability projection, lifecycle reads | Write | Yes | FOUNDATION_AUTOMATED | Mini 53/53; Admin foundation 47/47; catalog pgTAP 81/81; Android/iOS convergence | Controlled lane bypass and live/DevTools evidence remain |
| Category/supplier writes and replacement | Native transactional-local replacement then sync | Native transactional-local replacement then sync | Typed create/update/archive/restore and replacement UX | Revision-guarded single Admin DB transaction | Write | Yes | FOUNDATION_AUTOMATED | Atomic replacement/permission/shop A-B evidence in scoped 474/474; cross-platform suites PASS | O(page × products) count debt; live QA pending |
| Current price mutation | Current product + append-only history | Current product + append-only history | Canonical numeric price operation | Atomic current+history mutation and standard sync triggers | Write | Yes | FOUNDATION_AUTOMATED | Price/history/idempotency pgTAP and Android/iOS fixture convergence PASS | No localized strings on wire; live workflow pending |
| Image capture/upload/delete | Camera/gallery and canonical server workflow | Picker/camera and canonical server workflow | Official picker/compression + private versioned flow | Mini personal-member image routes over shared service | Write | Yes | FOUNDATION_AUTOMATED | Image 35/35; standalone POS image 162/162; Mini client tests PASS | No arbitrary path/public bucket; real DevTools upload/cleanup pending |
| Catalog mutation History | No general catalog audit UI | No general catalog audit UI | Dedicated safe fifth-tab projection | Admin append-only audit projection | Read | Yes | FOUNDATION_AUTOMATED | Filter/keyset/shop-isolation pgTAP and 53/53 Mini tests PASS | Distinct from sales, prices and sync activity; live QA pending |
| Excel import/export and generated sheets | Core native file workflow | Core native file workflow | No endpoint/button/parser | Canonical Admin pipeline fails thin-adapter decision gate | Read/write files | No in this wave | DEFERRED_BY_ARCHITECTURE_DECISION | DEC-002; Admin import 63/63 tests | Bearer context/resource/recovery refactor required |
| Barcode scanner | Native scanner in product/edit flow | `BarcodeScannerView` | Text barcode search only | camera permission/product workflow | Input/write assist | No | NOT_APPLICABLE | Native source review | Camera scanner is explicitly separate; barcode lookup remains available |
| Large product editing workflows | Native dialogs/import analysis | Native SwiftUI edit/import analysis | Not exposed | audited mutation/orchestration APIs | Write | No | NOT_APPLICABLE | Native source review | Mobile editing workflow is not suitable for the read-only Mini target |

## Scope result

Every retained WECHAT-002 core read module has a Mini Program surface and a bounded server contract. WECHAT-003 now has passing Mini, Admin/scoped-database and Android/iOS device-free foundation evidence, but it does **not** qualify for catalog-management activation: an ordinary WeChat Supabase bearer can bypass the controlled lane through legacy/table same-shop write sinks, and live Auth, iOS provider/bridge and WeChat DevTools evidence remain absent. WMP-024 also remains `REVIEW_WITH_LIMITATION` because polling is not private realtime.

Global classification: `CHANGES_REQUIRED — FOUNDATION_IMPLEMENTED, LIVE AUTH AND MUTATING CATALOG WORKFLOWS INCOMPLETE`.

## WECHAT-004 semantic parity closeout

| Policy | Android | iOS | Mini Program | Result |
|---|---|---|---|---|
| Canonical source | Supabase tables + `sync_events` | Supabase tables + `sync_events` | Admin BFF over the same tables/events | PARITY |
| Offline writes | Durable local pending/outbox | Durable local pending/outbox | Durable bounded per-user/shop outbox | PARITY |
| Ambiguous retry | Stable deterministic identity | Stable deterministic identity | Stable idempotency key/body | PARITY |
| Ordering | Entity/dependency ordered drain | Entity/dependency ordered drain | FIFO per entity + dependency IDs | PARITY |
| Incremental pull | Event watermark + targeted reads | Event watermark + targeted reads | Minimal delta + targeted reads | PARITY |
| Gap/transition | Stop/reconcile/bootstrap | Stop/reconcile/bootstrap | Gap reconcile + epoch bootstrap | PARITY |
| Conflict | CAS/review; no silent LWW | CAS/review; no silent LWW | Reload/manual retry/cancel | PARITY |
| Tombstone/restore | Canonical `deleted_at` semantics | Canonical `deleted_at` semantics | Same server lifecycle | PARITY |
| Price | Current product + append-only history | Current product + append-only history | Same atomic server operation | PARITY |
| Images | Version pointer, private signed media | Version pointer, private signed media | Same Admin-owned version contract | PARITY |
| Account/shop isolation | Account/shop storage boundary | Account/shop storage boundary | Session generation + scoped queues/caches | PARITY |

The implementation deliberately differs only in platform mechanics: Mini uses
official local storage/file APIs and foreground adaptive delta polling instead
of WorkManager/SwiftData schedulers. No separate sync lane was introduced.
Private push is not claimed; the UI says automatic update. Final status becomes
`INTEGRATED_SYNC_POLICY_PARITY_PASS` only after all four main branches contain
the verified code.
