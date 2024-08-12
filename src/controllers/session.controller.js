const SessionServices = require("../repository/sessions.repository.js");
const sessions = new SessionServices;

//jwt
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv");
dotenv.config();

const {createHash, validatePassword} = require("../utils/bcrypt.js")

class SessionController{

    async register(req, res){
       //Pedimos la información, enviada del formulario, desde el body
    const {first_name, last_name, age, email, password} = req.body;

    try {
        const passHash = createHash(password);
        //Creamos el usuario en nuestra base de datos y guardamos los datos. 
        const createUser = await sessions.createUser({first_name, last_name, age, email, password: passHash});

        createUser.save()

        const token = jwt.sign({email}, process.env.JWTSecret , {expiresIn:"1h"});

        //Mandamos cookie como Token:
        res.cookie("coderCookieToken", token, {
            maxAge: 3600000, //Le decimos que su duración máxima es de una hora.
            httpOnly: true //La cookie solo se puede acceder por HTTP.
        })

        //Redirigimos a la página de productos: 
        res.redirect("/home");
        
    } catch (error) {
        res.status(500).send("Error interno del servidor");
        console.log(error)
    }

    }


    async login(req,res){
                //Pedimos los datos desde el body
        const {email, password} = req.body;

        try {
            //Nos aseguramos que el email enviado sea identico al que nos ha pasado el usuario
            const user = await sessions.loginUser({email:email});


            if(!user){
            res.status(404).send("El usuario no se ha encontrado");
            }

                //Si no existe la contraseña o es inválida, enviamos error: 
                if(!validatePassword(password, user)){
                console.log("Contraseña incorrecta");
                return res.status(401).send("Contraseña incorrecta")
                }

                ///Modificamos última actividad del usuario.
                user.last_activity= Date.now();
                await user.save()
            
                const token = jwt.sign({email}, process.env.JWTSecret , {expiresIn:"1h"});

                //Mandamos cookie como Token:
                res.cookie("coderCookieToken", token, {
                    maxAge: 3600000, //Le decimos que su duración máxima es de una hora.
                    httpOnly: true //La cookie solo se puede acceder por HTTP.
                })

                
                //Y también redirigimos al usuairo a la siguiente página
                res.redirect("/home");

        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    async logout(req,res){
        res.clearCookie("coderCookieToken")
        res.redirect("/login")
    }

}

module.exports = SessionController;