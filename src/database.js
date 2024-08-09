//Aplicamos conexión con MONGODB:
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

//creamos la conección:

mongoose.connect(process.env.MONGO_URL)
    .then(()=> console.log("Conexión con DB exitosa"))
    .catch((error)=> console.log("Error en la conexión", error))