const express = require('express')
const app = express()

const https = require('https');
const fs = require('fs');

//Configurazione Certificato SSL

const options = {
    cert: fs.readFileSync('./certificate.crt'),
    key: fs.readFileSync('./private.key')
  };
  

// Express-Session utilizza i cookie per mantenere lo stato di sessione del client,
// ma memorizza i dati della sessione sul server
const session = require('express-session');
const constants = require("./configuration");
const {Client} = require('pg');
const bcrypt = require('bcrypt');
const flightsRetriever = require('./utils/flightsRetriever');

const passportSetup = require("./config/passport-setup")
const passport = require("passport")

const routesDir = '/views';


// middleware utilizzato per prendere i dati da form
app.use(express.urlencoded({extended: false}))


// middleware che serve i file statici contenuti all'interno della directory public
app.use(express.static("./"))
app.use(express.static("./views/"))

app.use(session({
    secret: 'il-mio-segreto-segretissimo',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 30 * 60 * 1000, rolling: true}//cookie settati a 30 minuti e rolling a true fara si che la durata della sessione sara sempre rinnovata ad ogni richiesta
}));

const cookieParser = require("cookie-parser")
app.use(cookieParser())

app.use(passport.initialize())
app.use(passport.session())

//gestione dell'interazione tra applicazione e database PostgreSQL
const connectionString = constants.connectionString;
const client = new Client({
    connectionString: connectionString
});
client.connect();

// Middleware per il controllo dell'autenticazione
const requireAuth = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {

        res.redirect('/logout');
    }
};

//CHATGPT

const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function runCompletion(prompt, maxTokens) {
  let response = "";

  try {
    while (true) {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: maxTokens,
      });

      const choiceText = completion.data.choices[0].text;
      response += choiceText;

      if (completion.data.choices[0].finish_reason === "stop") {
        break;
      }

      prompt = choiceText.trim(); // Utilizza la risposta come prompt per la prossima iterazione
      maxTokens -= completion.data.choices[0].tokens_used;
    }

    return response;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log("Hai finito le richieste possibili che puoi fare");
      await delay(3000); // Ritardo di 3 secondi prima di riprovare
      return await runCompletion(prompt, maxTokens); // Riprova la richiesta
    } else {
      console.error(error);
      return response; // Ritorna la risposta finora generata in caso di errore
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post("/message-processing", async (req, res) => {
  const message = req.body.message; // Analizza la richiesta
  console.log(message);

  const maxTokens = 1000; // Limite massimo di token per risposta

  const response = await runCompletion(message, maxTokens); // Elabora la risposta
  
  //salvo all'interno del DB le domande e le risposte 
  let email
  if(req.user || req.session.user){//se l'utente è loggato
    if(req.user){
        email = req.user.email;
    }
    else{
        email = req.session.user;
    }
    const query = 'INSERT INTO chat (email,domanda,risposta) VALUES ($1, $2, $3)';
    const values = [email, message, response];
    try {
        const resultQuery = await client.query(query, values);
        res.status(200)
    } catch (error) {
        return res.status(500).send('Error');
    }
  }

  res.send(response); // Invia la risposta
});


app.get("/chat",(req,res)=>{
    res.sendFile('chatgptPage.html', {root: __dirname + "/views/chatgptPage/"})
})

app.get("/get-chat",async (req,res)=>{
    
    if(req.user && req.session.user) return ;
    let email
    if(req.user){
        email = req.user.email
    }else {email = req.session.user}
    
    if(email != undefined){
        const query = 'SELECT * FROM chat WHERE email = $1';
        const values = [email];
        try {
            const resultQuery = await client.query(query, values);
            res.status(200)
            console.log(resultQuery.rows)
            return res.send(resultQuery.rows)
        } catch (error) {
            return res.status(500).send('Error');
        }
    }
    
})

//METODI GET
app.get("/", (req, res) => {
    //link per andare alla pagina del form
    res.sendFile(`.${routesDir}/homepage/homepage.html`, {root: __dirname});
});

app.get("/api/sign-in", (req, res) => {
    res.sendFile('signin.html', {root: __dirname + "/views/signin/"})
});
app.get("/api/sign-up", (req, res) => {
    res.sendFile('signup.html', {root: __dirname + "/views/signup/"})
});
app.get("/avvenuta-iscrizione", (req, res) => {
    res.sendFile('avvenuta_iscrizione.html', {root: __dirname + "/views/avvenuta_iscrizione/"})
})
app.get("/about-us",(req,res)=>{
    res.sendFile('aboutUs.html', {root: __dirname + "/views/aboutUs/"})
})

app.get("/flights", (req, res) => {
    res.sendFile(`.${routesDir}/flights/flights.html`, {root: __dirname});
});
app.get("/booking", (req, res) => {
    res.sendFile(`.${routesDir}/booking/booking.html`, {root: __dirname});
});
app.get("/tracker", (req, res) => {
    res.sendFile(`.${routesDir}/tracker/tracker.html`, {root: __dirname});
});
app.get("/profile", (req, res) => {
    res.sendFile('profilePage.html', {root: __dirname + "/views/profilePage/"})
})
app.get("/retrieveFlights", async (req, res) => {
    try {
        let flights = await flightsRetriever.retrieveFlights(req);
        res.send(flights);
    } catch (e) {
        res.sendStatus(400);
        res.send(e);
    }
});

app.get("/dashboard", (req, res) => {
    //link per andare alla pagina del form
    res.sendFile(`.${routesDir}/homepage/homepage.html`, {root: __dirname});
});


//endpoint che restituisce i biglietti prenotati dall'utente
app.get("/biglietti-prenotati", async (req, res) => {

    let email = null;
    let userIsIn = null;
    //utente si è loggato tramite email e password
    if (!req.user) {
        email = req.session.user
        userIsIn = "credenziali"
    } else { //utente si è loggato tramite Google OAuth2
        email = req.user.email
        userIsIn = "googleusers"
    }
//'SELECT id,biglietti.email,data,codicepartenza,codicearrivo,durata,orapartenza,oraarrivo,nomecompagnia,postonumero,cittapartenza,cittaarrivo,nome,cognome,username from biglietti JOIN ' + userIsIn + ' ON biglietti.email = ' + userIsIn + '.email WHERE biglietti.email = $1'
    const query = 'SELECT biglietti.id,biglietti.email,data,codicepartenza,codicearrivo,durata,orapartenza,oraarrivo,nomecompagnia,postonumero,cittapartenza,cittaarrivo,nome,cognome,username from biglietti JOIN ' + userIsIn + ' ON biglietti.email = ' + userIsIn + '.email WHERE biglietti.email = $1';
    const values = [email];
    try {
        const resultQuery = await client.query(query, values);
        res.status(200)
        console.log(resultQuery.rows)
        return res.send(resultQuery.rows)
    } catch (error) {
        return res.status(500).send('Error');
    }
})


//endpoint per gestire informazioni personali del profilo 
app.get("/get-personal-info", requireAuth, async (req, res) => {

    //utente si è loggato tramite email e password
    if (!req.user) {
        const email = req.session.user
        const query = 'SELECT nome,cognome,username from Credenziali WHERE email = $1';
        const values = [email];
        try {
            const resultQuery = await client.query(query, values);

            const nome = resultQuery.rows[0].nome
            const cognome = resultQuery.rows[0].cognome
            const username = resultQuery.rows[0].username
            console.log(req.session.user)
            res.status(200)
            return res.send({nome: nome, cognome: cognome, username: username, email: email})
        } catch (error) {
            return res.status(500).send('Error');
        }
    } else { //tente si è loggato tramite Google OAuth2
        return res.send({
            nome: req.user.nome,
            cognome: req.user.cognome,
            username: req.user.username,
            email: req.user.email
        })
    }
})


//eliminazione dati dalla tabella googleUsers in caso di accesso con google
app.get("/eliminazione-account-Google", requireAuth, async (req, res) => {
    if (req.user) {
        const query = 'DELETE FROM googleUsers WHERE email = $1'
        const values = [req.user.email]

        try {
            const resultQuery = await client.query(query, values)
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                } else {

                    return res.redirect("/logout")//#TODO        
                }
            });
        } catch (error) {
            return res.status(500).send('Cancellazione dati non è andata a buon fine');
        }
    }
})

//endpoint per gestione cancellazione account 
app.get("/eliminazione-account", requireAuth, async (req, res) => {
    const email = req.session.user
    const query = 'DELETE FROM Credenziali WHERE email = $1';
    const values = [email];
    try {
        const resultQuery = await client.query(query, values);

        req.session.destroy(err => {
            if (err) {
                console.log(err);
            } else {

                return res.redirect("/logout")//#TODO        
            }
        });

    } catch (error) {
        return res.status(500).send('Cancellazione account non è andata a buon fine');
    }
});

// Gestione del logout
app.get('/logout', (req, res) => {

    //to reset the right navbar when the client logged with google and press logout
    res.clearCookie("logged")
    res.clearCookie("nameUser");
    res.clearCookie("photoUser");

    //to clear session 
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/api/sign-in');
        }
    });
});


//METODI POST

//iscrizione

/*Codici di errore dell'iscrizione:
1000: email in formato scorretto
1001: violazione vincolo di chiave primaria (email)
1002: violazione vincolo di chiave (username)   
1003: password e conferma_password sono diverse
*/

app.post("/api/sign-up", (req, res) => {

    const {nome, cognome, username, email, password, conferma_password} = req.body

    if (password != conferma_password) {
        return res.send({code: 1003})
    }

    //controllo formato email
    const regex = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;
    console.log(!regex.test(email))
    if (!regex.test(email)) {
        return res.send({code: 1000})
    }

    if (password != conferma_password) {
        res.send("Le due password immesse non sono uguali. <a href=/api/sign-up>Clicca qui per tornare alla pagina di scrizione</a>'")
    } else {

        const saltRounds = 10;

        bcrypt.hash(password, saltRounds, function (err, hash) {
            const query = 'INSERT INTO Credenziali (nome,cognome,email, pass, username) VALUES ($1, $2, $3, $4, $5)';
            const values = [nome, cognome, email, hash, username];

            client.query(query, values, (err, result) => {
                if (err) {

                    if (err.constraint === 'credenziali_pkey') { // codice di errore per la violazione di un vincolo di primary key 
                        return res.send({code: 1001})
                    }
                    if (err.constraint === 'vincolo_username') {//vincolo dichiarato in questo modo nel DB
                        return res.send({code: 1002})
                    }
                } else {
                    req.session.loggedin = true;
                    req.session.user = email;//mi salvo la mail lato server in modo tale che 
                                             //un utente che si è appena iscritto possa vedere 
                                             //e fare tutto ciò che puo fare un utente gia iscritto (leggere informazioni personali nel profilo e tutto il resto)  
                    res.redirect("/")
                    res.status(200)
                }
            })

        });

    }
});


//CODICI DI ERRORE /api/sign-in
// "Error" -> errore
// "Success" --> login andato a buon fine 
app.post("/api/sign-in", (req, res) => {

    const {email, password} = req.body

    const query = 'SELECT pass, nome from Credenziali WHERE email = $1';
    const values = [email];


    client.query(query, values, (err, resultQuery) => {
        if (err) {
            resultQuery.status(500).send('Error');
        }

        if (resultQuery.rows[0] === undefined) return res.send({code: "Error"})

        bcrypt.compare(password, resultQuery.rows[0].pass, (err, result) => {
            if (err) {
                return res.status(500).send({code: "Error"});
            } else if (result == true) {
                res.cookie("logged", true)

                req.session.loggedin = true;//vado a CREARE il campo loggedin all'interno di req.session e lo setto a true
                req.session.user = email; //vado a CREARE il campo user all'interno di req.session e lo setto uguale alla mail

                //res.redirect("/dashboard")
                return res.send({code: "Success", username: resultQuery.rows[0].nome}).status(200)
            } else {
                return res.send({code: "Error"})
            }
        })
    })
});


//CODICI DI ERRORE 
// 1000 --> password e conferma_password diverse
// 1001 --> old_password errata
// success --> password aggiornata correttamente 

app.post("/reset-password", requireAuth, async (req, res) => {
    console.log(req.session)
    const email = req.session.user
    const {old_pass, new_pass, conf_new_pass} = req.body
    //gestione errore password diverse
    if (new_pass !== conf_new_pass) {
        return res.send({code: 1000}).status(200)
    }
    const query = 'SELECT pass from Credenziali WHERE email = $1';
    const values = [email];

    try {
        const resultQuery = await client.query(query, values);

        const result = await bcrypt.compare(old_pass, resultQuery.rows[0].pass);

        if (result === true) {
            const saltRounds = 10
            const new_pass_crypted = await bcrypt.hash(new_pass, saltRounds)
            const query1 = "UPDATE Credenziali SET pass = $1 WHERE email = $2";
            const values1 = [new_pass_crypted, email]
            const resultQuery1 = await client.query(query1, values1)
            res.send({code: "success"})
            res.status(200);
        } else {
            return res.send({code: 1001}).status(200);
        }

    } catch (error) {
        res.status(500).send('Error');
    }
})

//CODICI DI ERRORE
// success --> passato il controllo sulla password
// 1000 --> passwords are not equal
// 1001 --> wrong password after 
app.post("/cancellazione-account", requireAuth, async (req, res) => {

    const {pass, conf_pass} = req.body
    if (pass !== conf_pass) {
        return res.send({error_code: 1000}).status(200)
    } else {

        const email = req.session.user
        const query = 'SELECT pass from Credenziali WHERE email = $1';
        const values = [email];

        try {
            const resultQuery = await client.query(query, values);

            const result = await bcrypt.compare(pass, resultQuery.rows[0].pass);

            if (result === true) {
                return res.send({error_code: "success"}).status(200)

            } else {
                return res.send({error_code: 1001}).status(200);
            }

        } catch (error) {
            res.status(500).send('Error');
        }
    }
})


//auth with google
app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"] // the user have to puts the profile informations
}));

//callback route for google to redirect to 
//we have to puts passport middleware also hero to exchange code in the url for profile information
app.get("/auth/google/redirect", passport.authenticate("google"), (req, res) => {

    req.session.loggedin = true;//settato per accesso alle pagine protette

    //res.send(req.user)// ci sarà l'id restituitoci da google
    res.cookie("logged", true)
    res.cookie("nameUser", req.user.name.givenName)//utilizzo dei cookie per inviare informazioni dal server al client
    res.cookie("photoUser", req.user.photos[0].value)

    res.redirect("/")
})


app.post('/save-ticket', (req, res) => {
    let flight = req.body;
    console.log(flight)

    let email = req.session.user ? req.session.user : req.user.email
    const query = 'INSERT INTO Biglietti (id, email, data, codicePartenza, codiceArrivo, durata, oraPartenza, oraArrivo, nomeCompagnia, postoNumero, cittapartenza, cittaarrivo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)';
    const values = [Date.now(), email, flight.date, flight.depCode, flight.arrCode, flight.duration, flight.depTime, flight.arrTime, flight.airlineName, flight.seat, flight.depCity, flight.arrCity];

    client.query(query, values, (err, result) => {
        if (err) {
            res.status(400);
            res.send(err);
        } else {
            res.status(200);
            res.send('success');
        }
    })
})

//middleware che in caso di utente non loggato con google lo redirecta sulla pagina di login
const authCheck = (req, res, next) => {
    if (!req.user) {//if user is not logged in
        res.redirect("/sign-in");
    } else {
        next();
    }
}
/*
app.listen(3000,()=>{
    console.log("Server http avviato sulla porta 3000")
})
*/
const server = https.createServer(options, app);

server.listen(3000, () => {
  console.log('Server HTTPS avviato sulla porta 3000');
});
  