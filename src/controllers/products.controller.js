const ProductServices = require("../repository/products.repository.js");
const productData = new ProductServices();

const transport = require("../middlewares/nodemailer.js");

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

  async getProductsPremium(req,res){
    try {
        // Definir los parámetros de paginación y filtros
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const category = req.query.category || "";
        const sort = req.query.sort || "asc";

        // Obtener el email del usuario autenticado
        const email = req.user.email;

        // Llamar al repositorio con el filtro de email
        const products = await productData.getPPremium({
            limit,
            page,
            sort,
            category,
            owner: email // Añadir el filtro por email
        });

        // Si la operación fue exitosa, enviar los productos
        if (products.success) {
            return products.message;
        } else {
            throw new Error("Error al cargar datos");
        }
    } catch (error) {
        req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
        return res.status(500).send("Error interno del servidor.");
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

        try {
               //Primero, pedimos todos los campos desde el req.body:
        const data = req.body; 
        const email= req.user.email;
        console.log("email", email);

        const Edata= { ...data, owner: email };
        //Ahora definimos la constante para que se guarden con las características especificadas en el ProductManager:
        await productData.addProduct(Edata);

        } catch (error) {
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

            if(productDelete.deletedProduct.owner != "adminCoder@coder.com"){

                const email = productDelete.deletedProduct.owner;
                await transport.sendMail({
                    from: "PF Almacen <testjolav@gmail.com>",
                    to: `${email}`,
                    subject: `Tu producto, ${productDelete.deletedProduct.title} ha sido eliminado`,
                    html:`<h1> El administrador ha eliminado tu producto<br>`
                });
            }

            return productDelete.deletedProduct;
           console.log("DATOOOOOOOOOOOOOOOOS", productDelete.deletedProduct);
        }else{
            req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(400).send(productDelete.message);
        }
    }

    async deletePIDPremium(req,res){
        //Pedimos el Id como parámetro: 
       const {pid} = req.params;
       //Enviamos la información al ProductManager para que controle las especifícaciones definidas ahí.
       const productDelete = await productData.deleteProduct(pid);
       
       if(productDelete.success){
           return productDelete.deletedProduct;
       }else{
           req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`);
           res.status(400).send(productDelete.message);
       }
   }

}

module.exports = ProductController;