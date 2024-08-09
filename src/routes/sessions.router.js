const express = require("express");
const sessionRouter = express.Router();

const SessionController = require("../controllers/session.controller.js")
const sController = new SessionController();

//Importamos passport: 
const passport = require("passport");

/// Login y Registro con Passport: 

sessionRouter.post("/", sController.register)

//Iniciar sesión/ Log In
sessionRouter.post("/login", sController.login)

//Cerrar sesión/ Log Out
sessionRouter.get("/logout", sController.logout)


//github: 
sessionRouter.get("/github", passport.authenticate("github", {scope: ["user:email"]}), async (req, res)=>{
    
})

sessionRouter.get("/githubcallback", passport.authenticate("github", {failureRedirect:"/login"}), async (req, res)=>{
    //La estratégia de GitHub ya nos retornara un usuario, así que se lo pedimos: 
    req.user = req.user;
    req.login= true;
    
    res.redirect("/products");
})



module.exports = sessionRouter;


//usuario coder:

// email
// "adminCoder@coder.com"
// password
// "adminCod3r123"
