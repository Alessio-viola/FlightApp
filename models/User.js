const { Client } = require('pg');
const constants = require('./../configuration');
const bcrypt = require('bcrypt'); //to hash password

const connectionString = constants.connectionString;
const client = new Client({
  connectionString: connectionString
});
client.connect();

async function getPersonalInfo(id) {
  const query = 'SELECT nome,cognome,username from Credenziali WHERE email = $1';
  const values = [id];
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery.rows[0];
  } catch (error) {
    console.error('Errore durante l\'esecuzione della query:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function deleteUser(id) {
  const query = 'DELETE FROM Credenziali WHERE email = $1';
  const values = [id];
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery;
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'utente:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function deleteGoogleUser(id) {
  const query = 'DELETE FROM googleUsers WHERE email = $1';
  const values = [id];
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery;
  } catch (error) {
    console.error('Errore durante l\'eliminazione dell\'utente Google:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function insertUser(id, nome, cognome, username, password) {
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const query = 'INSERT INTO Credenziali (nome,cognome,email, pass, username) VALUES ($1, $2, $3, $4, $5)';
    const values = [nome, cognome, id, hash, username];

    const result = await client.query(query, values);
  } catch (err) {
    if (err.constraint === 'credenziali_pkey') {
      return  { code: 1001 };
    } else if (err.constraint === 'vincolo_username') {
      return  { code: 1002 };
    } else {
      console.error('Errore durante l\'inserimento dell\'utente:', err);
      throw err; // Rilancia l'errore per una gestione ulteriore
    }
  }
}

async function insertGoogleUser(id, username, name, surname, profilePhoto, email) {
  const query = "SELECT id from googleUsers where id=$1";
  const values = [email];

  try {
    const result = await client.query(query, values);
    if (result.rows[0] === undefined) { //non è presente nel DB
      const queryInsert = 'INSERT INTO googleUsers (username, id, nome, cognome, fotoprofilo, email) VALUES ($1, $2, $3, $4, $5, $6)';
      const valuesInsert = [username, id, name, surname, profilePhoto, email];

      await client.query(queryInsert, valuesInsert);
      console.log("Utente registrato correttamente");
    } else { //è presente nel DB
      console.log("Utente già presente nel DB");
    }
  } catch (error) {
    console.error('Errore durante l\'inserimento dell\'utente Google:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function getHashedPassword(id) {
  const query = 'SELECT pass from Credenziali WHERE email = $1';
  const values = [id];

  try {
    const resultQuery = await client.query(query, values);
    return resultQuery.rows[0].pass;//restituisco la password
  } catch (error) {
    console.error('Errore durante l\'esecuzione della query:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function updatePassword(id, new_password){
  const query = "UPDATE Credenziali SET pass = $1 WHERE email = $2";
  const values = [new_password, id]
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery
  } catch (error) {
    console.error('Errore durante l\'esecuzione della query:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

//campo prime nel DB da inserire
async function isPrimeUser(id, isUser){//isUser ci serve per capire se ha effettuato l'accesso con oauth oppure no
  const query = "SELECT prime from "+ isUser + " WHERE email = $1";
  const values = [id]
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery.rows[0]
  } catch (error) {
    console.error('Errore durante l\'esecuzione della query:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function modifyUserToPrimeUser(id,userIs){
  
  const query = "UPDATE "+ userIs +" SET prime = $1 WHERE email = $2";
  const values = [true,id]
  
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery
  } catch (error) {
    console.error('Errore durante l\'esecuzione della query:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

async function modifyPrimeUserToUser(id,userIs){
  const query = "UPDATE "+ userIs +" SET prime = $1 WHERE email = $2";
  const values = [false,id] //false, valore di prime da modificare
  
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery
  } catch (error) {
    console.error('Errore durante l\'esecuzione della query:', error);
    throw error; // Rilancia l'errore per una gestione ulteriore
  }
}

module.exports = {
  getPersonalInfo,
  deleteUser,
  deleteGoogleUser,
  insertUser,
  insertGoogleUser,
  getHashedPassword,
  updatePassword,
  modifyUserToPrimeUser,
  modifyPrimeUserToUser,
  isPrimeUser
};
