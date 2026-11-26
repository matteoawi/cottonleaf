# Cotton Leaf - Tre ulteriori cartelli con il sito

Versione campagna **1.1.0**, 26 novembre 2026. Tutte le proposte sono **verticali A4**.

1. **Atelier:** «La tua camicia. Comincia da qui.» Dettaglio sartoriale, fondo avorio.
2. **Roma:** «Ci trovi online. Veniamo da te.» Appuntamento per scelta tessuti in ufficio.
3. **Materia:** «Il tuo stile. Al tuo indirizzo.» Composizione di tessuti su fondo bordeaux.

Il QR apre **https://cottonleaf.it/**; non richiede servizi di QR a pagamento. Il dominio è anche scritto in grande su ogni cartello. La serie 1.0.0 rimane nella propria cartella.

## Consegna

- `cotton-leaf-tre-cartelli-sito-verticali-A4.pdf`: tre pagine A4, testi e marchio vettoriali.
- `cartello-N-NOME-A4.pdf`: ogni proposta singolarmente.
- `cartello-N-NOME-A4-300dpi.png`: 2480 × 3508 pixel, proporzioni A4. Impostare 210 × 297 mm nel software di stampa se necessario.
- `anteprima-N-NOME.png`: anteprime leggere.

PDF RGB senza abbondanza, da stampare A4 a dimensione effettiva; possono essere adattati ad A3 verticale. Per lavorazioni tipografiche CMYK con abbondanza, concordare profilo e formato con la tipografia.

## Brand, immagini e sorgenti

Marchio originale `assets/cotton-leaf.svg`, font DM Sans e palette `DESIGN.md`. Le tre nuove immagini sono create con **Imagegen integrato**, usando foto dei tessuti e campionario Cotton Leaf come riferimenti. Prompt completi: `prompts.json`. Immagini originali: `arte-*.png`. Impaginazione modificabile: `cartelli.html`.

Per riprodurre: `python build-qr.py` (libreria `qrcode`), `node render.mjs` (Playwright e Chrome), `python verify-qr.py` (OpenCV). Il renderer usa Playwright in `%LOCALAPPDATA%/Temp/cottonleaf-poster-tools/node_modules/playwright-core`; è configurabile con `COTTONLEAF_PLAYWRIGHT` e `COTTONLEAF_CHROME`.

Verifiche dei QR sui PNG e sulle anteprime: `qr-verification.json`. Verifiche dei limiti di impaginazione: `layout-verification.json`. Verifica del PDF e del sito: `print-verification.json`.

La versione del sito rimane 1.5.0 perché questa consegna riguarda solo i materiali stampa. La campagna ha versione e changelog propri.
