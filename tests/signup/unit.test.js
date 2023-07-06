const assert = require('assert');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const constants = require("./../../configuration")
const userModel = require("./../../models/User")

describe('User Registration: UNIT TESTS', function() {
    let client; // Oggetto client per la connessione al database
  
    before(function() {
      // Configura la connessione al tuo database PostgreSQL
  
      const connectionString = constants.connectionString;
  
      client = new Client({
          connectionString: connectionString
      });
  
      // Connetti al database
      client.connect();
    });
  
    beforeEach(async function() {
      // Svuota la tabella degli utenti prima di ogni test
      await client.query('DELETE FROM credenziali');
    });
  
    it('should register a new user with hashed password', async function() {
      // Simula la richiesta di registrazione con i dati dell'utente
      const userData = {
        nome: 'Mario',
        cognome:'Rossi',
        username:'marioRossi',
        email: 'mariorossi@example.com',
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
        }catch(err){
          console.log(err)
        }
    });
    
    it('should register multiple users with hashed password', async function() {
      const usersData = [
          {
            nome: 'Mario',
            cognome: 'Rossi',
            username: 'marioRossi',
            email: 'mario@example.com',
            password: 'password123',
          },
          {
            nome: 'Luigi',
            cognome: 'Verdi',
            username: 'luigiVerdi',
            email: 'luigi@example.com',
            password: 'password456',
          },
          {
            nome: 'Giovanna',
            cognome: 'Bianchi',
            username: 'giovannaBianchi',
            email: 'giovanna@example.com',
            password: 'password789',
          },
          {
            nome: 'Sara',
            cognome: 'Neri',
            username: 'saraNeri',
            email: 'sara@example.com',
            password: 'password987',
          },
          {
            nome: 'Andrea',
            cognome: 'Russo',
            username: 'andreaRusso',
            email: 'andrea@example.com',
            password: 'password654',
          },
          {
            nome: 'Giulia',
            cognome: 'Gialli',
            username: 'giuliaGialli',
            email: 'giulia@example.com',
            password: 'password321',
          },
          {
            nome: 'Paolo',
            cognome: 'Verde',
            username: 'paoloVerde',
            email: 'paolo@example.com',
            password: 'password135',
          },
          {
            nome: 'Laura',
            cognome: 'Bianchi',
            username: 'lauraBianchi',
            email: 'laura@example.com',
            password: 'password246',
          },
          {
            nome: 'Simone',
            cognome: 'Rossi',
            username: 'simoneRossi',
            email: 'simone@example.com',
            password: 'password579',
          },
          {
            nome: 'Alessia',
            cognome: 'Neri',
            username: 'alessiaNeri',
            email: 'alessia@example.com',
            password: 'password864',
          }
        ];
        
    
      for (const userData of usersData) {
       
        try{
          const result = await userModel.insertUser(userData.email, userData.nome, userData.cognome, userData.username, userData.password)
          assert.strictEqual(result.rowCount, 1);
          assert.strictEqual(result.rows[0].nome, userData.nome);
          assert.strictEqual(result.rows[0].cognome, userData.cognome);
          assert.strictEqual(result.rows[0].username, userData.username);
          assert.strictEqual(result.rows[0].email, userData.email);
    
          const isPasswordMatch = await bcrypt.compare(userData.password, result.rows[0].pass);
          assert.strictEqual(isPasswordMatch, true);
        }catch(err){
          console.log(err)
        }
      }
    });
  
    it('should fail registration if username field is missing', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario@example.com',
        password: 'password123'
      };
    
      // Esegui la logica di registrazione
      const result = await userModel.insertUser(userData.email, userData.nome, userData.cognome, undefined, userData.password)
        
      // Verifica che la registrazione sia fallita
      assert.strictEqual(result instanceof Error, true);
      assert.strictEqual(result.code, '23502'); // Codice di errore per campo obbligatorio mancante
    });
    
    /*
    it('should fail registration if password field is missing', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        nome: 'Mario',
        cognome: 'Rossi',
        username: 'marioRossi',
        email: 'mario@example.com'
      };
    
      const result = await userModel.insertUser(userData.email, userData.nome, userData.cognome, userData.username, undefined)
      console.log(result)
      // Verifica che la registrazione sia fallita
      assert.strictEqual(result instanceof Error, true);
      assert.strictEqual(result.code, '23502'); // Codice di errore per campo obbligatorio mancante
    });
    */
  
    it('should fail registration if email field is missing', async function() {
      // Simula la richiesta di registrazione con dati incompleti
      const userData = {
        nome: 'Mario',
        cognome: 'Rossi',
        username: 'marioRossi',
        password: 'mario2001'
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
  
    after(function() {
      // Chiudi la connessione al database dopo i test
      client.end();
    });
});  
    
