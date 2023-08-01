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

  this.timeout(10000); // Imposta il timeout a 10 secondi

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

  afterEach(async function (){
    await page.waitForTimeout(1000);
  })

  after(async function() {
    // Svuota la tabella degli utenti alla fine dei tests
    await client.query('DELETE FROM credenziali');

    client.end();
    process.exit();
  });

  it('should register a new user', async function() {
    await page.goto('https://localhost:3000/api/sign-up');

    // Aspetta che l'elemento con l'id '#submitAuth' diventi visibile
    await page.waitForSelector('#submitAuth', { visible: true });

    await page.type('#nome', 'Alessio');
    await page.type('#cognome', 'Viola');
    await page.type('#email', 'alessioviola04112001@gmail.com');
    await page.type('#username', 'AleViola01');
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

    await page.type('#nome', 'Alessio');
    await page.type('#cognome', 'Viola');
    await page.type('#email', 'alessioviola04112001@gmail.com');
    await page.type('#username', 'AleViola02');
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

  it('should fail registration if username already exists in DB', async function() {
    await page.goto('https://localhost:3000/api/sign-up');

    // Aspetta che l'elemento con l'id '#submitAuth' diventi visibile
    await page.waitForSelector('#submitAuth', { visible: true });

    await page.type('#nome', 'Alessio');
    await page.type('#cognome', 'Viola');
    await page.type('#email', 'alessioviola04112001@libero.it');
    await page.type('#username', 'AleViola01');
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
    
    expect(errorMessage).to.equal("Username già esistente")
  });

  it('should fail registration if password != conferma_password', async function() {
    await page.goto('https://localhost:3000/api/sign-up');

    // Aspetta che l'elemento con l'id '#submitAuth' diventi visibile
    await page.waitForSelector('#submitAuth', { visible: true });

    await page.type('#nome', 'Alessio');
    await page.type('#cognome', 'Viola');
    await page.type('#email', 'alessioviola04112001@libero.it');
    await page.type('#username', 'AleViola');
    await page.type('#password', 'password');
    await page.type('#conferma_password', 'password123');

    // Fai clic sull'elemento solo dopo che è diventato visibile
    await page.click('#submitAuth');

    // Aspetta che l'elemento '#error-message' diventi visibile
    await page.waitForSelector('#error-message', { visible: true });

    // Aspetta che la navigazione si completi
    //await Promise.all([
    //  page.waitForNavigation({ waitUntil: 'networkidle0' }),
    //]);
    
    // Verifica il risultato atteso prendendo la tringa contenuta nel campo di errore mostrato all'utente 
    const errorMessage = await page.evaluate(() => {
      const errorMessageElement = document.querySelector('#error-message');
      return errorMessageElement.textContent;
    });
    
    expect(errorMessage).to.equal("password e conferma_password diverse")
  });

});
