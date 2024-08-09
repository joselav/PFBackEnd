const CartServices = require("../repository/cart.repository.js");

const cartData = new CartServices();

class CartController{
    async getCarts(req,res){
        const cart = await cartData.getCartAll();

        if(cart){
            return cart;
        }else{
            req.logger.error(`Ha ocurrido un error en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send("Ha ocurrido un error");
        }
    }

    async getCartsViews(req,res){
        try {
        const cart = await cartData.getCartAll();

        if (!cart.success) {
            return "No hay carrito";
        }


        let totalQuantity = 0;
        let totalPrice = 0;

        const cartss = cart.message;

        cartss.forEach(cart => {
            cart.products.forEach(product => {
                totalQuantity += product.quantity;
                const price = Number(product.id_prod.price);
                if (!isNaN(price)) {
                    totalPrice += product.quantity * price;
                } else {
                    req.logger.error(`Invalid price for product ID ${product.id_prod._id}: ${product.id_prod.price} en ${req.url} - ${new Date().toLocaleTimeString()}`);
                }
            });
        });

        const carts= JSON.parse(JSON.stringify(cartss));

        const response = { carts, totalPrice: totalPrice.toFixed(2), totalQuantity };

        console.log(response)

        return res.render("carrito", { carrito: response });
    } catch (error) {
        req.logger.error(`Ha ocurrido un error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        return res.status(500).send("Error interno del servidor");
    }
    }

    async getCID(req, res){
        //Tomamos el Cid desde req.params:
        const {cid} = req.params;
        //Esperamos la información del CartManager:
        const cart = await cartData.getCartByID(cid);
        
        if(cart.success){
            res.status(200).send(cart.message);
        }else{
            req.logger.error(`Ha ocurrido un error en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(cart.message);
        }
    }

    async addC(req,res){
         //Este es fácil, solo esperamos al CartManager y mostramos los mensajes.
        const cart = await cartData.addCart();

        if(cart){
            res.status(200).send(cart.message)
        }else{
            req.logger.error(`Ha ocurrido un error en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(cart.message)
        }
    }


    async addCPID(req, res) {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body;
    
            // Llama a la función para agregar productos al carrito y espera su respuesta
            const prodAdd = await cartData.addProductsToCart(cid, pid, quantity);
    
            // Verifica si la operación fue exitosa
            if (prodAdd.success) {
                // Si fue exitosa, envía una respuesta 200 OK
                return prodAdd.message
            } else {
                req.logger.error(`${prodAdd.message} en ${req.url} - ${new Date().toLocaleTimeString()}`);
                // Si no fue exitosa, envía una respuesta 400 Bad Request
                return res.status(400).send(prodAdd.message);
            }
        } catch (error) {
            // Si ocurre algún error durante el proceso, envía una respuesta 500 Internal Server Error
            req.logger.error(`Ha ocurrido un error en ${req.url} - ${new Date().toLocaleTimeString()}`);
            return res.status(500).send({ error: "Error interno del servidor" });
        }
    }
    

    async updateC(req,res){
         //Pedimos el cid como parámetro
        const {cid} = req.params;
        //Pedimos el id_prod y la cantidad como información desde el cuerpo
        const {id_prod, quantity} = req.body;

        //Enviamos los datos recibidos al cartManeger
        const cartUpdate = await cartData.updateCart(cid, id_prod, quantity);

        //Controlamos los errores y enviamos mensaje
        if(cartUpdate.success){
            res.status(200).send(cartUpdate.message)
        }else{
            req.logger.error(`${cartUpdate.message} en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(cartUpdate.message)
        }
    }

    async updateCPID(req, res){
         //Pedimos el cid y pid como parametros
        const {cid, pid} = req.params; 
        //Pedimos la cantidad desde el body
        const {quantity} = req.body;

        //Enviamos la información al cartManager
        const prodUpdate = await cartData.updateProdInCart(cid, pid, quantity);

        //Mostramos los mensajes
        if(prodUpdate.success){
            res.status(200).send(prodUpdate.message)
        }else{
            req.logger.error(`${prodUpdate.message} en ${req.url} - ${new Date().toLocaleTimeString()}`);

            res.status(400).send(prodUpdate.message)
        }
    }

    async deleteC (req,res){
         //Pedimos el cid como parámetro
        const {cid} = req.params;
        //Enviamos la información al cartManager
        const deleteCart = await cartData.deleteCart(cid);

        //Mostramos los mensajes correspondientes
        if(deleteCart.success){
            res.status(200).send(deleteCart.message);
        }else{
            req.logger.error(`${deleteCart.message} en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(deleteCart.message);
        }
    }

    async deleteCPID(req,res){
        //Pedimos el cid y pid como parámetros
        const {cid, pid} = req.params;
        
        //Los enviamos al cartManager para controlar errores
        const deleteProdCart = await cartData.deleteProductsInCart(cid,pid);

        //Mostramos los mensajes correspondientes
        if(deleteProdCart.success){
            //res.status(200).send(deleteProdCart.message)
            return deleteProdCart.message
        }else{
            req.logger.error(`${deleteProdCart.message} en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(deleteProdCart.message)
        }
    }


}

module.exports = CartController;