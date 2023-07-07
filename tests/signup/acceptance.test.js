const { Client } = require('pg');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const constants = require("./../../configuration");
const puppeteer = require('puppeteer');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('User Registration: ACCEPTANCE TESTS', function() {
  let client;
  let browser;
  let page;

  before(async function() {
    const connectionString = constants.connectionString;
    client = new Client({
      connectionString: connectionString
    });
    client.connect();

    await client.query('DELETE FROM credenziali');
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

  after(function() {
    client.end();
    process.exit();
  });

  it('should register a new user', async function() {
    await page.goto('https://localhost:3000/api/sign-up');

    // Aspetta che l'elemento con l'id '#submitAuth' diventi visibile
    await page.waitForSelector('#submitAuth', { visible: true });

    await page.type('#nome', 'Leo');
    await page.type('#cognome', 'Ponzo');
    await page.type('#email', 'leo@example.com');
    await page.type('#username', 'LeoPonzo11');
    await page.type('#password', 'password123');
    await page.type('#conferma_password', 'password123');

    // Fai clic sull'elemento solo dopo che è diventato visibile
    await page.click('#submitAuth');

    // Aspetta che la navigazione si completi
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    // Verifica il risultato atteso
    const urlCorrente = await page.url();
    const titoloPagina = await page.title();
    expect(urlCorrente).to.equal('https://localhost:3000/avvenuta-iscrizione');
    expect(titoloPagina).to.equal('Iscrizione avvenuta con successo')
  });

  it('should fail registration if email already exists in DB', async function() {
    await page.goto('https://localhost:3000/api/sign-up');

    // Aspetta che l'elemento con l'id '#submitAuth' diventi visibile
    await page.waitForSelector('#submitAuth', { visible: true });

    await page.type('#nome', 'Leo');
    await page.type('#cognome', 'Ponzo');
    await page.type('#email', 'leo@example.com');
    await page.type('#username', 'LeoPonzo211');
    await page.type('#password', 'password123');
    await page.type('#conferma_password', 'password123');

    // Fai clic sull'elemento solo dopo che è diventato visibile
    await page.click('#submitAuth');

    // Aspetta che l'elemento '#error-message' diventi visibile
    await page.waitForSelector('#error-message', { visible: true });

    // Aspetta che la navigazione si completi
    //await Promise.all([
    //  page.waitForNavigation({ waitUntil: 'networkidle0' }),
    //]);
    
    // Verifica il risultato atteso
    const errorMessage = await page.evaluate(() => {
      const errorMessageElement = document.querySelector('#error-message');
      return errorMessageElement.textContent;
    });
    
    expect(errorMessage).to.equal("Email già presente nel DB")
  });

});

/*
  //login 

  it('should login a new user checking cookies', async function() {
    
    // Simula l'interazione dell'utente con l'applicazione
    await page.goto('https://localhost:3000/api/sign-in');
    await page.type('#email', 'leo@example.com');
    await page.type('#password', 'password123');
    await page.click('#submit');

    // Verifica il risultato atteso
    

    const cookies = await page.cookies();    

    //await Promise.all([
    //  page.waitForNavigation({ waitUntil: 'networkidle0' }),
    //]);
    
    // Cattura dello screenshot della pagina
    await page.screenshot({ path: './tests/signup/screensignin.png' });

    const primeValue = cookies[0].value
    const loggedValue = cookies[1].value
    
    console.log("prime: ",primeValue)
    console.log("logged: ",loggedValue)

    
    expect(primeValue).to.equal(false);
    expect(loggedValue).to.equal(true)

    await browser.close();
  });

});*/