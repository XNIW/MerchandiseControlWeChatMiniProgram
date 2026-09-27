# WECHAT-010 — Normalizzazione JPEG locale

## Causa osservata e perimetro

La preview autentica DevTools2.02.2609232/base3.17.0 del27settembre2026 mostra
main63760byte e thumb12848byte. Entrambi contengono un APP2 di lunghezza472,
ICC_PROFILE con sequenza1/1 e profilo456byte. La versione precedentemente inviata
resta failed/jpeg_metadata_forbidden, cleanup pending; nessun upload PASS implicito.
La diagnosi termina con Cancel reale; SELECT01:25UTC conferma1intento/1versione,
nessuna nuova scrittura e nessuna primaria. Il primo tentativo diagnostico rimasto
in attesa e quello successivo sono stati annullati con Back/ricompilazione; non
sono prove di successo e la causa di quell'attesa non è attribuita al prodotto.

Si rimuove esclusivamente il singolo profilo sRGB byte-identico verificato.
Nessuna conversione implicita di profili sconosciuti: EXIF, Adobe, COM, altri ICC,
profili multisegmento/duplicati, JPEG troncati e metadati fra scansioni inattesi
falliscono prima dell'intento. Il controllo copre tutte le scansioni progressive;
FF00, restart, tabelle e dati compressi restano invariati. L'output nativo deve già
avere orientation=up; per rimuovere questo ICC RGB sono necessari SOF0/SOF2,
8bit e3componenti. Il validator Admin resta identico e autoritativo.

## Provenienza del profilo colore

SHA256 del profilo completo:
`12afb4d9953adee0607d347daee5b78b18d6b3cab2d572b88970703f5edb37bc`.

Il reviewer ha ricostruito il formato dai sorgenti primari, confrontando tutti456
byte con la cattura; non ha compilato Skia. La verifica non si basa sulla semplice
etichetta sRGB. Fonti pinned:

- [Skia serializer ICC](https://skia.googlesource.com/skia/+/4609099110c3ea6a6e09866432fd4166eef71ab3/src/encode/SkICC.cpp).
- [Skia transfer function e matrice sRGB](https://skia.googlesource.com/skia/+/106aa4818739edf602a6738821435726c5b74a96/include/core/SkColorSpace.h).
- [Tencent API typings ufficiali](https://github.com/wechat-miniprogram/api-typings/blob/master/types/wx/lib.wx.api.d.ts), anche verificati nella dipendenza locale5.2.3: writeFile ArrayBuffer, unlink, readdir e saveFile per file temporanei.

Ricostruzione: header128byte ICCv4.3 mntr/RGB/XYZ,2016-01-01,intent1,D50
[f6d6,10000,d32d];9tag. Colonne XYZ r=[6fa2,38f5,0390],g=[6299,b785,18da],
b=[24a0,0f84,b6cf]. Curva parametrica type4 G,A,B,C,D,E,F=
[26666,f2a7,d59,13d0,a5b,0,0]. Offset/size:desc240/36,rXYZ276/20,gXYZ296/20,
bXYZ316/20,wtpt336/20,TRC356/40 condiviso,cprt396/60. MLUC enUS UTF16BE:
sRGB e Google Inc.2016. Sono dati di colore, senza identificatori utente.

## File, conferma e recupero

Le copie pulite usano una namespace propria e nomi casuali128bit sotto
USER_DATA_PATH. Hash SHA256, dimensioni e byte sono riletti dalla copia prima
dell'anteprima; main pulita alimenta la thumbnail, normalizzata a sua volta.
La conferma adotta gli stessi file persistenti. Per i vecchi temporanei continua
il saveFile nativo; non si tenta saveFile sui nuovi user files.

Candidati scartati, annullamenti e fallimenti ripuliscono solo le copie possedute.
Il journal acquisisce i due file prima del successivo controllo sessione; indice
prima del journal, conservazione su write/read incerto. Gli intenti già confermati
non vengono normalizzati né cambiano payload/idempotency. Un errore I/O di
reidratazione conserva file e journal e ferma l'operazione.

Lo sweep condiviso viene atteso una volta prima delle nuove preparazioni: enumera
i journal di tutti gli account, anche senza indice, e conserva ogni riferimento.
Un errore transitorio dello sweep è tipizzato e una nuova selezione esplicita
può ripeterlo; il successo resta condiviso. Qualunque journal illeggibile/malformato
sospende lo sweep. Si eliminano solo i
basename esatti della namespace, mai file originali o temporanei gestiti da WeChat.

## Verifiche e limiti

Regressioni con JPEG baseline/progressive generati localmente: bytes fuori APP2
identici, differenza474byte, profili alterati e metadata duplicati respinti,
troncamenti, FF00/restart, conferma/cancel/logout, candidato scartato, scrittura
parziale/quota, journal applicato con errore, read incerto, restart senza indice,
GC sospeso e PUT degli stessi byte riletti.

Validator Admin invariato SHA256
`6d4a52658d0e06716e69232b05146352d960e4b248fdc87ad542e4b3bf14b4fa`:
prova locale01:36UTC su entrambi i JPEG: input con ICC rifiutato
jpeg_metadata_forbidden; output normalizzato accettato24×18 e identico al JPEG
originale. Non sostituisce l'upload autentico. Attesi dalla cattura nativa
main63286byte/thumb12374byte, da verificare nel nuovo runtime.

Profili diversi restano non supportati; nessuna attestazione su telefoni fisici,
nessuna modifica al server, nessuna attenuazione del controllo metadati.

## Ricevuta di integrazione

PR32 integrata normalmente01:48:22UTC, head16a6d80/mergef070a5a, due review finali
APPROVED su patchd071d6a7.178test locali e CI head36286588193/main36286645051 PASS.
Build TEST01:49UTC: solo quattro moduli immagine modificati, configurazione e
altri file byte-identici; manifest del runner529dd790 verificato. Ricompilazione
DevTools/upload autentico ancora NOT_RUN_OS_LOCKED; nessun telefono validato.
