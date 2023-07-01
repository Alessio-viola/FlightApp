const { Client } = require('pg');
const constants = require('./../configuration');

//SET INTERAZIONE CON IL DB 
const connectionString = constants.connectionString;
const client = new Client({
  connectionString: connectionString
});
client.connect();

//OPENAI API
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

//configuration OPENAI API KEY 
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

//function to get response from the API 
async function runCompletion(prompt, maxTokens) {
  let response = "";

  try {
    while (true) {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: maxTokens,
      });

      const choiceText = completion.data.choices[0].text;
      response += choiceText;

      if (completion.data.choices[0].finish_reason === "stop") {
        break;
      }

      prompt = choiceText.trim(); // Utilizza la risposta come prompt per la prossima iterazione
      maxTokens -= completion.data.choices[0].tokens_used;
    }

    return response;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log("Hai finito le richieste possibili che puoi fare");
      await delay(3000); // Ritardo di 3 secondi prima di riprovare
      return await runCompletion(prompt, maxTokens); // Riprova la richiesta
    } else {
      console.error(error);
      return response; // Ritorna la risposta finora generata in caso di errore
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function getChat(id) {
  const query = 'SELECT * FROM chat WHERE email = $1';
  const values = [id];
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery.rows;
  } catch (error) {
    console.error('Errore durante la lettura della chat:', error);
    throw new Error('Impossibile ottenere la chat. Riprova più tardi.');
  }
}

async function deleteChat(id) {
  const query = 'DELETE FROM chat WHERE email = $1';
  const values = [id];
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery;
  } catch (error) {
    console.error('Errore durante la cancellazione della chat:', error);
    throw new Error('Impossibile eliminare la chat. Riprova più tardi.');
  }
}

async function insertMessage(id, request, response) {
  const query = 'INSERT INTO chat (email, domanda, risposta) VALUES ($1, $2, $3)';
  const values = [id, request, response];
  try {
    const resultQuery = await client.query(query, values);
    return resultQuery;
  } catch (error) {
    console.error('Errore durante l\'inserimento del messaggio:', error);
    throw new Error('Impossibile inserire il messaggio. Riprova più tardi.');
  }
}

module.exports = {
  getChat,
  deleteChat,
  insertMessage,
  runCompletion
};
