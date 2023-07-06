const assert = require('assert');
const { Client } = require('pg');
const constants = require("./../../configuration")
const puppeteer = require('puppeteer');//per automatizzare le operazioni del browser

describe('User Registration: ACCEPTANCE TESTS', function() {
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
  
  
  before(async function() {
    // Svuota la tabella degli utenti prima di ogni test
    await client.query('DELETE FROM credenziali');
  });
  
  it('should register a new user', async function() {
    
    const browser = await puppeteer.launch({ ignoreHTTPSErrors: true }); //per evitare l'errore che ne deriva dovuto al certificato autofirmato
    const page = await browser.newPage();

    page.setViewport({ width:1280, height:800 })

    // Simula l'interazione dell'utente con l'applicazione
    await page.goto('https://localhost:3000/api/sign-up');
    await page.type('#nome', 'Leo');
    await page.type('#cognome', 'Ponzo');
    await page.type('#email', 'LeoPonzo11@email.com');
    await page.type('#username', 'LeoPonzo11');
    await page.type('#password', 'password123');
    await page.type('#conferma_password', 'password123');
    await page.click('#submitAuth');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    

    // Verifica il risultato atteso
    const titoloPagina = await page.title();
    
    console.log(titoloPagina)

    //const urlCorrente = await page.url();


    // Cattura dello screenshot della pagina
    await page.screenshot({ path: './tests/signup/screensignup.png' });

    assert.strictEqual(titoloPagina, 'Iscrizione avvenuta con successo');
 
    await browser.close();
  });

  it('should login a new user checking cookies', async function() {
    
    const browser = await puppeteer.launch({ ignoreHTTPSErrors: true }); //per evitare l'errore che ne deriva dovuto al certificato autofirmato
    const page = await browser.newPage();
    page.setViewport({ width:1280, height:800 })

    // Simula l'interazione dell'utente con l'applicazione
    await page.goto('https://localhost:3000/api/sign-in');
    await page.type('#email', 'LeoPonzo3@email.com');
    await page.type('#password', 'password123');
    await page.click('#submit');

    // Verifica il risultato atteso
    

    const cookies = await page.cookies();    

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    
    // Cattura dello screenshot della pagina
    await page.screenshot({ path: './tests/signup/screensignin.png' });

    const primeValue = cookies[0].value
    const loggedValue = cookies[1].value
    
    console.log("prime: ",primeValue)
    console.log("logged: ",loggedValue)

    assert.strictEqual(primeValue, "false")
    assert.strictEqual(loggedValue, 'true');
    
    await browser.close();
  });

  after(function() {
    // Chiudi la connessione al database dopo i test
    client.end();
  
    // Al termine dei test
    process.exit();
  });
  

});