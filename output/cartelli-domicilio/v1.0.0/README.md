# Cotton Leaf - Tre cartelli per il servizio a domicilio

Versione della campagna: **1.0.0**, 26 novembre 2026.

1. **Editoriale:** fondo avorio, campioni di cotone e invito «Il su misura, dove vuoi tu».
2. **Sartoriale:** fondo bordeaux, camicia bianca e invito «Veniamo noi da te».
3. **Domicilio:** fotografia illustrativa di una visita, con campionario e presa misure.

## File per la stampa

- `cotton-leaf-tre-cartelli-A4.pdf`: tre pagine A4, una per proposta, con testi e logo vettoriali.
- `cartello-N-NOME-A4.pdf`: ogni proposta singolarmente.
- `cartello-N-NOME-A4-300dpi.png`: immagini 2480 × 3508 pixel. Se il programma non legge la densità, impostare manualmente 210 × 297 mm.
- `anteprima-N-NOME.png`: anteprime leggere per scegliere e condividere.

I PDF sono RGB senza abbondanza: usare «dimensioni effettive» per A4 oppure «adatta» per A3. Per una tipografia che richiede CMYK e abbondanza, concordare il profilo e il formato di consegna prima della conversione.

## Brand e immagini

Marchio originale `assets/cotton-leaf.svg`, DM Sans locale e palette `DESIGN.md`. Le tre fotografie illustrative sono create con lo strumento integrato **Imagegen**, con foto dei tessuti Cotton Leaf e il campionario del sito come riferimenti. I prompt completi sono conservati in `prompts.json`; gli originali in `arte-*.png`.

## QR realmente utilizzabile

Il codice è generato con libreria QR, indipendentemente dalla generazione creativa, in nero su bianco con quattro moduli liberi per lato e correzione errori Q. Porta al numero WhatsApp **+39 345 235 7524** e prepara il messaggio «Ciao Cotton Leaf, vorrei prenotare una visita gratuita a domicilio a Roma.». Non invia il messaggio automaticamente e non dipende da servizi di QR a pagamento. Il collegamento completo è in `qr-destination.json`.

La verifica automatica delle immagini finali è registrata in `qr-verification.json`; i controlli di impaginazione in `layout-verification.json`. Anche tutte e tre le pagine PDF, rasterizzate con Poppler, sono state decodificate con successo; il collegamento restituisce il reindirizzamento WhatsApp al numero corretto (`print-verification.json`).

## Riproduzione

Eseguire `python build-qr.py` (richiede `qrcode`) e `node render.mjs` (richiede Playwright e Chrome). Il renderer usa una copia già installata in `%LOCALAPPDATA%/Temp/cottonleaf-poster-tools/node_modules/playwright-core`, sostituibile con `COTTONLEAF_PLAYWRIGHT`; il percorso Chrome è sostituibile con `COTTONLEAF_CHROME`. Sorgente modificabile: `cartelli.html`. Eseguire `python verify-qr.py` (richiede OpenCV) per ripetere le verifiche sui PNG.

Questa è una consegna di materiali stampa. La versione del sito rimane 1.5.0: nessuna funzionalità dello storefront è stata cambiata.
