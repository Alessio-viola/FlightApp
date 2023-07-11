const { Client } = require('pg');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const constants = require("./../../configuration");
const puppeteer = require('puppeteer');
const bcrypt = require('bcrypt');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('User Registration: ACCEPTANCE TESTS', function() {
  
  let client;
  let browser;
  let page;
  this.timeout(10000); // Imposta il timeout a 10 secondi

  before(async function() {
    const connectionString = constants.connectionString;
    client = new Client({
      connectionString: connectionString
    });
    client.connect();

    await client.query('DELETE FROM credenziali');

    //registration of a new user
    const password = await bcrypt.hash('password123',10);
    const values = ['Mario', 'Rossi', 'mariorossi@example.com', password, 'marioRossi']
    const query = 'INSERT INTO credenziali (nome, cognome, email, pass, username) VALUES ($1, $2, $3, $4, $5)';
    await client.query(query,values)

  });

  before(async function() {//beforeEach
    browser = await puppeteer.launch({ 
      ignoreHTTPSErrors: true, 
      headless: false
    });
    page = await browser.newPage();
    page.setViewport({ width: 1280, height: 800 });
  });

  //afterEach(async function() {
  //  await browser.close();
  //});

  afterEach(async function (){
    await page.waitForTimeout(1000);
  })

  after(async function() {
    client.end();
    process.exit();
  });

  it('should login a user checking redirect',async function(){
    
    // Simula l'interazione dell'utente con l'applicazione
    await page.goto('https://localhost:3000/api/sign-in');
    await page.type('#email', 'mariorossi@example.com');
    await page.type('#password', 'password123');
    await page.click('#submit');

    // Verifica il risultato atteso
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    
    // Verifica il risultato atteso
    const urlCorrente = await page.url();
    expect(urlCorrente).to.equal('https://localhost:3000/');

    await page.goto('https://localhost:3000/logout')
  })

  it('should login a user checking cookies', async function() {
    
    // Simula l'interazione dell'utente con l'applicazione
    await page.goto('https://localhost:3000/api/sign-in');
    await page.type('#email', 'mariorossi@example.com');
    await page.type('#password', 'password123');
    await page.click('#submit');

    // Verifica il risultato atteso
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    const cookies = await page.cookies();    

    const primeValue = cookies[0].value
    const loggedValue = cookies[1].value
    
    expect(primeValue).to.equal("false");
    expect(loggedValue).to.equal("true")

    await page.goto('https://localhost:3000/logout')
  });

  it('should not log in due to wrong password',async function(){

    // Simula l'interazione dell'utente con l'applicazione
    await page.goto('https://localhost:3000/api/sign-in');
    await page.type('#email', 'mariorossi@example.com');
    await page.type('#password', 'wrongpassword');
    await page.click('#submit');

    // Verifica il risultato atteso
    
    // Aspetta che l'elemento '#error-message' diventi visibile
    await page.waitForSelector('#error-message', { visible: true });

    // Verifica il risultato atteso
    const errorMessage = await page.evaluate(() => {
        const errorMessageElement = document.querySelector('#error-message');
        return errorMessageElement.textContent;
    });
    
    expect(errorMessage).to.equal("Credenziali errate")//ASSERZIONE 

  })

  it('should not log in due to wrong email',async function(){

    // Simula l'interazione dell'utente con l'applicazione
    await page.goto('https://localhost:3000/api/sign-in');
    await page.type('#email', 'mariorossi2001@example.com');
    await page.type('#password', 'password123');
    await page.click('#submit');


    // Verifica il risultato atteso
    
    // Aspetta che l'elemento '#error-message' diventi visibile
    await page.waitForSelector('#error-message', { visible: true });

    // Verifica il risultato atteso
    const errorMessage = await page.evaluate(() => {
        const errorMessageElement = document.querySelector('#error-message');
        return errorMessageElement.textContent;
    });
    
    expect(errorMessage).to.equal("Credenziali errate")//ASSERZIONE 

  })

  });