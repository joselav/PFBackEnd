const ProductServices = require("../repository/products.repository.js");
const productData = new ProductServices();

class ProductController{

    async getP(req,res){
          try{//Definimos el Limit como 10 por defecto, o el que nos pase el usuario.
            const limit = req.query.limit || 10;
            //Definimos que nos muestre la página 1 por defecto, o la que nos pase el usuairo.
            const page = req.query.page || 1;
            //En el caso que nos pidan la categoría, la que nos pidieron o por defecto nada y nos enseña todos los productos. 
            const category = req.query.category || "";
            //Definimos que nos muetre los productos de forma ascendente por defecto, o lo que nos pida el usuario.
            const sort = req.query.sort || "asc";

            //Esperamos la función de la clase de ProductManager y le pasamos los datos:
            const product = await productData.getProducts(limit,page,sort, category);

            //Si funciona, es decir, si sucess== true, se envía la respuesta.
            if(product.success){ 
                const pdt = product.message;
                return pdt } 
                else {
                throw new Error("Error al cargar datos");}
            }
            catch(error){
                req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
                throw error;
            }
    }

    async getPViews(req,res){
        try{//Definimos el Limit como 10 por defecto, o el que nos pase el usuario.
          const limit = req.query.limit || 10;
          //Definimos que nos muestre la página 1 por defecto, o la que nos pase el usuairo.
          const page = req.query.page || 1;
          //En el caso que nos pidan la categoría, la que nos pidieron o por defecto nada y nos enseña todos los productos. 
          const category = req.query.category || "";
          //Definimos que nos muetre los productos de forma ascendente por defecto, o lo que nos pida el usuario.
          const sort = req.query.sort || "asc";

          //Esperamos la función de la clase de ProductManager y le pasamos los datos:
          const product = await productData.getProducts(limit,page,sort, category);

          //Si funciona, es decir, si sucess== true, se envía la respuesta.
          if(product.success){ 
            // console.log('Productos obtenidos:', product.message);
              return product.message } 
              else {
              throw new Error("Error al cargar datos");}
          }
          catch(error){
              req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
              throw error;
          }
  }


    async getPID(req,res){
         //Pedimos el parametro del id, en este caso como se pide en la ruta: 'pid'.
        const id = req.params.pid;
        const product = await productData.getProductsByID(id);

        //Si es exitoso, se muestra un mensaje, si no, se muestra otro, que ya los he expecificado en la clase. 
        if(product.success){
        res.status(200).send(product.message);
        }else {
        req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(400).send(product.message);
        }
    }

    async addPID(req,res){
          //Primero, pedimos todos los campos desde el req.body:
        const data = req.body; 
        //Ahora definimos la constante para que se guarden con las características especificadas en el ProductManager:
        const product = await productData.addProduct(data);

        if(product.success){
            res.status(200).send(product.message);
        }else{
            req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(product.message );
        }
    }

    async updatePID(req,res){
         //Al igual que en el get/:pid, pedimos el id como parámetro:
        const {pid} = req.params;
        //Pedimos los datos que ya están guardados del producto con req.body;
        const dataProd = req.body;
        //Ahora enviamos la información al ProductManeger para que controle con sus especificaciones: 
        //Usamos parseInt para especificar que se espera un número. 
        const product = await productData.updateProduct(pid, dataProd);

        if(product.success){
            res.status(200).send(product.message);
        }else{
            req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(product.message);
        }
    }

    async deletePID(req,res){
         //Pedimos el Id como parámetro: 
        const {pid} = req.params;
        //Enviamos la información al ProductManager para que controle las especifícaciones definidas ahí.
        const productDelete = await productData.deleteProduct(pid);
        
        if(productDelete.success){
            res.status(200).send(productDelete.message);
        }else{
            req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(productDelete.message);
        }
    }

}

module.exports = ProductController;