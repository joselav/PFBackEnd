AllowedUser = (role) =>{

    return async (req, res, next) =>{
      if(req.user && req.user.rol === role){
            next()
        }else{
            req.logger.error(`Acceso denegado en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(403).send("Acceso denegado");
        }
    }
}

module.exports= AllowedUser;