const { Client } = require('pg');
const constants = require('./../configuration');

const connectionString = constants.connectionString;
const client = new Client({
  connectionString: connectionString
});
client.connect();

async function getTickets(id, isUser) {
  const query = 'SELECT biglietti.id,biglietti.email,data,codicepartenza,codicearrivo,durata,orapartenza,oraarrivo,nomecompagnia,postonumero,cittapartenza,cittaarrivo,nome,cognome,username from biglietti JOIN ' + isUser + ' ON biglietti.email = ' + isUser + '.email WHERE biglietti.email = $1';
  const values = [id];
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery.rows;
  } catch (error) {
    console.error('Errore durante l\'esecuzione della query:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function insertTicket(email, flight) {
  const query = 'INSERT INTO Biglietti (id, email, data, codicePartenza, codiceArrivo, durata, oraPartenza, oraArrivo, nomeCompagnia, postoNumero, cittapartenza, cittaarrivo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)';
  const values = [Date.now(), email, flight.date, flight.depCode, flight.arrCode, flight.duration, flight.depTime, flight.arrTime, flight.airlineName, flight.seat, flight.depCity, flight.arrCity];

  try {
    await client.query(query, values);
    return { code: "success" };
  } catch (error) {
    console.error('Errore durante l\'inserimento del biglietto:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function deleteTickets(email) {
  const query = 'DELETE FROM biglietti WHERE email = $1';
  const values = [email];

  try {
    await client.query(query, values);
    return { code: "success" };
  } catch (error) {
    console.error('Errore durante l\'eliminazione dei biglietti:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

module.exports = {
  getTickets,
  insertTicket,
  deleteTickets
};
