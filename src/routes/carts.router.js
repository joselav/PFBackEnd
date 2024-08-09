//import { Router } from "express"; //Importamos Router desde express.
//import CartManager from "../controllers/CartManager.js"; //Llamamos al CartManager para las verifiaciones.

//versión sin importación ("type": "module"):
const express = require("express");
// const CartManager = require("../controllers/CartManager.js");
const CartController = require("../controllers/cart.controller.js");
const cartController = new CartController();

const cartRouter = express.Router(); //Definimos el cartRouter para poder llamarlo en el app.js.

//Definimos las rutas:

//Esta ruta no se pide, pero es para controlar que funcione: 
cartRouter.get('/', cartController.getCarts);

//La ruta GET /:cid deberá listar los productos que pertenezcan al carrito con el parámetro cid proporcionados.
cartRouter.get('/:cid', cartController.getCID);


//La ruta raíz POST / deberá crear un nuevo carrito con la siguiente estructura:
// Id:Number/String (A tu elección, de igual manera como con los productos, debes asegurar que nunca se dupliquen los ids y que este se autogenere).
// products: Array que contendrá objetos que representen cada producto

cartRouter.post('/', cartController.addC);


//La ruta POST  /:cid/product/:pid deberá agregar el producto al arreglo “products” del carrito seleccionado,
 cartRouter.post('/:cid/products/:pid', cartController.addCPID)

//La ruta Put /:cid/product/:pid deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body
cartRouter.put('/:cid/products/:pid', cartController.updateCPID)


//La ruta PUT /:cid deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba:
cartRouter.put('/:cid', cartController.updateC)


//La ruta DELETE api/carts/:cid/products/:pid deberá eliminar del carrito el producto seleccionado.
cartRouter.delete('/:cid/products/:pid', cartController.deleteCPID)

//La ruta DELETE api/carts/:cid deberá eliminar todos los productos del carrito 
cartRouter.delete('/:cid', cartController.deleteC)


//export default cartRouter; //exportamos cartRouter.

//versión sin importación ("type": "module"):
module.exports = cartRouter;