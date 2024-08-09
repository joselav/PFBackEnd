const winston = require("winston");

const levels = {
    level: {
        fatal: 0,
        error: 1, 
        warning: 2, 
        info: 3, 
        http: 4,
        debug: 5
    },
    colors: {
        fatal: "red",
        error: "magenta",
        warning: "yellow",
        info: "blue",
        http: "green",
        debug: "white"
    }
}

const logger = winston.createLogger({
    levels: levels.level,
    transports:[
        new winston.transports.Console({
            level: "debug",
            format: winston.format.combine(winston.format.colorize({colors: levels.colors}), winston.format.simple())
        }),
        new winston.transports.File({
            filename: "./errors.log", 
            level: "warning", 
            format: winston.format.simple()
        })
    ]
})

const addLogger= (req, res, next) =>{
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`)
    next()
}

module.exports= addLogger;