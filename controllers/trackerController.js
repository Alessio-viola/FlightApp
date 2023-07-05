const express = require('express');
const router = express.Router();

const trackerModel = require("./../models/Tracker");

const {requirePrimeAuth} = require("./../middleware")//middleware per utente prime 

router.get('/flight/:flightNumber',requirePrimeAuth,async (req,res)=>{
    const flightNumber = req.params.flightNumber;

    try{
        
        result = await trackerModel.getFlightTracking(flightNumber)
        res.send(result)

    }catch(err){
        console.log(err);
    }

});

module.exports = router;
