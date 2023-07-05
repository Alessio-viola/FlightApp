const express = require('express')
const app = express()

const https = require('https');
const fs = require('fs');

//Configurazione Certificato SSL AUTOFIRMATO

const options = {
    cert: fs.readFileSync('./certificate.crt'),
    key: fs.readFileSync('./private.key')
  };
  
// Express-Session utilizza i cookie per mantenere lo stato di sessione del client,
// ma memorizza i dati della sessione sul server
const session = require('express-session');

//setup di passport per oauth2.0 GoogleStrategy
const passportSetup = require("./config/passport-setup")
const passport = require("passport")

const routesDir = '/views';

// middleware utilizzato per prendere i dati da form
app.use(express.urlencoded({extended: false}))

//import dei middleware 
const {requireAuth} = require("./middleware")

// middleware che serve i file statici contenuti all'interno della directory public
app.use(express.static("./"))
app.use(express.static("./views/"))

//middleware di sessione  
app.use(session({
    secret: 'il-mio-segreto-segretissimo',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 30 * 60 * 1000, rolling: true}//cookie settati a 30 minuti e rolling a true fara si che la durata della sessione sara sempre rinnovata ad ogni richiesta
}));

const cookieParser = require("cookie-parser")
app.use(cookieParser())

//inizializzazione di passport
app.use(passport.initialize())
app.use(passport.session())


//ROUTES
app.get("/", (req, res) => {
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

app.get("/booking",requireAuth ,(req, res) => {
    res.sendFile(`.${routesDir}/booking/booking.html`, {root: __dirname});
});

app.get("/tracker", (req, res) => {
    res.sendFile(`.${routesDir}/tracker/tracker.html`, {root: __dirname});
});

app.get("/profile",requireAuth ,(req, res) => {
    res.sendFile('profilePage.html', {root: __dirname + "/views/profilePage/"})
})

app.get("/dashboard", (req, res) => {
    res.sendFile(`.${routesDir}/homepage/homepage.html`, {root: __dirname});
});


// Gestione del logout
app.get('/logout', (req, res) => {

    //to reset the right navbar when the client logged with google and press logout
    res.clearCookie("logged")
    res.clearCookie("nameUser");
    res.clearCookie("photoUser");
    res.clearCookie("prime")

    //to clear session 
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/api/sign-in');
        }
    });
});

//IMPORT DEI CONTROLLERS DELLE PAGINE 
const chatgptController = require('./controllers/chatgptController');
app.use('/', chatgptController);

const flightsController = require('./controllers/flightsController');
app.use('/', flightsController);

const signupController = require('./controllers/signupController');
app.use('/', signupController);

const signinController = require('./controllers/signinController');
app.use('/', signinController);

const profileController = require('./controllers/profilepageController');
app.use('/', profileController);

const bookingController = require('./controllers/bookingController');
app.use('/', bookingController);

const trackerController = require('./controllers/trackerController')
app.use('/api',trackerController);


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

/*
app.listen(3000,()=>{
    console.log("Server http avviato sulla porta 3000")
})
*/

const server = https.createServer(options, app);

server.listen(3000, () => {
  console.log('Server HTTPS avviato sulla porta 3000');
});
  