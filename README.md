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
      nomepaginaController per ogni pagina che interagisce con il server 
 
 - bootstrap
 
 - assets (risorse ausiliarie)
    - images
    - fonts
    - datasets
 
 - index.js (file server principale)
 - global.css
 - configuration.js (file di configurazione con il DB postgreSQL)
 - .env (file in cui inserire API KEYS)
 - tests (in questa cartella saranno presenti i vari test delle user stories)
   - nomeUserStoryDaTestare
     unit.test.js
     integration.test.js
     acceptance.test.js
     
</pre>

## TIPOLOGIE DI UTENTI
-utenti non autenticati 
<br/><br/>
-utenti autenticati
<br/><br/>
-utenti autenticati prime 
<br/><br/>
## Schermate
#### Login e registratazione
- Login: campi email, password per login con campo "Hai dimenticato la password"<br/>
- Registrazione: campi nome, cognome, username, email, password, conferma password per registrazione<br/>
<br/><br/>

#### Schermata principale
- Form con inserimento dati relativi al volo da cercare

#### Schermata profilo
Funzionalità:
- Modifica valori di registrazione
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

#### Live tracker Voli 
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


## AviationStack API e Amadeus API
Nel contesto delle richieste alle API esterne, il server agisce come un proxy che inoltra le richieste del client all'API esterna, gestendo l'autenticazione, la protezione delle chiavi API, la manipolazione dei dati e altre operazioni necessarie. Il server funge da intermediario per controllare e gestire il flusso delle richieste e delle risposte tra il client e l'API esterna.

L'utilizzo di un API proxy o gateway consente di aggiungere uno strato di sicurezza e personalizzazione tra il client e le API esterne, fornendo un controllo più granulare sulle richieste, la gestione delle autorizzazioni e la manipolazione dei dati.

L'obbiettivo è eliminare le richieste cross-origin dal punto di vista del browser. (in modo tale che non vengano applicate le restrizioni CORS imposte dal browser)

## Tests
Per lanciare i tests:
-se si utilizza una versione specifica di nodejs con nvm , i test si lanciano con il seguente comando: 
  nvm exec <versione_node> mocha tests/signup.test.js  
  nel mio caso: nvm exec stable mocha tests/signup.test.js 
-se non si utilizza utilizza un Manager di versioni , allora il comando deve essere:
  mocha tests/signup.js (Per utilizzare mocha tuttavia si deve avere almeno la versione 14.y.z di nodejs)
  