export type LocaleKey = "en" | "es" | "it" | "zh-Hans";

export type TranslationKey =
  | "account"
  | "accountSuspended"
  | "active"
  | "activeShop"
  | "actor"
  | "addImage"
  | "all"
  | "appVersion"
  | "applyFilters"
  | "autoUpdate"
  | "averageSale"
  | "barcode"
  | "barcodeAscending"
  | "cancel"
  | "catalogHistory"
  | "categories"
  | "category"
  | "categoryChanged"
  | "cashier"
  | "comparison"
  | "conflictMessage"
  | "conflictTitle"
  | "consent"
  | "create"
  | "created"
  | "currentPrice"
  | "database"
  | "date"
  | "deletion"
  | "device"
  | "disabledDetail"
  | "disabledTitle"
  | "duplicateBarcode"
  | "edit"
  | "editProduct"
  | "empty"
  | "entityNotFound"
  | "entityId"
  | "error"
  | "filter"
  | "from"
  | "grossRevenue"
  | "history"
  | "historyUnavailable"
  | "home"
  | "imageUnavailable"
  | "imageAdded"
  | "imageApi"
  | "imageRemoved"
  | "imageReplaced"
  | "replaceImageConfirm"
  | "imageManagementUnavailable"
  | "imageOperationCancelled"
  | "imageUploadFailed"
  | "invalidCategory"
  | "invalidFilters"
  | "invalidNumber"
  | "invalidSupplier"
  | "itemNumber"
  | "last30"
  | "last7"
  | "latestSale"
  | "linkRequired"
  | "linked"
  | "loadMore"
  | "loading"
  | "login"
  | "month"
  | "manage"
  | "membershipRemoved"
  | "miniProgram"
  | "modified"
  | "name"
  | "nameAscending"
  | "netRevenue"
  | "nextDay"
  | "noHistory"
  | "notLinked"
  | "notRealtime"
  | "none"
  | "offline"
  | "operation"
  | "payment"
  | "previousDay"
  | "previousPrice"
  | "priceHistory"
  | "priceChanged"
  | "privacy"
  | "product"
  | "productCount"
  | "productImage"
  | "productName"
  | "products"
  | "provider"
  | "purchasePrice"
  | "readOnlyCatalog"
  | "recentlyUpdated"
  | "reapplyManually"
  | "reloadServer"
  | "replaceImage"
  | "removeImage"
  | "removeImageConfirm"
  | "rename"
  | "replacementRequired"
  | "requiredFields"
  | "restore"
  | "restored"
  | "restoreConfirm"
  | "result"
  | "retailPrice"
  | "refunds"
  | "retry"
  | "retryableError"
  | "saleCount"
  | "saleDetail"
  | "saleNumber"
  | "sales"
  | "search"
  | "save"
  | "saved"
  | "saving"
  | "secondProductName"
  | "selectShop"
  | "sessionExpired"
  | "shopSuspended"
  | "signOut"
  | "status"
  | "stock"
  | "supplier"
  | "supplierChanged"
  | "suppliers"
  | "summary"
  | "surface"
  | "syncHistory"
  | "success"
  | "title"
  | "to"
  | "unauthorized"
  | "unavailable"
  | "unsavedChanges"
  | "updated"
  | "viewArchived"
  | "voids"
  | "archive"
  | "archiveConfirm"
  | "archived"
  | "archivedEntities"
  | "chooseReplacement"
  | "clearFilters"
  | "newCategory"
  | "newProduct"
  | "newSupplier"
  | "permissionDenied"
  | "pendingSignOutDetail"
  | "pendingSignOutTitle"
  | "retainPending"
  | "discardPending";

const translations: Record<LocaleKey, Record<TranslationKey, string>> = {
  en: {
    account: "Account",
    activeShop: "Active shop",
    all: "All",
    appVersion: "Version",
    applyFilters: "Apply filters",
    autoUpdate: "Automatic update",
    averageSale: "Average sale",
    barcode: "Barcode",
    categories: "Categories",
    category: "Category",
    categoryChanged: "Category changed",
    cashier: "Cashier",
    comparison: "vs previous day",
    created: "Created",
    consent:
      "Continuing sends a one-time WeChat login code to MerchandiseControl. No payment data is requested.",
    currentPrice: "Current price",
    database: "Database",
    date: "Date",
    deletion: "Account deletion",
    device: "Device",
    disabledDetail:
      "This read-only feature appears after WeChat identity configuration is approved.",
    disabledTitle: "Feature not enabled",
    empty: "Nothing to show",
    entityId: "Entity ID",
    error: "Unable to update. Try again.",
    grossRevenue: "Gross revenue",
    history: "Recent activity",
    home: "Home",
    imageUnavailable: "No image",
    imageAdded: "Image added",
    imageApi: "Image service",
    imageRemoved: "Image removed",
    imageReplaced: "Image replaced",
    last30: "Last 30 days",
    last7: "Last 7 days",
    latestSale: "Latest sale",
    linkRequired:
      "This WeChat identity must be linked from an authenticated MerchandiseControl account.",
    linked: "Linked",
    loadMore: "Load more",
    loading: "Loading…",
    login: "Sign in with WeChat",
    month: "This month",
    miniProgram: "Mini Program",
    modified: "Updated",
    name: "Name",
    netRevenue: "Net revenue",
    nextDay: "Next day",
    noHistory: "No history",
    notLinked: "Not linked",
    notRealtime: "Adaptive polling fallback; not realtime",
    offline: "Offline. Check your connection and retry.",
    payment: "Payment",
    previousDay: "Previous day",
    previousPrice: "Previous price",
    priceHistory: "Price history",
    priceChanged: "Price changed",
    privacy: "Privacy",
    product: "Product",
    products: "Products",
    provider: "Linked providers",
    refunds: "Refunds",
    retry: "Retry",
    restored: "Restored",
    saleCount: "Sales count",
    saleDetail: "Sale detail",
    saleNumber: "Sale number",
    sales: "Sales",
    search: "Search",
    selectShop: "Select a shop",
    sessionExpired: "Your session expired. Sign in again.",
    signOut: "Sign out",
    status: "Status",
    stock: "Stock",
    supplier: "Supplier",
    suppliers: "Suppliers",
    supplierChanged: "Supplier changed",
    success: "Success",
    title: "Today",
    unauthorized: "This account is not authorized for an active shop.",
    updated: "Last updated",
    voids: "Voids",
    accountSuspended: "This account is suspended.",
    active: "Active",
    actor: "Actor",
    addImage: "Add image",
    archive: "Archive",
    archiveConfirm: "Archive this item? This action is recorded in catalog history.",
    archived: "Archived",
    archivedEntities: "Archived catalog items",
    barcodeAscending: "Barcode A–Z",
    cancel: "Cancel",
    catalogHistory: "Catalog history",
    chooseReplacement: "Choose a replacement",
    clearFilters: "Clear filters",
    conflictMessage: "This item changed elsewhere. Reload it before saving again.",
    conflictTitle: "Server data changed",
    create: "Create",
    duplicateBarcode: "That barcode is already used in this shop.",
    edit: "Edit",
    editProduct: "Edit product",
    entityNotFound: "This catalog item no longer exists.",
    filter: "Filter",
    from: "From",
    historyUnavailable: "Catalog history is not available for this shop.",
    imageManagementUnavailable:
      "Image management is unavailable until trusted storage is configured.",
    imageOperationCancelled: "Image selection was cancelled.",
    imageUploadFailed: "The image could not be uploaded. Try again.",
    invalidCategory: "Select a valid category.",
    invalidFilters: "Check the entity ID and date range (maximum 366 days).",
    invalidNumber: "Enter a non-negative number with at most three decimal places.",
    invalidSupplier: "Select a valid supplier.",
    itemNumber: "Item number",
    manage: "Manage",
    membershipRemoved: "Your access to this shop was removed.",
    nameAscending: "Name A–Z",
    newCategory: "New category",
    newProduct: "New product",
    newSupplier: "New supplier",
    none: "None",
    operation: "Operation",
    permissionDenied: "You do not have permission for this catalog action.",
    pendingSignOutDetail:
      "Pending catalog or image changes exist. Retain them for this account, or discard them before signing out?",
    pendingSignOutTitle: "Pending changes",
    retainPending: "Retain",
    discardPending: "Discard",
    productCount: "Active products",
    productImage: "Product image",
    productName: "Product name",
    purchasePrice: "Purchase price",
    readOnlyCatalog: "You have read-only catalog access.",
    recentlyUpdated: "Recently updated",
    reapplyManually: "Reapply my draft",
    reloadServer: "Reload server data",
    replaceImage: "Replace image",
    replaceImageConfirm: "Replace the current product image?",
    removeImage: "Remove image",
    removeImageConfirm: "Remove the current product image?",
    rename: "Rename",
    replacementRequired: "Choose a replacement before archiving an item used by active products.",
    requiredFields: "Complete the required fields.",
    restore: "Restore",
    restoreConfirm: "Restore this catalog item?",
    result: "Result",
    retailPrice: "Retail price",
    retryableError: "The server is temporarily unavailable. Your form was kept; try again.",
    save: "Save",
    saved: "Saved",
    saving: "Saving…",
    secondProductName: "Second name",
    shopSuspended: "This shop is suspended.",
    summary: "Summary",
    surface: "Surface",
    syncHistory: "Sync history",
    to: "To",
    unavailable: "This action is currently unavailable.",
    unsavedChanges: "You have unsaved catalog changes.",
    viewArchived: "View archived",
  },
  es: {
    account: "Cuenta",
    activeShop: "Tienda activa",
    all: "Todos",
    appVersion: "Versión",
    applyFilters: "Aplicar filtros",
    autoUpdate: "Actualización automática",
    averageSale: "Venta media",
    barcode: "Código de barras",
    categories: "Categorías",
    category: "Categoría",
    categoryChanged: "Categoría modificada",
    cashier: "Cajero",
    comparison: "vs. día anterior",
    created: "Creado",
    consent:
      "Al continuar, se envía un código WeChat de un solo uso a MerchandiseControl. No se solicitan datos de pago.",
    currentPrice: "Precio actual",
    database: "Base de datos",
    date: "Fecha",
    deletion: "Eliminar cuenta",
    device: "Dispositivo",
    disabledDetail:
      "Esta función de solo lectura aparecerá cuando se apruebe la configuración de identidad de WeChat.",
    disabledTitle: "Función no habilitada",
    empty: "Nada que mostrar",
    entityId: "ID del elemento",
    error: "No se pudo actualizar. Inténtalo de nuevo.",
    grossRevenue: "Ingresos brutos",
    history: "Actividad reciente",
    home: "Inicio",
    imageUnavailable: "Sin imagen",
    imageAdded: "Imagen añadida",
    imageApi: "Servicio de imágenes",
    imageRemoved: "Imagen eliminada",
    imageReplaced: "Imagen sustituida",
    last30: "Últimos 30 días",
    last7: "Últimos 7 días",
    latestSale: "Última venta",
    linkRequired:
      "Esta identidad WeChat debe vincularse desde una cuenta MerchandiseControl autenticada.",
    linked: "Vinculado",
    loadMore: "Cargar más",
    loading: "Cargando…",
    login: "Acceder con WeChat",
    month: "Este mes",
    miniProgram: "Mini Program",
    modified: "Modificado",
    name: "Nombre",
    netRevenue: "Ingresos netos",
    nextDay: "Día siguiente",
    noHistory: "Sin historial",
    notLinked: "No vinculado",
    notRealtime: "Polling adaptativo temporal; no es tiempo real",
    offline: "Sin conexión. Comprueba la red y reintenta.",
    payment: "Pago",
    previousDay: "Día anterior",
    previousPrice: "Precio anterior",
    priceHistory: "Historial de precios",
    priceChanged: "Precio modificado",
    privacy: "Privacidad",
    product: "Producto",
    products: "Productos",
    provider: "Proveedores vinculados",
    refunds: "Reembolsos",
    retry: "Reintentar",
    restored: "Restaurado",
    saleCount: "Número de ventas",
    saleDetail: "Detalle de venta",
    saleNumber: "Número de venta",
    sales: "Ventas",
    search: "Buscar",
    selectShop: "Selecciona una tienda",
    sessionExpired: "La sesión caducó. Inicia sesión de nuevo.",
    signOut: "Cerrar sesión",
    status: "Estado",
    stock: "Existencias",
    supplier: "Proveedor",
    suppliers: "Proveedores",
    supplierChanged: "Proveedor modificado",
    success: "Correcto",
    title: "Hoy",
    unauthorized: "Esta cuenta no está autorizada para una tienda activa.",
    updated: "Última actualización",
    voids: "Anulaciones",
    accountSuspended: "Esta cuenta está suspendida.",
    active: "Activo",
    actor: "Actor",
    addImage: "Añadir imagen",
    archive: "Archivar",
    archiveConfirm: "¿Archivar este elemento? La acción quedará registrada en el historial.",
    archived: "Archivado",
    archivedEntities: "Elementos archivados del catálogo",
    barcodeAscending: "Código A–Z",
    cancel: "Cancelar",
    catalogHistory: "Historial del catálogo",
    chooseReplacement: "Elegir sustituto",
    clearFilters: "Borrar filtros",
    conflictMessage: "Este elemento cambió en otro lugar. Vuelve a cargarlo antes de guardar.",
    conflictTitle: "Los datos del servidor cambiaron",
    create: "Crear",
    duplicateBarcode: "Ese código de barras ya existe en esta tienda.",
    edit: "Editar",
    editProduct: "Editar producto",
    entityNotFound: "Este elemento del catálogo ya no existe.",
    filter: "Filtrar",
    from: "Desde",
    historyUnavailable: "El historial del catálogo no está disponible para esta tienda.",
    imageManagementUnavailable:
      "Las imágenes no están disponibles hasta configurar el almacenamiento de confianza.",
    imageOperationCancelled: "Se canceló la selección de imagen.",
    imageUploadFailed: "No se pudo subir la imagen. Inténtalo de nuevo.",
    invalidCategory: "Selecciona una categoría válida.",
    invalidFilters: "Comprueba el ID y el intervalo de fechas (máximo 366 días).",
    invalidNumber: "Introduce un número no negativo con un máximo de tres decimales.",
    invalidSupplier: "Selecciona un proveedor válido.",
    itemNumber: "Número de artículo",
    manage: "Gestionar",
    membershipRemoved: "Se retiró tu acceso a esta tienda.",
    nameAscending: "Nombre A–Z",
    newCategory: "Nueva categoría",
    newProduct: "Nuevo producto",
    newSupplier: "Nuevo proveedor",
    none: "Ninguno",
    operation: "Operación",
    permissionDenied: "No tienes permiso para esta acción del catálogo.",
    pendingSignOutDetail:
      "Hay cambios pendientes de catálogo o imagen. ¿Quieres conservarlos para esta cuenta o descartarlos antes de cerrar sesión?",
    pendingSignOutTitle: "Cambios pendientes",
    retainPending: "Conservar",
    discardPending: "Descartar",
    productCount: "Productos activos",
    productImage: "Imagen del producto",
    productName: "Nombre del producto",
    purchasePrice: "Precio de compra",
    readOnlyCatalog: "Tienes acceso de solo lectura al catálogo.",
    recentlyUpdated: "Actualizados recientemente",
    reapplyManually: "Volver a aplicar mi borrador",
    reloadServer: "Cargar datos del servidor",
    replaceImage: "Sustituir imagen",
    replaceImageConfirm: "¿Sustituir la imagen actual del producto?",
    removeImage: "Eliminar imagen",
    removeImageConfirm: "¿Eliminar la imagen actual del producto?",
    rename: "Renombrar",
    replacementRequired:
      "Elige un sustituto antes de archivar un elemento usado por productos activos.",
    requiredFields: "Completa los campos obligatorios.",
    restore: "Restaurar",
    restoreConfirm: "¿Restaurar este elemento del catálogo?",
    result: "Resultado",
    retailPrice: "Precio de venta",
    retryableError:
      "El servidor no está disponible temporalmente. El formulario se conservó; reintenta.",
    save: "Guardar",
    saved: "Guardado",
    saving: "Guardando…",
    secondProductName: "Segundo nombre",
    shopSuspended: "Esta tienda está suspendida.",
    summary: "Resumen",
    surface: "Origen",
    syncHistory: "Historial de sincronización",
    to: "Hasta",
    unavailable: "Esta acción no está disponible actualmente.",
    unsavedChanges: "Hay cambios del catálogo sin guardar.",
    viewArchived: "Ver archivados",
  },
  it: {
    account: "Account",
    activeShop: "Negozio attivo",
    all: "Tutti",
    appVersion: "Versione",
    applyFilters: "Applica filtri",
    autoUpdate: "Aggiornamento automatico",
    averageSale: "Vendita media",
    barcode: "Codice a barre",
    categories: "Categorie",
    category: "Categoria",
    categoryChanged: "Categoria modificata",
    cashier: "Cassiere",
    comparison: "rispetto al giorno precedente",
    created: "Creato",
    consent:
      "Continuando, un codice WeChat monouso viene inviato a MerchandiseControl. Non sono richiesti dati di pagamento.",
    currentPrice: "Prezzo corrente",
    database: "Database",
    date: "Data",
    deletion: "Eliminazione account",
    device: "Dispositivo",
    disabledDetail:
      "Questa funzione di sola lettura apparirà dopo l’approvazione della configurazione dell’identità WeChat.",
    disabledTitle: "Funzione non abilitata",
    empty: "Nessun elemento",
    entityId: "ID elemento",
    error: "Aggiornamento non riuscito. Riprova.",
    grossRevenue: "Ricavo lordo",
    history: "Attività recente",
    home: "Home",
    imageUnavailable: "Nessuna immagine",
    imageAdded: "Immagine aggiunta",
    imageApi: "Servizio immagini",
    imageRemoved: "Immagine rimossa",
    imageReplaced: "Immagine sostituita",
    last30: "Ultimi 30 giorni",
    last7: "Ultimi 7 giorni",
    latestSale: "Ultima vendita",
    linkRequired:
      "Questa identità WeChat deve essere collegata da un account MerchandiseControl autenticato.",
    linked: "Collegato",
    loadMore: "Carica altro",
    loading: "Caricamento…",
    login: "Accedi con WeChat",
    month: "Mese corrente",
    miniProgram: "Mini Program",
    modified: "Modificato",
    name: "Nome",
    netRevenue: "Ricavo netto",
    nextDay: "Giorno successivo",
    noHistory: "Nessuna cronologia",
    notLinked: "Non collegato",
    notRealtime: "Polling adattivo temporaneo; non è realtime",
    offline: "Offline. Controlla la connessione e riprova.",
    payment: "Pagamento",
    previousDay: "Giorno precedente",
    previousPrice: "Prezzo precedente",
    priceHistory: "Storico prezzi",
    priceChanged: "Prezzo modificato",
    privacy: "Privacy",
    product: "Prodotto",
    products: "Prodotti",
    provider: "Provider collegati",
    refunds: "Rimborsi",
    retry: "Riprova",
    restored: "Ripristinato",
    saleCount: "Numero vendite",
    saleDetail: "Dettaglio vendita",
    saleNumber: "Numero vendita",
    sales: "Vendite",
    search: "Cerca",
    selectShop: "Seleziona un negozio",
    sessionExpired: "La sessione è scaduta. Accedi di nuovo.",
    signOut: "Esci",
    status: "Stato",
    stock: "Scorte",
    supplier: "Fornitore",
    suppliers: "Fornitori",
    supplierChanged: "Fornitore modificato",
    success: "Riuscito",
    title: "Oggi",
    unauthorized: "Questo account non è autorizzato per un negozio attivo.",
    updated: "Ultimo aggiornamento",
    voids: "Annullamenti",
    accountSuspended: "Questo account è sospeso.",
    active: "Attivo",
    actor: "Autore",
    addImage: "Aggiungi immagine",
    archive: "Archivia",
    archiveConfirm: "Archiviare questo elemento? L’azione sarà registrata nello storico.",
    archived: "Archiviato",
    archivedEntities: "Elementi catalogo archiviati",
    barcodeAscending: "Codice A–Z",
    cancel: "Annulla",
    catalogHistory: "Storico catalogo",
    chooseReplacement: "Scegli sostituto",
    clearFilters: "Azzera filtri",
    conflictMessage: "Questo elemento è cambiato altrove. Ricaricalo prima di salvare.",
    conflictTitle: "I dati del server sono cambiati",
    create: "Crea",
    duplicateBarcode: "Questo codice a barre è già usato nel negozio.",
    edit: "Modifica",
    editProduct: "Modifica prodotto",
    entityNotFound: "Questo elemento del catalogo non esiste più.",
    filter: "Filtra",
    from: "Da",
    historyUnavailable: "Lo storico catalogo non è disponibile per questo negozio.",
    imageManagementUnavailable:
      "Le immagini non sono disponibili finché lo storage attendibile non è configurato.",
    imageOperationCancelled: "Selezione immagine annullata.",
    imageUploadFailed: "Impossibile caricare l’immagine. Riprova.",
    invalidCategory: "Seleziona una categoria valida.",
    invalidFilters: "Controlla l’ID e l’intervallo di date (massimo 366 giorni).",
    invalidNumber: "Inserisci un numero non negativo con al massimo tre decimali.",
    invalidSupplier: "Seleziona un fornitore valido.",
    itemNumber: "Numero articolo",
    manage: "Gestisci",
    membershipRemoved: "Il tuo accesso a questo negozio è stato rimosso.",
    nameAscending: "Nome A–Z",
    newCategory: "Nuova categoria",
    newProduct: "Nuovo prodotto",
    newSupplier: "Nuovo fornitore",
    none: "Nessuno",
    operation: "Operazione",
    permissionDenied: "Non hai il permesso per questa operazione sul catalogo.",
    pendingSignOutDetail:
      "Sono presenti modifiche catalogo o immagini in sospeso. Vuoi conservarle per questo account o eliminarle prima di uscire?",
    pendingSignOutTitle: "Modifiche in sospeso",
    retainPending: "Conserva",
    discardPending: "Elimina",
    productCount: "Prodotti attivi",
    productImage: "Immagine prodotto",
    productName: "Nome prodotto",
    purchasePrice: "Prezzo di acquisto",
    readOnlyCatalog: "Hai accesso in sola lettura al catalogo.",
    recentlyUpdated: "Aggiornati di recente",
    reapplyManually: "Riapplica la mia bozza",
    reloadServer: "Carica i dati del server",
    replaceImage: "Sostituisci immagine",
    replaceImageConfirm: "Sostituire l’immagine corrente del prodotto?",
    removeImage: "Rimuovi immagine",
    removeImageConfirm: "Rimuovere l’immagine corrente del prodotto?",
    rename: "Rinomina",
    replacementRequired:
      "Scegli un sostituto prima di archiviare un elemento usato da prodotti attivi.",
    requiredFields: "Compila i campi obbligatori.",
    restore: "Ripristina",
    restoreConfirm: "Ripristinare questo elemento del catalogo?",
    result: "Esito",
    retailPrice: "Prezzo di vendita",
    retryableError:
      "Il server è temporaneamente indisponibile. Il modulo è stato conservato; riprova.",
    save: "Salva",
    saved: "Salvato",
    saving: "Salvataggio…",
    secondProductName: "Secondo nome",
    shopSuspended: "Questo negozio è sospeso.",
    summary: "Riepilogo",
    surface: "Superficie",
    syncHistory: "Storico sincronizzazione",
    to: "A",
    unavailable: "Questa operazione non è attualmente disponibile.",
    unsavedChanges: "Ci sono modifiche al catalogo non salvate.",
    viewArchived: "Vedi archiviati",
  },
  "zh-Hans": {
    account: "我的",
    activeShop: "当前门店",
    all: "全部",
    appVersion: "版本",
    applyFilters: "应用筛选",
    autoUpdate: "自动更新",
    averageSale: "平均客单价",
    barcode: "条码",
    categories: "分类",
    category: "分类",
    categoryChanged: "分类已更改",
    cashier: "收银员",
    comparison: "较前一日",
    created: "已创建",
    consent: "继续即表示将一次性微信登录码发送给 MerchandiseControl。不会请求支付信息。",
    currentPrice: "当前价格",
    database: "数据库",
    date: "日期",
    deletion: "删除账户",
    device: "设备",
    disabledDetail: "微信身份配置获批后，此只读功能才会显示。",
    disabledTitle: "功能尚未启用",
    empty: "暂无内容",
    entityId: "项目 ID",
    error: "更新失败，请重试。",
    grossRevenue: "销售总额",
    history: "最近活动",
    home: "首页",
    imageUnavailable: "暂无图片",
    imageAdded: "已添加图片",
    imageApi: "图片服务",
    imageRemoved: "已移除图片",
    imageReplaced: "已更换图片",
    last30: "最近30天",
    last7: "最近7天",
    latestSale: "最近一笔销售",
    linkRequired: "此微信身份必须从已登录的 MerchandiseControl 账户中完成关联。",
    linked: "已关联",
    loadMore: "加载更多",
    loading: "正在加载…",
    login: "使用微信登录",
    month: "本月",
    miniProgram: "小程序",
    modified: "已更新",
    name: "名称",
    netRevenue: "净销售额",
    nextDay: "后一天",
    noHistory: "暂无历史",
    notLinked: "未关联",
    notRealtime: "自适应轮询备用模式；非实时",
    offline: "当前离线，请检查网络后重试。",
    payment: "支付方式",
    previousDay: "前一天",
    previousPrice: "上一价格",
    priceHistory: "价格历史",
    priceChanged: "价格已更改",
    privacy: "隐私",
    product: "商品",
    products: "商品",
    provider: "已关联登录方式",
    refunds: "退款",
    retry: "重试",
    restored: "已恢复",
    saleCount: "销售笔数",
    saleDetail: "销售详情",
    saleNumber: "销售编号",
    sales: "销售",
    search: "搜索",
    selectShop: "请选择门店",
    sessionExpired: "会话已过期，请重新登录。",
    signOut: "退出",
    status: "状态",
    stock: "库存",
    supplier: "供应商",
    suppliers: "供应商",
    supplierChanged: "供应商已更改",
    success: "成功",
    title: "今日",
    unauthorized: "此账户无权访问任何启用中的门店。",
    updated: "最后更新",
    voids: "作废",
    accountSuspended: "此账户已暂停。",
    active: "启用中",
    actor: "操作人",
    addImage: "添加图片",
    archive: "归档",
    archiveConfirm: "确认归档此项目？此操作会记录在目录历史中。",
    archived: "已归档",
    archivedEntities: "已归档目录项目",
    barcodeAscending: "条码 A–Z",
    cancel: "取消",
    catalogHistory: "目录历史",
    chooseReplacement: "选择替代项",
    clearFilters: "清除筛选",
    conflictMessage: "此项目已在其他位置更新，请重新加载后再保存。",
    conflictTitle: "服务器数据已更改",
    create: "创建",
    duplicateBarcode: "此门店已使用该条码。",
    edit: "编辑",
    editProduct: "编辑商品",
    entityNotFound: "此目录项目已不存在。",
    filter: "筛选",
    from: "开始",
    historyUnavailable: "此门店暂不可查看目录历史。",
    imageManagementUnavailable: "可信存储配置完成前无法管理图片。",
    imageOperationCancelled: "已取消选择图片。",
    imageUploadFailed: "图片上传失败，请重试。",
    invalidCategory: "请选择有效分类。",
    invalidFilters: "请检查项目 ID 和日期范围（最长 366 天）。",
    invalidNumber: "请输入非负数，最多三位小数。",
    invalidSupplier: "请选择有效供应商。",
    itemNumber: "货号",
    manage: "管理",
    membershipRemoved: "你对此门店的访问权限已移除。",
    nameAscending: "名称 A–Z",
    newCategory: "新建分类",
    newProduct: "新建商品",
    newSupplier: "新建供应商",
    none: "无",
    operation: "操作",
    permissionDenied: "你无权执行此目录操作。",
    pendingSignOutDetail: "存在待处理的目录或图片更改。退出登录前要为此账号保留还是丢弃？",
    pendingSignOutTitle: "待处理更改",
    retainPending: "保留",
    discardPending: "丢弃",
    productCount: "启用商品数",
    productImage: "商品图片",
    productName: "商品名称",
    purchasePrice: "采购价",
    readOnlyCatalog: "你只有目录只读权限。",
    recentlyUpdated: "最近更新",
    reapplyManually: "手动重新应用我的草稿",
    reloadServer: "重新加载服务器数据",
    replaceImage: "更换图片",
    replaceImageConfirm: "确认更换当前商品图片？",
    removeImage: "移除图片",
    removeImageConfirm: "确认移除当前商品图片？",
    rename: "重命名",
    replacementRequired: "归档仍被启用商品使用的项目之前，请先选择替代项。",
    requiredFields: "请填写必填字段。",
    restore: "恢复",
    restoreConfirm: "确认恢复此目录项目？",
    result: "结果",
    retailPrice: "零售价",
    retryableError: "服务器暂时不可用。表单内容已保留，请重试。",
    save: "保存",
    saved: "已保存",
    saving: "正在保存…",
    secondProductName: "第二名称",
    shopSuspended: "此门店已暂停。",
    summary: "摘要",
    surface: "来源",
    syncHistory: "同步历史",
    to: "结束",
    unavailable: "此操作当前不可用。",
    unsavedChanges: "你有未保存的目录更改。",
    viewArchived: "查看已归档",
  },
};

export function translate(key: TranslationKey, locale: LocaleKey = "zh-Hans"): string {
  return translations[locale][key];
}

export function translationsFor(locale: LocaleKey): Readonly<Record<TranslationKey, string>> {
  return translations[locale];
}
