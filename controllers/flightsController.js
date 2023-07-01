const express = require('express');
const router = express.Router();

const flightsModel = require('./../models/Flights');

router.get("/retrieveFlights", async (req, res) => {
    try {
        let flights = await flightsModel.retrieveFlights(req);
        res.send(flights);
    } catch (e) {
        res.sendStatus(400);
        res.send(e);
    }
});

module.exports = router