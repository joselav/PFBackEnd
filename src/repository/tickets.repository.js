const ticketModel = require("../models/ticket.model.js");

class ticketServices{

    async createTicket(data){
        try {
            const newTicket = await ticketModel.create(data);
            return {success: true, message: newTicket}
        } catch (error) {
            console.error("Error al agregar producto:", error);
                return { success: false, message: "Ha ocurrido un error al agregar el producto. Por favor, inténtalo de nuevo más tarde." };
        }}

}

module.exports= ticketServices;