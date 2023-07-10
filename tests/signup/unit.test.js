const assert = require('assert');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const constants = require("./../../configuration")
const userModel = require("./../../models/User")

describe('User Registration: UNIT TESTS', function() {
    let client; // Oggetto client per la connessione al database

    this.timeout(5000); // Imposta il timeout a 5 secondi
  
    before(function() {
      // Configura la connessione al tuo database PostgreSQL
  
      const connectionString = constants.connectionString;
  
      client = new Client({
          connectionString: connectionString
      });
  
      // Connetti al database
      client.connect();
    });
  
    before(async function() {
      // Svuota la tabella degli utenti prima di ogni test
      await client.query('DELETE FROM credenziali');
    });
  
    it('should register a new user with hashed password and send email', async function() {
      // Simula la richiesta di registrazione con i dati dell'utente
      const userData = {
        nome: 'Alessio',
        cognome:'Viola',
        username:'alessio2001',
        email: 'alessioviola04112001@gmail.com',
        password: 'password123',
      };
  
      try{
        //UNIT TEST SULLA FUNZIONE insertUser(...)
        const result = await userModel.insertUser(userData.email, userData.nome, userData.cognome, userData.username, userData.password)
        
        // Verifica che i dati siano stati correttamente salvati nel database
        assert.strictEqual(result.rowCount, 1);
        assert.strictEqual(result.rows[0].nome, userData.nome);
        assert.strictEqual(result.rows[0].cognome, userData.cognome);
        assert.strictEqual(result.rows[0].username, userData.username);
        assert.strictEqual(result.rows[0].email, userData.email);
        
        
        // Verifica che la password sia stata correttamente hashata
        const isPasswordMatch = await bcrypt.compare(userData.password, result.rows[0].pass);
        assert.strictEqual(isPasswordMatch, true);
        
        // Verifica l'invio dell'email
        const emailResult = await userModel.sendEmail(userData.email);
        assert.strictEqual(emailResult.response.startsWith('250'), true);
        }catch(err){
          console.log(err)
        }
    });
    
  
    it('should fail registration if username field is missing', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        nome: 'Alessio',
        cognome: 'Viola',
        email: 'alessio@example.com',
        password: 'password123'
      };
    
      // Esegui la logica di registrazione
      const result = await userModel.insertUser(userData.email, userData.nome, userData.cognome, undefined, userData.password)
        
      // Verifica che la registrazione sia fallita
      assert.strictEqual(result instanceof Error, true);
      assert.strictEqual(result.code, '23502'); // Codice di errore per campo obbligatorio mancante
    });
      
    it('should fail registration if email field is missing', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        nome: 'Alessio',
        cognome: 'Viola',
        username: 'alessioviola',
        password: 'alessio2001'
      };
    
      // Esegui la logica di registrazione
      const result = await userModel.insertUser(undefined, userData.nome, userData.cognome, userData.username, userData.password)
        
      // Verifica che la registrazione sia fallita
      assert.strictEqual(result instanceof Error, true);
      assert.strictEqual(result.code, '23502'); // Codice di errore per campo obbligatorio mancante
    });
  
    it('should fail registration if name field is missing', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        cognome: 'Rossi',
        username: 'marioRossi',
        email:'mario@example.com',
        password: 'mario2001'
      };
    
      // Esegui la logica di registrazione
      const result = await userModel.insertUser(userData.email, undefined, userData.cognome, userData.username, userData.password)
        
      // Verifica che la registrazione sia fallita
      assert.strictEqual(result instanceof Error, true);
      assert.strictEqual(result.code, '23502'); // Codice di errore per campo obbligatorio mancante
    });
  
    it('should fail registration if surname field is missing', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        nome: 'Mario',
        username: 'marioRossi',
        email:'mario@example.com',
        password: 'mario2001'
      };
    
      // Esegui la logica di registrazione
      const result = await userModel.insertUser(userData.email, userData.nome, undefined, userData.username, userData.password)
        
      // Verifica che la registrazione sia fallita
      assert.strictEqual(result instanceof Error, true);
      assert.strictEqual(result.code, '23502'); // Codice di errore per campo obbligatorio mancante
    });

    it('should fail registration if email already exists in DB ', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        nome: 'Alessio',
        cognome: 'Viola',
        username: 'aleita',
        email:'alessioviola04112001@gmail.com',
        password: 'alessio2001'
      };
    
      // Esegui la logica di registrazione
      const result = await userModel.insertUser(userData.email, userData.nome, userData.cognome, userData.username, userData.password)
        
      // Verifica che la registrazione sia fallita con codice 1001
      assert.strictEqual(result.code, 1001); // Codice di errore vincolo di chiave primaria della tabella Credenziali
    });

    it('should fail registration if username already exists in DB ', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        nome: 'Alessio',
        cognome: 'Viola',
        username: 'alessio2001',
        email:'alessioviola04112001@libero.it',
        password: 'alessio2001'
      };
    
      // Esegui la logica di registrazione
      const result = await userModel.insertUser(userData.email, userData.nome, userData.cognome, userData.username, userData.password)
        
      // Verifica che la registrazione sia fallita con codice 1002
      assert.strictEqual(result.code, 1002); // Codice di errore vincolo di chiave per username 
    });

    after(function() {
      // Chiudi la connessione al database dopo i test
      client.end();
      process.exit();
    });
});  
    
