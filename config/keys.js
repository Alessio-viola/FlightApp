require("dotenv").config();

const connectionString = require('../configuration.js').connectionString;

module.exports = {
    google: {
        clientID: process.env.GOOGLEOAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLEOAUTH_CLIENT_SECRET
    },
    postgreSQL: {
        // connectionString : 'postgresql://postgres:alessio2001@localhost:5432/progetto1'
        connectionString: connectionString
    }
}