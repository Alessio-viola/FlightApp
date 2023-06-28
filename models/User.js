function getPersonalInfo(id){ // id = email
    //TODO
}

function deleteUser(id){
    //TODO
}

function deleteGoogleUser(id){
    //TODO   
}

function insertUser(id,nome,cognome,username,password){
    //TODO
}

function insertGoogleUser(id){
    //TODO
}

function getPassword(id){//to use in endpoint "/reset-password"
    //TODO
}

module.exports = {
    getPersonalInfo,
    deleteUser,
    deleteGoogleUser,
    insertUser,
    insertGoogleUser,
    getPassword
  };