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

const userModel = require("./../models/User")

const {createAccountLimiter} = require("./../middleware")

/*Codici di errore dell'iscrizione:
1000: email in formato scorretto
1001: violazione vincolo di chiave primaria (email)
1002: violazione vincolo di chiave (username)   
1003: password e conferma_password sono diverse
*/

router.post("/api/sign-up",createAccountLimiter ,async (req, res) => {

    const {nome, cognome, username, email, password, conferma_password} = req.body

    console.log(req.body)

    //controllo correttezza password
    if (password != conferma_password) {
        console.log("pass != confpass")
        return res.send({code: 1003})
    }

    //controllo formato email
    const regex = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;
    
    if (!regex.test(email)) {
        console.log("email scorretta")
        return res.send({code: 1000})
    }

    const result = await userModel.insertUser(email,nome,cognome,username,password)
    
    if(result?.code === 1001 || result?.code === 1002){
        console.log("1001 || 1002")
        return res.send(result)
    }
    console.log("tutto apposto lato server")
    
    //userModel.sendEmail(email) //da controllare la forma
    
    return res.send(result)

});

module.exports = router