const request = require('supertest');
const app = require('./../../index');
const assert = require('assert');
const { Client } = require('pg');
const constants = require("./../../configuration");

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
  });

  after(async function() {
    // Svuota la tabella degli utenti alla fine dei tests
    await client.query('DELETE FROM credenziali');

    client.end();
    process.exit();
  });

  
  it('should create a new user', (done) => {
    const userData = {
      nome: 'Alessio',
      cognome: 'Viola',
      username: 'aleita',
      email: 'alessioviola04112001@gmail.com',
      password: 'password123',
      conferma_password: 'password123',
    };

    request(app)
      .post('/api/sign-up')
      .send(userData)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        
        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, undefined); // Assumi che non ci siano errori
        
        done();
      });
  });

  it('should handle incorrect password confirmation', (done) => {
    const userData = {
      nome: 'Alessio',
      cognome: 'Viola',
      username: 'aleita1',
      email: 'alessioviola04112001@libero.it',
      password: 'password123',
      conferma_password: 'differentpassword', // Password di conferma errata
    };

    request(app)
      .post('/api/sign-up')
      .send(userData)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        
        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, 1003); // Codice di errore per password di conferma errata
        
        done();
      });
  });

  it('should handle invalid email format', (done) => {
    const userData = {
      nome: 'Alessio',
      cognome: 'Viola',
      username: 'aleita2',
      email: 'invalidemail', // Email non valida
      password: 'password123',
      conferma_password: 'password123',
    };

    request(app)
      .post('/api/sign-up')
      .send(userData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, 1000); // Codice di errore per formato email non valido
        
        done();
      });
  });

  it('should handle email already exists in DB', (done) => {
    const userData = {
      nome: 'Alessio',
      cognome: 'Viola',
      username: 'aleita3',
      email: 'alessioviola04112001@gmail.com', // Email gia presente nel DB 
      password: 'password123',
      conferma_password: 'password123',
    };

    request(app)
      .post('/api/sign-up')
      .send(userData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, 1001); // Codice di errore per email gia presente nel DB 

        done();
      });
  });

  it('should handle username already exists in DB', (done) => {
    const userData = {
      nome: 'Alessio',
      cognome: 'Viola',
      username: 'aleita',
      email: 'alessioviola04112001@libero.it', // Email gia presente nel DB 
      password: 'password123',
      conferma_password: 'password123',
    };

    request(app)
      .post('/api/sign-up')
      .send(userData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        // Verifica il corpo della risposta
        assert.strictEqual(res.body.code, 1002); // Codice di errore per username gia presente nel DB 

        done();
      });
  });

});
