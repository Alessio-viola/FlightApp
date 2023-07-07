const request = require('supertest');
const app = require('./../../index');
const assert = require('assert');

describe('Integration Test', () => {
  it('should create a new user', (done) => {
    const userData = {
      nome: 'John',
      cognome: 'Doe',
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
        // Verifica altre aspettative sui dati di risposta, se necessario
        done();
      });
  });

  it('should handle incorrect password confirmation', (done) => {
    const userData = {
      nome: 'John',
      cognome: 'Doe',
      username: 'johndoe',
      email: 'alessioviola04112001@gmail.com',
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
        // Verifica altre aspettative sui dati di risposta, se necessario
        done();
      });
  });

  it('should handle invalid email format', (done) => {
    const userData = {
      nome: 'John',
      cognome: 'Doe',
      username: 'aleita',
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
        // Verifica altre aspettative sui dati di risposta, se necessario
        done();
      });
  });
});
