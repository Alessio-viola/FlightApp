## Struttura progetto
<pre>
 - models 
 - views (interfaccia lato client)
      -nome_pagina.ejs(in caso di utilizzo di template)
      Altrimenti:
      - nome_pagina (cartella per ogni pagina)
        - nome_pagina.html
        - nome_pagina.js
        - nome_pagina.css
 - controllers
 - utils (files .js che svolgono funzionalità richieste da intera app)
 - bootstrap
 - assets (risorse ausiliarie)
    - images
    - fonts
 - index.js
 - global.css
 - configuration.js
 - test (in questa cartella saranno presenti i vari test delle user stories)
</pre>

## Schermate
#### Login e registratazione
- Login: campi email, password per login<br/>
- Registrazione: campi nome, cognome, username, email, password, conferma password per registrazione<br/>

Opzionali: aggiungere "Ricordami" e "Hai dimenticato la password"
<br/><br/>

#### Schermata principale
- Utente non registrato
- Utente registrato

#### Schermata profilo
Funzionalità:
- Modifica valori di registrazione?
- Visualizzare Voli prenotati e biglietti (con distinzione tra futuri e passati)
  <br/><br/>

#### Schermata per selezionare voli
Mostra barra con le date selezionabili intorno alla data inserita dalla schermata precedente. Per la data e per la tratta selezionate mostra tutti i voli disponibili (anche quelli con 0 posti che però non sono selezionabili).<br/>
Da questa schermata si possono modificare anche tratta e orario

- Scheda Volo:<br/>
Contiene Tratta, tappe, orario, durata, posti disponibili e prezzo e compagnia.<br/>
  Scheda espandibile che se non selezionata mostra determinate info, se selezionata mostra anche info aggiuntive.
  <br/><br/>

#### Schermata per prenotare volo
Si arriva da schermata per selezionare voli. Riepilogo di tutte le informazioni sul volo selezionato. Possibilità di scegliere il posto da una mappa della cabina (altrimenti scelta casuale). Pulsante di conferma di prenotazione.<br/>
Dopo la conferma un popup avvisa dell'avvenuta prenotazione ed è possibile visualizzare il volo dal profilo. Possibilità di tornare alla selezione di voli, schermata iniziale oppure al profilo.
<br/><br/>

#### Schermate comuni
- Loading
- Errore generico da compilare con informazioni specifiche in base al caso
  <br/><br/>

#### Live tracker Voli ?
Schermata che permette di inserire ID di un volo e trovarlo sulla mappa. Inoltre viene mostrato quanto è stato volato e quanto manca con un arco che collega due pallini (partenza e destinazione) e, in base alla proporzione della distanza percorsa sul totale, l'aereo si trova in un determinato punto dell'arco.
<br/><br/>

#### Dataset relativi ad aeroporti, compagnie aeree, tratte e tipi Aeroplani
https://github.com/massimilianobaldo-university/ProjectDB/tree/main/csv/new
<br/><br/>

#### API voli
Traking: https://developer.laminardata.aero/documentation/flightdata#!/Flights32By32Airline32and32Flight32Number/get_airlines_airline_prefix_flights_flight_number
Deals: https://developers.amadeus.com/self-service/category/air/api-doc/flight-offers-search/api-reference
<br/><br/>

# Design

### Sito Icone:

https://www.streamlinehq.com/icons/streamline-mini-line

### Airplane
https://codepen.io/priteshchandra/pen/voZdgq

### Design Reference (Flat Design)

https://designmodo.github.io/Flat-UI/

### Colori

- Primary: ![#2ECC71](https://placehold.co/30x30/2ECC71/2ECC71.png) `#2ECC71`
- Primary Light: ![#FFFFFF](https://placehold.co/30x30/FFFFFF/FFFFFF.png) `#FFFFFF`
- Secondary: ![#9BE8BB](https://placehold.co/30x30/9BE8BB/9BE8BB.png) `#9BE8BB`
- Tertiary: ![#08605F](https://placehold.co/30x30/08605F/08605F.png) `#08605F`
- Tertiary Contrast: ![#177E89](https://placehold.co/30x30/177E89/177E89.png) `#177E89`
- Tertiary (Alternative): ![#7C77B9](https://placehold.co/30x30/7C77B9/7C77B9.png) `#7C77B9`
- Tertiary Contrast (Alternative): ![#1D8A99](https://placehold.co/30x30/1D8A99/1D8A99.png) `#1D8A99`

### Font (Lato)
https://fonts.google.com/specimen/Lato


-aggiungere roba del bagaglio a mano/stiva nella schermata della prenotazione del volo
-aggiungere la casella quando clicchi sul bottone dell'aereo, aggiunegere visule posto con hover o con onclick(vedi esempio edreams)
-rimuovere tutti gli aeroporti con \N
-aggiungere funzionalità modifica
-impostare numero minimo 1 di adulti
-vedere quanto è complicato aggiungere funzionalità hotel e alloggi

-aggiungere nelle user stories biglietti acquistati, tracker e cancellazione dati, logout, cambia passw, chat

### AviationStack API per funzionalità tracker

Visto che il piano free dell'API non offre connessione https per le richieste e visto che noi utiliziamo https, dobbiamo disabilitare l'opzione mixed content del browser.

Su Firefox bisogna fare ciò: 
-Apri Firefox e digita "about:config" nella barra degli indirizzi.
-Cerca l'opzione security.mixed_content.block_display_content e security.mixed_content.block_active_content.
-Imposta entrambe le opzioni su false facendo doppio clic su di esse.

Su Chrome invece:
-Apri Chrome e digita chrome://flags nella barra degli indirizzi.
-Cerca l'opzione "Insecure origins treated as secure" (Origini non sicure trattate come sicure).
-Abilita questa opzione facendo clic sul menu a discesa e selezionando "Enable" (Abilita).
-Riavvia Chrome per applicare le modifiche.