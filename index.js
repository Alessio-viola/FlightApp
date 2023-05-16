const express = require('express')
const app = express()

const {Client} = require('pg');

// middleware che serve i file statici contenuti all'interno della directory public
app.use(express.static("./"))
app.use(express.static("./src/"))

const constants = require("./configuration");

//gestione dell'interazione tra applicazione e database PostgreSQL
const connectionString = constants.connectionString;
const client = new Client({
    connectionString: connectionString
});
client.connect();



app.listen(3000);