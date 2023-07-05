const express = require('express');
const router = express.Router();

const { Client } = require('pg');
const constants = require('./../configuration');

const connectionString = constants.connectionString;
const client = new Client({
  connectionString: connectionString
});
client.connect();

const bcrypt = require('bcrypt');// to hash passwords

//importazione dei modelli
const ticketModel = require("./../models/Ticket") 
const userModel = require("./../models/User")

const {requireAuth, requirePrimeAuth} = require("./../middleware")

//endpoint che restituisce i biglietti prenotati dall'utente
router.get("/biglietti-prenotati",requireAuth ,async (req, res) => {

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

    const result = await ticketModel.getTickets(email,userIsIn)

    return res.send(result)
})


//endpoint per gestire informazioni personali del profilo 
router.get("/get-personal-info", requireAuth, async (req, res) => {

    //utente si è loggato tramite email e password
    if (!req.user) {
        const email = req.session.user
        
        const informations = await userModel.getPersonalInfo(email)
        
        res.status(200)
        
        return res.send({
            nome: informations.nome,
            cognome: informations.cognome, 
            username: informations.username, 
            email: email
        })

    } else { //utente si è loggato tramite Google OAuth2
        console.log(req.user)
        return res.send({
            nome: req.user.nome,
            cognome: req.user.cognome,
            username: req.user.username,
            email: req.user.email
        })
    }
})


//eliminazione dati dalla tabella googleUsers in caso di accesso con google
router.get("/eliminazione-account-Google", requireAuth, async (req, res) => {
    if (req.user) {

        await userModel.deleteGoogleUser(req.user.email);

        //distruggi la sessione con il server
        req.session.destroy(err => {
            if (err) {
                console.log(err);
            } else {

                return res.redirect("/logout")        
            }
        });
    }
})

//endpoint per gestione cancellazione account 
router.get("/eliminazione-account", requireAuth, async (req, res) => {
    const email = req.session.user

    await userModel.deleteUser(email);

    //distruggi la sessione con il server
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {

            return res.redirect("/logout")        
        }
    });
});

//CODICI DI ERRORE 
// 1000 --> password e conferma_password diverse
// 1001 --> old_password errata
// success --> password aggiornata correttamente 

router.post("/reset-password", requireAuth, async (req, res) => {
    
    const email = req.session.user
    const {old_pass, new_pass, conf_new_pass} = req.body
    
    //gestione errore password diverse
    if (new_pass !== conf_new_pass) {
        return res.send({code: 1000}).status(200)
    }

    const hashedpass = await userModel.getHashedPassword(email)

    const result = await bcrypt.compare(old_pass, hashedpass);

    if (result === true) {
    
        const saltRounds = 10
        const new_pass_crypted = await bcrypt.hash(new_pass, saltRounds)
    
        await userModel.updatePassword(email,new_pass_crypted) //update password
        
        res.send({code: "success"}).status(200)
    } else {
        
        return res.send({code: 1001}).status(200);
    
    }

})

//CODICI DI ERRORE
// success --> passato il controllo sulla password
// 1000 --> passwords are not equal
// 1001 --> wrong password after 
router.post("/cancellazione-account", requireAuth, async (req, res) => {

    const {pass, conf_pass} = req.body
    
    if (pass !== conf_pass) {
        return res.send({error_code: 1000}).status(200)
    } else {

        try {

            const hashedPassword = await userModel.getHashedPassword(req.session.user);

            const result = await bcrypt.compare(pass, hashedPassword);

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

router.get("/prime-registration",requireAuth,async (req,res)=>{
    
    const email = req.user ? req.user.email : req.session.user
    const userIs = req.user ? "googleUsers" : "Credenziali"

    try{
        const result = await userModel.modifyUserToPrimeUser(email,userIs);
        if(result.rowCount > 0){//query avvenuta con successo 
            res.cookie("prime", true)
            req.session.prime = true;
            res.send({status:"success"})
        }else{
            res.send({status:"failure"})
        }
    }catch(err){
        console.log(err);
    }
})

router.get("/delete-prime-registration",async (req,res)=>{
    const email = req.user ? req.user.email : req.session.user
    const userIs = req.user ? "googleUsers" : "Credenziali"

    try{
        const result = await userModel.modifyPrimeUserToUser(email,userIs);
        if(result.rowCount > 0){//query avvenuta con successo
            console.log("CIAO") 
            res.clearCookie("prime")
            res.cookie("prime",false)
            res.send({status:"success"})
        }else{
            res.send({status:"failure"})
        }
    }catch(err){
        console.log(err);
    }
})

// Esporta il router
module.exports = router;