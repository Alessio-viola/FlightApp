const express = require('express');
const router = express.Router();

const chatModel = require('./../models/Chat')

router.get("/chat",(req,res)=>{
  res.sendFile('chatgptPage.html', {root: __dirname + "/../views/chatgptPage/"})
})

router.post("/message-processing", async (req, res) => {
  const message = req.body.message; // Analizza la richiesta
  console.log(message);

  const maxTokens = 1000; // Limite massimo di token per risposta

  const response = await chatModel.runCompletion(message, maxTokens); // Elabora la risposta
  
  console.log(response)

  //salvo all'interno del DB le domande e le risposte 
  let email

  if(req.user || req.session.user){//se l'utente è loggato
    if(req.user){
        email = req.user.email;
    }
    else{
        email = req.session.user;
    }

    await chatModel.insertMessage(email,message,response);

    res.status(200);
  }

  res.send(response); // Invia la risposta
});

router.get("/get-chat",async (req,res)=>{
    
    if(req.user == undefined && req.session.user == undefined) return ; //in caso di utente non registrato
    let email
    if(req.user){
        email = req.user.email
    }else {email = req.session.user}
    
    if(email != undefined){

      const chat = await chatModel.getChat(email)
      console.log(chat)
      return res.send(chat)
    }
    
})

router.get("/delete-chat",async (req,res)=>{
    
    if(req.user==undefined && req.session.user==undefined) return ; //in caso di utente non registrato
    let email
    if(req.user){
        email = req.user.email
    }else {email = req.session.user}
    
    let result = undefined

    if(email != undefined){
        
      result = await chatModel.deleteChat(email)
      
    }

    return res.send(result)
})

// Esporta il router
module.exports = router;