# Atlante dei tessuti

L’Atlante è una superficie statica del sito Cotton Leaf, introdotta nella versione 1.6.0. L’ingresso italiano è `tessuti/index.html`; inglese, arabo, cinese semplificato, francese, spagnolo, tedesco e bengalese hanno la stessa pagina sotto il rispettivo prefisso di lingua. Il changelog pubblico descrive questa versione in tutte le otto lingue.

## Sorgenti e generazione

`build-atlas.mjs` genera il markup da `fabrics.json`, dai testi di `atlas-i18n.json` e dalle definizioni delle lingue di `translations.json`. `atlas.css` contiene gli stili della superficie e `atlas.js` aggiunge filtri, dettaglio, selezione e confronto. Tutti i riferimenti sono subito disponibili per ricerca e filtri. Con JavaScript la parete monta 24 campioni alla volta, aggiungendone altri durante lo scorrimento o con il pulsante dedicato; i campioni successivi vengono creati dai dati solo quando servono, mentre i nodi già visitati possono essere conservati in un template inerte. Senza JavaScript il catalogo completo rimane leggibile grazie al markup noscript.

Dalla radice del repository eseguire:

```powershell
node build-languages.mjs
```

Il comando rigenera home, changelog e Atlante nelle otto lingue e aggiorna `sitemap.xml`, inclusi gli URL dell’Atlante. Versione e data di rilascio derivano da `VERSION` e dal primo rilascio in `changelog.html`; non modificare a mano gli HTML localizzati generati. Per un aggiornamento, mantenere coerenti versione, testi e changelog prima di rigenerare.

## Provenienza delle immagini

Il PDF fornito, `20261106174551.pdf`, contiene 50 pagine di scansioni. I 373 riferimenti stampati corrispondono a 351 coppie uniche di collezione e codice; i duplicati confluiscono nello stesso tessuto mantenendo le rispettive fonti.

`assets/tessuti/` contiene 702 WebP: due varianti per tessuto, con suffissi `-320.webp` e `-960.webp`. Sono ritagli delle scansioni originali, senza generazione di immagini di tessuti. Le anteprime `-320.webp` ritagliano la porzione centrale nel formato della parete e vengono caricate progressivamente; le versioni `-960.webp` mantengono l’intera larghezza del ritaglio e si caricano quando si apre un dettaglio o una selezione. La parete usa `content-visibility` per rimandare il lavoro sui campioni fuori schermo. I colori a schermo restano indicativi: il sito richiede di confermare insieme disponibilità e dettagli prima dell’ordine.

- `catalog-provenance.json` registra nome e SHA-256 del PDF, metodo, numero di pagine, conteggi e gruppi di estrazione.
- `fabrics.json` registra identificatore, collezione, codice, classificazioni, dimensioni e fonti di ogni tessuto. Ogni voce `sources` conserva pagina, colonna, rettangolo di ritaglio e codice/prefisso stampati.
- `catalog-materials.json` riporta le composizioni verificate nelle etichette tecniche originali e la pagina di riferimento. Il dettaglio traduce cotone, lino, elastan e poliammide; XLA mantiene la sigla del catalogo. Dove il dato non è verificato la composizione non viene indicata. Le mischie includono, per esempio, Prince Plus 96% CO / 4% EA, Ios 55% LI / 45% CO e Miami Stretch 50 75% CO / 22% PA / 3% EA.

Il PDF originale, le scansioni estratte, i risultati OCR e le tavole di controllo sono materiali di lavorazione e vanno conservati in una cartella temporanea esterna al repository. Il PDF non viene pubblicato.

## Preparazione del catalogo

La pipeline richiede Python con `pymupdf`, `Pillow`, `numpy` e `opencv-python`. L’OCR usa Windows PowerShell con Windows Runtime e il motore OCR per `en-US` disponibile nel sistema. La preparazione e l’estrazione sono specifiche delle impaginazioni e delle coordinate del PDF corrente; un PDF diverso richiede un controllo e un aggiornamento del manifesto di estrazione.

Esempio con percorsi assoluti per il PDF e la cartella di lavoro esterna:

```powershell
$catalogSource = 'C:\percorso-esterno\20261106174551.pdf'
$catalogWork = Join-Path $env:LOCALAPPDATA 'Temp\cottonleaf-catalog'
python scripts/prepare-catalog.py $catalogSource $catalogWork
python scripts/prepare-labels.py $catalogWork
powershell.exe -NoProfile -NonInteractive -File scripts/ocr-catalog.ps1 -ImageDirectory $catalogWork
powershell.exe -NoProfile -NonInteractive -File scripts/ocr-catalog.ps1 -ImageDirectory (Join-Path $catalogWork 'labels')
python scripts/extract-catalog.py $catalogWork
node build-languages.mjs
```

1. `prepare-catalog.py` estrae la scansione originale di ogni pagina, produce anteprime PNG per l’OCR e tavole di controllo, e scrive `source.json` con l’hash del PDF.
2. `prepare-labels.py` ritaglia strisce delle etichette alla risoluzione originale, adattandole al limite del motore OCR e conservando le coordinate in `labels/metadata.json`.
3. `ocr-catalog.ps1` produce i file `.ocr.json` con testo e coordinate. Salta i risultati già presenti: dopo una variazione delle immagini sorgente occorre rigenerare i corrispondenti risultati OCR.
4. `extract-catalog.py` usa il manifesto di gruppi e codici verificato sulle pagine e sulle strisce, individua i ritagli, accorpa i duplicati e scrive WebP, `fabrics.json` e `catalog-provenance.json`. Produce inoltre tavole `extracted-*.jpg` nella cartella esterna per il controllo visivo.

L’OCR aiuta la verifica dei codici; l’estrattore usa il manifesto esplicito nello script, non importa automaticamente i risultati OCR. Prima di pubblicare nuove estrazioni, controllare codici, ritagli e duplicati sulle tavole e sul PDF.

## Comportamento da preservare

Ricerca per codice o collezione e filtri combinabili per collezione, fantasia e colore riducono la parete; il ripristino recupera il catalogo completo. Il dettaglio offre zoom, trascinamento, vista intera e navigazione fra i risultati, oltre a un collegamento diretto tramite hash.

I preferiti arrivano a 12 e usano `localStorage` con chiave `cottonleaf-fabrics-v1`. Se la memoria non è accessibile, la selezione resta nella sessione e viene mostrato un avviso. Il confronto ammette al massimo 4 campioni e resta in memoria per la sessione. WhatsApp include collezione e codice della selezione per concordare un appuntamento a Roma.

La vista smartphone iniziale ha due colonne. L’arabo usa RTL; i codici rimangono LTR. Escape chiude i dialoghi, il focus torna al riferimento di origine e le animazioni rispettano `prefers-reduced-motion`.

## Verifica locale

I controlli richiedono Node.js e un eseguibile Chrome. Non serve avviare manualmente un server: entrambi gli script ne aprono uno locale su una porta libera, eseguono Chrome senza interfaccia e lo chiudono al termine.

```powershell
node scripts/verify-atlas.mjs
node scripts/measure-atlas.mjs
```

| Configurazione | Uso e valore predefinito |
| --- | --- |
| `COTTONLEAF_CHROME` | Percorso dell’eseguibile Chrome per entrambi i controlli. Predefinito: `C:/Program Files/Google/Chrome/Application/chrome.exe`. |
| `COTTONLEAF_PLAYWRIGHT` | Percorso o nome di modulo risolvibile con `require` per `playwright-core`, usato da `verify-atlas.mjs`. Predefinito: `%LOCALAPPDATA%/Temp/cottonleaf-poster-tools/node_modules/playwright-core`. |
| `COTTONLEAF_QA_MODULES` | Directory `node_modules` usata da `measure-atlas.mjs`; deve contenere `playwright-core`, `@axe-core/playwright`, `lighthouse` e `chrome-launcher`. Predefinito: `%LOCALAPPDATA%/Temp/cottonleaf-poster-tools/node_modules`. |

`verify-atlas.mjs` controlla conteggio dei campioni, ricerca e filtri, dettaglio e zoom, preferiti dopo ricaricamento, confronto e rimozione con focus, riferimenti WhatsApp, collegamenti diretti, lingue e metadati, responsive e RTL, selezione automatica della lingua, memoria bloccata, uso senza JavaScript e risorse mancanti. Salva screenshot e `verification.json` sotto `.impeccable/review/atlas/`.

`measure-atlas.mjs` esegue axe sul formato mobile e Lighthouse sulla build locale. Scrive `accessibility.json`, `lighthouse.json`, `lighthouse.html` e `performance-summary.json` nella stessa cartella. Questi report descrivono la build locale e non costituiscono una misurazione PageSpeed del sito pubblicato. La verifica funzionale finale supera 66 controlli e la revisione finale ha esito ship. L’audit axe non ha rilevato violazioni automatiche; il controllo del contrasto delle immagini conserva casi incomplete. I punteggi di prestazione locali hanno mostrato forte variabilità durante il carico della macchina e non vengono dichiarati come prestazioni di produzione.

La cartella `.impeccable/` è esclusa da Git: contratti di superficie, screenshot e report di sviluppo restano fuori dal sito pubblico. La pubblicazione GitHub Pages conserva il file `.nojekyll` già presente. `DESIGN.md` documenta l’estensione del sistema esistente; l’Atlante non introduce una nuova identità visiva.
