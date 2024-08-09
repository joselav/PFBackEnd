const CartModel = require("../models/carts.model.js");
const ProductModel = require("../models/products.model.js")
const mongoose = require('mongoose');


class CartManager{

    //Función para mostrar todo lo que hay en los carritos
    async getCartAll(){
        //con la función find lo que hacemos es devolver directamente todos los productos, en caso de solo querer uno se coloca en el ()
        const cartShow = await CartModel.find();

        //si no existe o no se logra leer cartShow, enviamos mensaje de error
        if(!cartShow){
            return{success: false, message: "No se ha logrado conseguir los carritos"} 
        }

        //si no, enviamos el mensaje con la información correcta
        return{success: true, message: cartShow}
    }

    //El getCartByID deberá listar los productos que pertenezcan al carrito con el parámetro cid proporcionados.
    async getCartByID(id){
        //Utilicé la misma lógica que el ProductManager. 

        const cartID = await CartModel.findById(id);

        //Si o se encuentra, se manda el mensaje.
        if(!cartID){
            req.logger.error(`No hay producto existente con ese número de ID en ${req.url} - ${new Date().toLocaleTimeString()}`);
            return {success: false, message:'NOT FOUND. No hay producto existente con ese número de ID.'}
        }

        //Si se encuentra, se mande el mensaje y el array del carrito que se buscó.
        return {success:true, message: `Se ha encontrado el producto con id ${cartID.id}: ${cartID}`};
    };



// addCart --> deberá crear un nuevo carrito con la siguiente estructura:
// Id:Number/String (autoincrementable);  // products: Array que contendrá objetos que representen cada producto
    async addCart(){
      try{
        //especificamos la estructura: 
        const newCart = new CartModel({product: []});

        await newCart.save();
        return {success: true, message: `Carrito con id ${newCart.id} creado exitosamente en el carrito`};


    }catch(error){
        req.logger.error(`No se ha logrado crear carrito en ${req.url} - ${new Date().toLocaleTimeString()}`);
        return {success: false, message: `No se ha logrado crear el carrito`};
    }
    };


    //La función addProductsToCart deberá agregar el producto al arreglo “products” del carrito seleccionado.
    //cid ---> id del carrito 
    //pid ---> id del producto
    async addProductsToCart(cid, pid, quantity) {
        try {
            // Buscamos el carrito por su ID
            const cart = await CartModel.findById(cid);
            
            // Buscamos el índice del producto en el carrito
            const prodIndex = cart.products.findIndex(prod => prod.id_prod.equals(pid));
            
            if (prodIndex !== -1) {
                // Si el producto ya está en el carrito, sumamos la cantidad
                cart.products[prodIndex].quantity = quantity;
            } else {
                // Si el producto no está en el carrito, lo añadimos al arreglo de productos
                cart.products.push({ id_prod: pid, quantity: quantity });
            }
    
            console.log(cart.products);
    
            // Marcamos el carrito como modificado
            cart.markModified("products");
            
            // Guardamos los cambios en la base de datos
            await cart.save();
    
            return { success: true, message: `El producto con id ${pid} se ha agregado correctamente.` };
        } catch (error) {
            req.logger.error(`No se ha podido agregar el producto al carrito en ${req.url} - ${new Date().toLocaleTimeString()}`);
            return { success: false, message: 'No se ha podido agregar el producto al carrito.' };
        }
    }
    
    //La fucnión deleteProductsInCart debería responder a la ruta DELETE api/carts/:cid/products/:pid que, a su vez, deberá eliminar del carrito el producto seleccionado.

    async deleteProductsInCart(cid,pid){

        //$pull se utiliza para eliminar elementos de un array que cumplan ciertos criterios.
        //En este caso, se utiliza en combinación con findOneAndUpdate para eliminar un producto específico del array de productos dentro de un documento de carrito.
        const deleteProd = await CartModel.findOneAndUpdate({_id:cid},
                                                             {$pull:{products:{ "id_prod":pid}}},
                                                             {new: true});


        //Si no se logra leer o no hay nada dentro del carrito, enviamos un mensaje de error
        if(!deleteProd){
            req.logger.error(`Producto no encontrado o inexistente en ${req.url} - ${new Date().toLocaleTimeString()}`);
            return {success: false, message: `Producto no encontrado o inexistente.`}
        }

        //caso contrario, enviamos mensaje de exito
        return {success: true, message: 'Producto eliminado exitosamente', deletedProd: deleteProd};
    }
    

    //La función deleteCart deberá responder a lo que se pide para la ruta DELETE api/carts/:cid, que a su vez deberá eliminar todos los productos del carrito 
    async deleteCart(cid){
        //Buscamos por id y lo eliminamos, con la misma lógica que ya nos brinda mongo, pero pasandole correctamente el dato que se está buscando. En este caso el cid === el id del carrito (que nos pasaron desde la ruta). 
        const deleteC = await CartModel.findByIdAndDelete(cid);


        //Si no se logra leer o no existe el cid, enviamos mensaje de error:
        if(!deleteC){
            req.logger.error(`Producto no encontrado o inexistente en ${req.url} - ${new Date().toLocaleTimeString()}`);
            return {success: false, message: `Producto con id ${deleteC.id} no encontrado o inexistente.`}
        }


        //sino un mensaje de exito
        return {success: true, message: 'Producto eliminado exitosamente', deletedCart: deleteC};
    }


    //La fucnión updateCart debe´ra responder a la ruta PUT api/carts/:cid, que a su vez deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba.
    async updateCart(cid, id_prod, quantity){
        //Primero buscamos por id el carrito, para asegurarnos que exista
        const cart = await CartModel.findById(cid);
    

        //Si no se logra encontrar o no existe, enviamos un mensaje de error
        if(!cart){
          req.logger.error(`Carrito no encontrado en ${req.url} - ${new Date().toLocaleTimeString()}`);
          return {success:false, message: 'Carrito no encontrado'};
        }
    
        //Ahora creamos el id_prod en un ObjectID para poder compararlo correctamente con el id que ya tenemos en nuestra base de datos;
        const ppid = new mongoose.Types.ObjectId(id_prod)

        //Acá aplicamos la lógica para asegurarnos que el id_prod que enviamos es el mismo que ya se encuentra en la base de datos, utilizando la constante ppid en donde convertimos a id_prod en un objectId, en lugar de solo pid. 
        const prodIndex = cart.products.findIndex((prod)=> prod.id_prod.equals(ppid));
    
        //Si prodIndex es -1 signidica que no existe el id_prod en nuestra base de datos, o que no se ha encontrado, entonces enviamos mensaje de error
        if(prodIndex == -1){return {success: false, message: 'Producto no encontrado'};}
    
        //Acá configuramos que la cantidad del producto con id_prod que hemos enviado sea igual a la cantidad que se guardará
        cart.products[prodIndex].quantity = quantity;
    
        //Esperamos a que guarde la información
        await cart.save();

        //y enviamos mensaje de éxitos
        return {success: true, message: `Carrito actualizado con éxito ${cart}`}
        
    }

    //La función updateProdInCart deberá responder a la ruta PUT api/carts/:cid/products/:pid que, a su vez, deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body
    async updateProdInCart(cid, pid, quantity) {
        try {
            //verificamos que el carrito exista
            const cart = await CartModel.findById(cid);

            //si no existe, enviamos mensaje de error
            if (!cart) {
                return { success: false, message: 'Carrito no encontrado' };
            }

            //Como en el anterior caso, convertimos el pid en un objectID para que se pueda comparar correctamente con la información ya guardada en la base de datos ((MongoDB trabaja con ObjectId))
            const ppid = new mongoose.Types.ObjectId(pid);
    
            //Verificamos que el pid exista con alguno dentro de la base de datos
            const productIndex = cart.products.findIndex(prod => prod.id_prod.equals(ppid));

            //si no existe, enviamos mensaje de error
            if (productIndex === -1) {
                return { success: false, message: 'Producto no encontrado en el carrito' };
            }
    
            //Si existe, nos aseguramos que la información que nos pasen (en este caso la cantidad), sea la misma que se guardará
            cart.products[productIndex].quantity = quantity;
    
            //esperamos a que se guarde correctamente la información
            await cart.save();
    
            //Enviamos mensaje de éxitos
            return { success: true, message: 'Cantidad del producto actualizada correctamente' };
        } catch (error) {
            req.logger.error(`Error al actualizar el producto en el carrito en ${req.url} - ${new Date().toLocaleTimeString()}`);
            return { success: false, message: 'Error al actualizar el producto en el carrito' };
        }
    }

}

//export default CartManager;

//versión sin importación ("type": "module"):
module.exports = CartManager;