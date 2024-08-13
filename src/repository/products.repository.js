const ProductModel = require("../models/products.model.js");

class ProductServices{
    //El método getProducts debe leer el archivo de productos y devolver todos los productos en formato de arreglo.
    async getProducts(limit, page, sort, category){
        //definimos que query por defecto esté vacío
        let query = {}

        //En caso de que nos envíen la categoría desde las rutas, cambiamos a que query sea igual a categoría
        if(category){
            query.category = category; 
        }

        //Esperamos a que paginate reciba la información que estamos pidiendole
        const products = await ProductModel.paginate(query, {limit, page, sort:{price: sort === "desc" ? -1 : 1 }});



        //pasamos la infomación a Object para que se pueda leer correctamente la información y compararla con la de la base de datos
        const prod = products.docs.map(pr =>{
            const {_id, ...rest} = pr.toObject();
            // return rest;
            return { id: _id.toString(), ...rest };
        })


        //Si no existe información en lo que se nos ha pedido, enviamos mensjae de error
        if(!products){
             return {sucess:false, message: "No se han encontrado productos"}; }


        //creamos como se debe mostrar la información;
        //El método GET deberá devolver un objeto con el siguiente formato:
        // {
        // 	status:success/error
        // payload: Resultado de los productos solicitados
        // totalPages: Total de páginas
        // prevPage: Página anterior
        // nextPage: Página siguiente
        // page: Página actual
        // hasPrevPage: Indicador para saber si la página previa existe
        // hasNextPage: Indicador para saber si la página siguiente existe.
        // prevLink: Link directo a la página previa (null si hasPrevPage=false)
        // nextLink: Link directo a la página siguiente (null si hasNextPage=false)
        // }

        const resultado = {
            status: products.status,
            payload: prod,
            hasNextPage: products.hasNextPage,
            hasPrevPage: products.hasPrevPage,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            totalPages: products.totalPages,
            prevLink: products.hasPrevPage ? `/api/products?page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `/api/products?page=${products.nextPage}` : null
        }


        //Devolvemos el mensaje con la información correspondiente
        return {success: true, message:resultado}
    }

    async getProductsByID(id){
        //Esta función debe buscar en el arreglo el producto que coincida con el ID que se indica

        const productID = await ProductModel.findById(id);

        if(!productID){
            return {success: false, message: 'NOT FOUND. No hay producto existente con ese número de ID.'}
        }

        const data = JSON.stringify(productID)

        //Le apliqué un sucess= true y un Message para poder llamarlo más fácil en el app.js. También le agregué un JSON.Stringify porque sino salia [object Object].
        return {success:true, message: productID};
    }

    async getPPremium({ limit, page, sort, category, owner }){
        try {
            const query = {};
    
            if (category) {
                query.category = category;
            }
    
            if (owner) {
                query.owner = owner; // Filtrar por el email del propietario
            }
    
            const options = {
                page,
                limit,
                sort: { price: sort === "asc" ? 1 : -1 } // Ordenar por precio
            };
    
            const result = await ProductModel.paginate(query, options);
    
            return { success: true, message: result };
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return { success: false, message: "Error al obtener productos." };
        }
    }

    async addProduct({title, description, price, thumbnail, code, category, stock, owner}){

        try{
    
            const validate = title && description && price && code && category && stock && owner;
                //Verificación que expresa que si no existe alguno de los campos, no se agregue el producto hasta que no se complete. 
                if(!validate){
                    console.error("no ha sido posible subir producto, controla". error)
                }
           
             //Verigicación para que el código sea único.
            //El método "some()" sirve para verificar si al menos un elemento en el arreglo cumple con la condición expecificada. 
            //En este caso si el código ingresado en el nuevo producto ya existe en la base de datos, por ejemplo. 
            //data llama a la constante que lee la ruta "products" hace referencia al nombre del arreglo dentro de la ruta.
    
            const productExist = await ProductModel.findOne({code: code})
    
            if(productExist){
                return {success: false, message: 'El código (code) ingresado ya existe en nuestra base de datos. Por favor, ingrese uno que sea único.'}
            }
    
             
            //Recibo los datos y los ordeno dentro de un nuevo objeto de productos. 
            const newProduct = await ProductModel.create({
                title, description, price, thumbnail, code, stock,category, status:true, owner
            }); 
    
            return {success: true, message: `El producto se ha creado exitosamente ${newProduct}`}
        }
    
            catch(error){
                console.error("Error al agregar producto:", error);
                return { success: false, message: "Ha ocurrido un error al agregar el producto. Por favor, inténtalo de nuevo más tarde." };
            }
    }

    async updateProduct(id,product){
        //El producto a actualizar primero debe leer el archivo, buscar el ID al que se llama y tomar acción desde ahí en adelante.
        const updateProdu = await ProductModel.findByIdAndUpdate(id, product);

        if(!updateProdu){
        console.log("No se ha encontrado producto.")
        return null
        }       

    
        return {success: true, message: `Se ha actualizado el producto exitosamente: ${updateProdu}`};

    }

    async deleteProduct(id){
        //En este caso, se nos pide que; dependiendo que ID se llame, el producto se elimine completamente
        const deleteProd = await ProductModel.findByIdAndDelete(id);

        if(!deleteProd){
            return {success: false, message: `Producto con id ${deleteProd.id} no encontrado o inexistente.`}
        }

        return {success: true, message: 'Producto eliminado exitosamente', deletedProduct: deleteProd};
    }

    async updateStock(pid, quantity){
       try{ const product = await ProductModel.findByIdAndUpdate(pid,  { $inc: { stock: -quantity } }, // Resta la cantidad de stock
        { new: true }) // Devuelve el documento actualizado);

        if (!updatedProduct) {
            return { success: false, message: "No se encontró el producto para actualizar el stock" };
        }

        return { success: true, message: "Stock actualizado correctamente" };
        } catch (error) {
        console.error("Error interno al actualizar el stock del producto:", error);
        return { success: false, message: "Error interno al actualizar el stock del producto" };
        }
        
       
    }
}

module.exports = ProductServices;