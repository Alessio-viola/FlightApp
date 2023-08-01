const request = require('supertest');
const app = require('./../../index');
const assert = require('assert');
const { Client } = require('pg');
const constants = require("./../../configuration");
const bcrypt = require('bcrypt');

describe('Integration Test', function() {
  
  let client 

  this.timeout(5000);// Imposta il timeout a 5 secondi

  before(async function() {
    const connectionString = constants.connectionString;
    client = new Client({
      connectionString: connectionString
    });
    client.connect();

    await client.query('DELETE FROM credenziali');

    //registrazione dell'utente su cui testerò la user story di accesso con credenziali
    const password = await bcrypt.hash('password123',10);
    const values = ['Mario', 'Rossi', 'mariorossi@example.com', password, 'marioRossi']
    const query = 'INSERT INTO credenziali (nome, cognome, email, pass, username) VALUES ($1, $2, $3, $4, $5)';
    await client.query(query,values)
});

  after(async function() {
    // Svuota la tabella degli utenti alla fine dei tests
    await client.query('DELETE FROM credenziali');

    client.end();
    process.exit();
  });

  
  it('user should login', (done) => {
    const userData = {
      email: 'mariorossi@example.com',
      password: 'password123'
    };

    request(app)
      .post('/api/sign-in')
      .send(userData)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        
        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, "Success"); // non ci sono errori
        
        done();
      });
  });
 
  
  it('should handle invalid email format', (done) => {
    const userData = {
      email: 'invalidemail', // Email non valida
      password: 'password123',
      
    };

    request(app)
      .post('/api/sign-in')
      .send(userData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, 'Error'); // Codice di errore per formato email non valido
        
        done();
      });
  });

  it('should handle wrong password', (done) => {
    const userData = {
      email: 'mariorossi@example.com', 
      password: 'password12' //password sbagliata 
    };

    request(app)
      .post('/api/sign-in')
      .send(userData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, 'Error'); // Codice di errore per email gia presente nel DB 

        done();
      });
  });

  
  it('should handle wrong email', (done) => {
    const userData = {
      email: "mario@example.com", // Email non presente nel DB  
      password: 'password123',
    };

    request(app)
      .post('/api/sign-in')
      .send(userData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, "Error"); // Codice di errore per username gia presente nel DB 

        done();
      });
  });
  
});
