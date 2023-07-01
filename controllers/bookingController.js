const express = require('express');
const router = express.Router();

const { Client } = require('pg');
const constants = require('./../configuration');
const ticketModel = require('../models/Ticket');

const connectionString = constants.connectionString;
const client = new Client({
  connectionString: connectionString
});
client.connect();

const {requireAuth} = require("./../middleware")

router.post('/save-ticket',requireAuth ,async (req, res) => {
    let flight = req.body;

    let email = req.session.user ? req.session.user : req.user.email

    const result = await ticketModel.insertTicket(email,flight);
    
    if(result.code == "success"){
        res.status(200);
    }else{
        res.status(500)
    }

})

module.exports = router