//Importamos bcrypt:
const bcrypt = require("bcrypt");

//Creamos el hasheo => Salt es un string random, en este caso de 10 carácteres. 
const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//Validamos las contraseñas sean las mismas, es decir, la que se envió en el login y la que se encuentra en la BDD;
const validatePassword = (password, user) => bcrypt.compareSync(password, user.password);


//exportamos las dos funciones:
module.exports= {createHash, validatePassword}

