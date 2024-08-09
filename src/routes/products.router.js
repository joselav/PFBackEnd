//import { Router } from "express"; ///Importamos Router desde express.
//import ProductManager from "../controllers/ProductManager.js"; //Llamamos al ProductManager.

//versión sin importación ("type": "module"):
const express = require("express");
const ProductController = require("../controllers/products.controller.js");
const productController = new ProductController();

const productRouter = express.Router(); //Definimos el ProductRouter.

//Definimos las rutas: 


//Ruta para obtener todos los productos o para obtener un límite de productos (por ejemplo, los primeros 5)
productRouter.get('/', productController.getP);

//Ruta para obtener el producto según el ID indicado. (Por ejemplo; Producto con ID 5, solo se muestra ese.)
productRouter.get('/:pid', productController.getPID)

//Ruta para agregar un producto: 
productRouter.post('/', productController.addPID);

//Ruta para actualizar producto según su número de ID: 
productRouter.put('/:pid', productController.updatePID);

//Ruta para eliminar producto según su ID:
productRouter.delete('/:pid', productController.deletePID)

//export default productRouter; //Exportamos el productRouter para poder utilizarlo y llamarlo en el app.js

//versión sin importación ("type": "module"):
module.exports = productRouter;
