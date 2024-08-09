const ticketServices= require("../repository/tickets.repository.js");
const tData = new ticketServices();
const ProductServices= require("../repository/products.repository.js");
const pData = new ProductServices();
const cartServices = require("../repository/cart.repository.js");
const cData = new cartServices();


class ticketController{

    async purchasedTicket(req,res){
        try {
            const { cid } = req.params;
            const Purchaser = req.user.email; 

            if (!cid || !Purchaser) {
                return res.status(400).send({ success: false, message: "Datos insuficientes para procesar la compra" });
            }

            const cart = await cData.getCartByID(cid);

            if(!cart){
                return res.status(404).send({ success: false, message: "Carrito no encontrado" });
            }

            let totalAmount = 0;
            const productsNotProcessed = [];

            console.log(cart.message._id)
            console.log(req.user.email)

            // Calculamos el monto total de la compra sumando el precio de cada producto en el carrito
            for (const item of cart.message.products) {
                const product = await pData.getProductsByID(item.id_prod);
                console.log(product.message)
                if (product.success) {
                    totalAmount += product.message.price * item.quantity;
                 // Actualizar el stock del producto
                 const updateStockResult = await pData.updateStock(item.id_prod, item.quantity);
                 if (!updateStockResult.success) {
                     productsNotProcessed.push(item.id_prod);
                 }
             } else {
                 productsNotProcessed.push(item.id_prod);
             }
         }

            console.log(cart.message.products)


            if (!isNaN(totalAmount)) {
                const data = {
                    code: Math.random().toString(36).substr(2, 9).toUpperCase(),
                    amount: totalAmount,
                    purchaser: req.user.email
                };
                // Guardar el ticket en la base de datos
                const ticketResult = await tData.createTicket(data);
            
                if (!ticketResult.success) {
                    return res.status(500).send({ success: false, message: ticketResult.message });
                }
            

                // Limpiar el carrito después de la compra
                const clearCartResult = await cData.clearCart(cid);
                if (!clearCartResult.success) {
                    return res.status(500).send({ success: false, message: clearCartResult.message });
                }
                // Devolver una respuesta con el resultado de la compra
                return {
                    success: true,
                    message: "Compra procesada",
                    ticket: ticketResult,
                    productsNotProcessed: productsNotProcessed
                };
            } else {
                return res.status(500).send({ success: false, message: "El monto total no es un número válido." });
            }

           
        
        } catch (error) {
           throw error
        }
    }
}

module.exports= ticketController;