AllowedUser = (roles) =>{

    return async (req, res, next) =>{
      if(req.user){
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (allowedRoles.includes(req.user.rol)) {
            return next();
        }
        }else{
            req.logger.error(`Acceso denegado en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(403).send("Acceso denegado");
        }
    }
}

module.exports= AllowedUser;