const assert = require('assert');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const constants = require("./../../configuration")
const userModel = require("./../../models/User");

describe("User login: UNIT TEST", function(){
    let client;

    before(async function() {
        // Configura la connessione al tuo database PostgreSQL
  
      const connectionString = constants.connectionString;
  
      client = new Client({
          connectionString: connectionString
      });
  
      // Connetti al database
      await client.connect();

      await client.query('DELETE FROM credenziali');

      const password = await bcrypt.hash('password123',10);
      const values = ['Mario', 'Rossi', 'mariorossi@example.com', password, 'marioRossi', true]
      const query = 'INSERT INTO credenziali (nome, cognome, email, pass, username, prime) VALUES ($1, $2, $3, $4, $5, $6)';
      await client.query(query,values)
    })

    it("should get personal info testing funtion getPersonalInfo()", async function(){
        const userData = {
            nome: 'Mario',
            cognome: 'Rossi',
            username: 'marioRossi',
            email: 'mariorossi@example.com',
        }

        try{
            const result = await userModel.getPersonalInfo(userData.email);

            assert.strictEqual(result.nome, userData.nome);
            assert.strictEqual(result.cognome, userData.cognome);
            assert.strictEqual(result.username, userData.username);

        }catch(err){
            console.log(err)
        }

    })
    
    it("should fail getPersonalInfo() because miss user in db", async function(){
        const userData = {
            nome: 'Mario',
            cognome: 'Rossi',
            username: 'marioRossi',
            email: 'lariorossi@example.com',
        }

        const result = await userModel.getPersonalInfo(userData.email);
        assert.strictEqual(result, undefined);
    })

    it("should get hashed password testing function getHashedPassword()", async function(){
        const userData = {
            nome: 'Mario',
            cognome: 'Rossi',
            username: 'marioRossi',
            email: 'mariorossi@example.com',
            pass: 'password123'
        }

        try{
            const result = await userModel.getHashedPassword(userData.email);
            const isPasswordMatch = await bcrypt.compare(userData.pass, result)
            assert.strictEqual(isPasswordMatch, true)
        }catch(err){
            console.log(err)
        }
    })

    it("should fail getHashedPassword() because miss user in db", async function(){
        const userData = {
            nome: 'Mario',
            cognome: 'Rossi',
            username: 'marioRossi',
            email: 'lariorossi@example.com',
            pass: 'password123'
        }

        const result = await userModel.getHashedPassword(userData.email);
        assert.strictEqual(result, undefined)
    })

    after(async function() {
        // Svuota la tabella degli utenti alla fine dei tests
        await client.query('DELETE FROM credenziali');

        // Chiudi la connessione al database dopo i test
        client.end();
        process.exit();
    });
});