//Importamos módulos de passport: 
const passport = require("passport");
const GitHubStrategy = require("passport-github2");
const dotenv = require("dotenv");
dotenv.config();

//jwt: 
const jwt = require("passport-jwt");
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

//Importamos userModel y hasheos:
const userModel = require("../models/users.models.js")

 //cookieExtractor:

 const cookieExtractor = (req)=>{
    let token = null; 
    if(req && req.cookies){
        //si hay una cookie, la recupero
        token = req.cookies["coderCookieToken"];
    }

    return token; 

}

const initializePassport = () =>{

    const jwtOpt = {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWTSecret,
    }

    //Creamos estratégia JWT:
    passport.use("jwt", new JWTStrategy( jwtOpt, async (jwt_playload, done)=> {
        try {
            const user = await userModel.findOne({email: jwt_playload.email})

            if(!user){
                return done(null, false)
            }

            return done(null, user)
        } catch (error) {
            return done(error);
        }
    }))

    //Estratégia de GitHub: 
    passport.use("github", new GitHubStrategy({
        clientID: 'Iv1.61675a20d95dfbea',
        clientSecret:"cbd8a2bfb3690d8fe4efe197e55acdf6972fdd1f",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
    }, async(accessToken, refreshToken, profile, done)=>{

        //Nos aseguramos que estamos recibiendo bien los datos desde un console.log: 
        console.log("Perfil del usuario", profile);

        try {
            const user = await userModel.findOne({email:profile._json.email});

            //Si no está el usuario: 
            if(!user){
                const newUser = await userModel.create({
                    first_name: profile._json.name,
                    last_name: "usuario",
                    age: 18,
                    email: profile._json.email,
                    password: ""
                })

                done(null, newUser)
            }else{
                done(null, user)
            }

        } catch (error) {
            return done(error)
        }
    }))

}

   
module.exports= initializePassport;