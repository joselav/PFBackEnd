const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    user: {
        type: String, 
        require: true, 
        unique:true
    }, 
    messages: [{
        date: {
            type: Date,
            default: Date.now,
        },
        message: String,
    }]
    },
    {versionKey: false});


const MessageModel = mongoose.model('messages', messageSchema);

module.exports= MessageModel;