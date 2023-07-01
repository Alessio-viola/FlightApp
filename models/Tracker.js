const axios = require('axios');
require("dotenv").config();

const accessKey = process.env.AVIATIONSTACK_API_KEY; // Inserisci la tua chiave di accesso Aviation Stack qui

//function to get AVIATIONSTACK API result 
async function getFlightTracking(flightNumber) {
  try {
    const response = await axios.get('http://api.aviationstack.com/v1/flights', {
      params: {
        access_key: accessKey,
        flight_iata: flightNumber,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Errore nella richiesta API');
  }
}

module.exports = {
  getFlightTracking
};
