const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    code:{ 
        type: String,
    },
    purchase_datetime:{
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number
    },
    purchaser: {
        type: String
    }
}, {versionKey: false});

const TicketModel = mongoose.model('tickets', ticketSchema);

module.exports= TicketModel;

