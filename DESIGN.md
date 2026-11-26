---
name: Cotton Leaf
description: Camicie su misura e appuntamenti a domicilio a Roma.
colors:
  paper: "#f6f2e9"
  ink: "#28231f"
  muted: "#5d514a"
  wine: "#672a38"
  wine-dark: "#50202b"
  line: "#cbbeb0"
  sand: "#ebe3d7"
  white: "#fffaf1"
typography:
  display:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "4.25rem"
    fontWeight: 700
    lineHeight: 1.09
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
components:
  button-primary:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.white}"
    padding: "0.75rem 1.15rem"
  button-primary-hover:
    backgroundColor: "{colors.wine-dark}"
---

## Overview

Carta calda, DM Sans per titoli e testi e fotografie dei capi e dei tessuti in negozio. La prenotazione è l’azione principale.

L’Atlante estende questo sistema: conserva carta, prugna, wordmark e DM Sans. Colore e materia provengono dalle fotografie dei campioni reali; i controlli restano sobri per lasciare leggibili tessuto, collezione e codice.

## Layout

La prima schermata accosta una foto dei tessuti e l’invito a prenotare, adattando l’altezza allo spazio visibile. Su mobile l’invito precede la fotografia e i due pulsanti restano affiancati. La fascia prugna raccoglie i costi del servizio. La galleria presenta foto grandi, frecce e un indicatore di scorrimento. Ogni indirizzo ha un pulsante per aprire la mappa e un link alla scheda su Google Maps.

Nell’Atlante, una testata compatta e persistente precede titolo, breve orientamento e filtri. La parete di campioni è densa, senza riquadri decorativi, con collezione e codice sotto ogni immagine. La densità può essere regolata; sugli smartphone la vista iniziale usa due colonne. I campioni vengono aggiunti progressivamente durante lo scorrimento, con un pulsante alternativo; ricerca e filtri lavorano subito sull’intero catalogo. Il dettaglio affianca immagine e informazioni su desktop e li dispone in verticale sugli schermi piccoli. Le otto lingue condividono la struttura; l’arabo usa la direzione RTL e i codici mantengono la lettura da sinistra a destra.

## Components

Il pulsante pieno identifica WhatsApp. Telefono e pagamento usano pulsanti con bordo. I collegamenti testuali nelle sezioni sono sottolineati.

### Atlante dei tessuti

- **Ricerca e filtri:** campo per codice o collezione, selettori per collezione e fantasia, filtri colore con etichetta testuale, conteggio dei risultati e ripristino. La ricerca senza risultati mostra un’azione per tornare ai campioni.
- **Campione e dettaglio:** l’apertura espande il campione in un dialogo, mantenendo il riferimento visivo alla parete tramite View Transitions quando disponibili. La chiusura riporta il focus al campione di origine. Zoom, trascinamento dell’immagine ingrandita e vista del campione intero permettono di esaminare trama e fantasia; precedente e successivo seguono i risultati filtrati. La preferenza di movimento ridotto disattiva le animazioni.
- **Preferiti e confronto:** cuore e contatore identificano fino a 12 preferiti persistenti nel browser. Il confronto affianca fino a 4 tessuti; aggiunta e rimozione espongono lo stato selezionato. I limiti e l’eventuale indisponibilità della memoria locale ricevono un riscontro testuale.
- **Appuntamento:** il pulsante WhatsApp include collezione e codice dei tessuti scelti. L’avviso sui colori a schermo e la conferma della disponibilità accompagna il dettaglio e la selezione.
- **Accessibilità:** controlli con nomi espliciti, focus prugna visibile, dialoghi chiudibili con Escape e catalogo statico leggibile anche senza JavaScript. Il nome accessibile dei preferiti rimane disponibile quando l’etichetta visiva viene nascosta su smartphone.
