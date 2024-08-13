//Nodemailer: 

const nodemailer = require("nodemailer");

//Transporte de nodemailer: 

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth:{
        user: "testjolav@gmail.com",
        pass: "jzxb vjlq qqrs ejuz"
    }
})

module.exports= transport;