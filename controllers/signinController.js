const express = require('express');
const router = express.Router();

const { Client } = require('pg');
const constants = require('./../configuration');

const connectionString = constants.connectionString;
const client = new Client({
  connectionString: connectionString
});
client.connect();

const bcrypt = require('bcrypt');//to hash passwords

//import del modello user
const userModel = require("./../models/User")

//import dei middleware
const {bruteforceLimiter, errorBruteforceLimiter} = require("./../middleware")

//CODICI DI ERRORE /api/sign-in
// "Error" -> errore
// "Success" --> login andato a buon fine 
router.post("/api/sign-in", bruteforceLimiter , errorBruteforceLimiter, async (req, res) => {

    const {email, password} = req.body
    try{
        //ottengo il nome 
        const informations  = await userModel.getPersonalInfo(email)
        
        if (informations === undefined) return res.send({code: "Error"})
        
        //ottengo l'hashed password
        const hashedPassword = await userModel.getHashedPassword(email)

        if (informations === undefined) return res.send({code: "Error"})
    
        const result = await bcrypt.compare(password, hashedPassword);
    
        if(result == true){
            
            res.cookie("logged", true)
            
            //settaggio del prime cookie
            try{
                const info =  await userModel.isPrimeUser(email,"Credenziali")
                const prime = info.prime
                console.log(prime)
                res.cookie("prime", prime)
                
            }catch(err){
                console.log("error during setting prime cookie")
            }
            req.session.loggedin = true;//vado a CREARE il campo loggedin all'interno di req.session e lo setto a true
            req.session.user = email; //vado a CREARE il campo user all'interno di req.session e lo setto uguale alla mail
            return res.send({code: "Success", username: informations.nome}).status(200)
        }else{
            return res.send({code: "Error"})
        }
    }catch(err){
        console.log("Error during login")
        throw err
    }
});


router.post("/check-token", async (req,res) =>{
    const {email,token} = req.body
    console.log("sono in checkToken")

    try{
        const informations = await userModel.getToken(email)

        if(informations == undefined) return res.send({code: 'Error'})

        if(informations.code != token){
            console.log("Il token che hai inserito non corrisponde");
            return res.send({code: 'Error'})
        }else{
            console.log("Sono in success del checktoken")
            res.send({code: 'Success'});
        }
    }catch{
        console.log("Errore in check-token")
    }
});

router.post("/update-password", async (req,res) =>{
    const {password, confPassword, email} = req.body
    const saltRounds = 10;
    try{
        console.log("sono in update password");
        if(password != confPassword) return res.send({code: 'Error'})

        const crypted_password = await bcrypt.hash(password,saltRounds);

        await userModel.updatePassword(email, crypted_password);
        console.log("password aggiornata");
        return res.send({code: 'Success'})
    }catch{
        console.log("Errore aggiornamento password");
    }
})

router.post("/forgot-password", async (req, res) => {

    const {email} = req.body


    try{
        
        const informations  = await userModel.getPersonalInfo(email)
        
        if (informations === undefined){
            console.log("L'email non è presente nel db")
            return res.send({code: "Error"})
        }

        const token = userModel.generateRandomToken();
        userModel.sendTokenEmail(email,token);
        userModel.insertToken(email,token);

        console.log("Invio il primo success nel forgot")
        return res.send({code: 'Success'});
    }catch(err){
        console.log("Error during recovering password")
        throw err
    }

})

// Esporta il router
module.exports = router;