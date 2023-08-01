require("dotenv").config();
const fetch = require('node-fetch');
const https = require('https');

const accessKey = process.env.AVIATIONSTACK_API_KEY; // Inserisci la tua chiave di accesso Aviation Stack qui

//function to get AVIATIONSTACK API result 
async function getFlightTracking(flightNumber) {
  const url = `http://api.aviationstack.com/v1/flights?access_key=${accessKey}&flight_icao=${flightNumber}`;
  //let url = new URL('https://localhost:3000/example-tracker-res.json');//DEBUG CASE
  try {
    //DEBUG CASE
    //const agent = new https.Agent({ rejectUnauthorized: false });
    //const response = await fetch(url, { agent });
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('ERRORE');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(console.log(error))
    throw new Error('Errore nella richiesta API AVIATIONSTACK');
  }
}

module.exports = {
  getFlightTracking
};
