const express =require ("express"); 
const ProductManager= require("../controllers/ProductManager.js");
const CartModel = require("../models/carts.model.js");
const messageModel = require("../models/messages.model.js");
const CartManager = require("../controllers/CartManager.js");

//FAKER:
const generateProducts = require("../utils/faker.js");
//controller: 
const productController= require("../controllers/products.controller.js");
const pData= new productController();
//middleware Users: 
const AllowedUser = require("../controllers/checkRoles.js");

//DTO: 
const userDTO = require("../dto/userDTO.js")

const passport = require("passport")
const viewsRouter = express.Router();
const productData = new ProductManager();
const cartData = new CartManager();

const cartController = require("../controllers/cart.controller.js");
const ticketController = require("../controllers/ticket.controller.js");
const cData = new cartController();
const tData= new ticketController();

viewsRouter.get("/products", passport.authenticate("jwt", {session:false}), AllowedUser('user'), async (req,res)=>{

    try{
        const products= await pData.getP(req,res);

        const cart = req.user.cart.toString();

        const cartID = await CartModel.findById(cart); 

        console.log("carrito!!!", req.user.cart.toString())

        let cartCount = 0;

        if(cartID && cartID.products){
            cartID.products.forEach(product => {
                cartCount += product.quantity;
            });
            // cartCount = cartID.products.length;
        }

        const user= {
            cart: cart,
            cartCount: cartCount,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            rol: req.user.rol
        };
        console.log(user)

        //enviamos la información a la vista
        res.render("products", 
        {productos: products, user: user});
    }catch(error){
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({error: "Error interno del servidor"});
    }
    
});

viewsRouter.get("/home", passport.authenticate("jwt", {session:false}), async(req,res)=>{
    const user= {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        rol: req.user.rol
    };

    res.render("home", {user: user});
})

viewsRouter.get("/carrito", async (req, res) => {
    try {
        // Llamamos la información del carrito desde el controlador
        await cData.getCartsViews(req, res);

        // No es necesario hacer nada más aquí, la función getCartsViews
        // manejará la respuesta al cliente.
    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

viewsRouter.get("/realtimeproducts",passport.authenticate("jwt", {session:false}), AllowedUser('admin'), async (req,res)=>{

    try{
        //const products = await productData.getProducts();
        const products= await pData.getP(req,res);

        console.log(products.payload)

        res.render("realTimeProducts", {productos: products});
    }catch(error){
        req.logger.error(`Error al obtener productos en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({error: "Error interno del servidor"});
    }
    
})

viewsRouter.get("/chat",passport.authenticate("jwt", {session:false}), AllowedUser('user'), async (req,res)=>{
    try{
        //Mostramos los mensajes
        const messages = await messageModel.find();
        //res.status(200).send(messages);
        res.render("chat", {user: messages})
    }catch(error){
        req.logger.error(`Error al obtener los mensajes en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(400).send({respuesta:"No se ha logrado conseguir los mensajes", mensaje: error})}   
}
)

viewsRouter.post("/chat", async (req,res)=>{
    const {user, message} = req.body;

    try{
        //Esperamos el nombre del usuario
        const users = await messageModel.find({user});
        if(users.length === 0){
            //Creamos el mensaje que nos acaba de enviar el usuario en nuestra DB
            const mssUser =await messageModel.create({user, messages: [{message}]})
            res.status(200).send({respuesta: 'Se ha guardado el mensaje del usuario', mensaje: mssUser})
        }else{
            //Pusheamos el mensaje
            users[0].messages.push({message})
            res.status(200).send({respuesta:"Se ha guardado exitosamente su usuario y mensaje", mensaje: users})
            await users[0].save()
        }


    }catch(error){
        req.logger.error(`error en ${req.url} - ${new Date().toLocaleTimeString()}`)
        res.status(400).send({respuesta:"No se ha logrado guardar los datos", mensaje: error})}
})


viewsRouter.get("/register", async (req,res)=>{
        res.render("register")
})

viewsRouter.get("/login", async (req, res)=>{
        res.render("login")
})

viewsRouter.get("/current",passport.authenticate("jwt", {session:false}), async (req, res)=>{
   try {
    const {first_name, last_name, email, rol} = req.user;

    const user = new userDTO(first_name, last_name, email, rol);

    res.render("current", {user:user});
   } catch (error) {
    req.logger.error(`Acceso denegado en ${req.url} - ${new Date().toLocaleTimeString()}`)
    res.status(401).send("Acceso denegado.");
   }
   
    
})


viewsRouter.post("/carts/:cid/products/:pid", passport.authenticate("jwt", { session: false }),AllowedUser('user'), async (req, res) => {
    try {  
       await cData.addCPID(req,res);
       res.redirect("/products"); // Redirige a la página de productos después de agregar al carrito
    } catch (error) {
        req.logger.error(`Error en ${req.url} - ${new Date().toLocaleTimeString()}`)
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

// Escucha la solicitud de eliminar el carrito
viewsRouter.post("/carrito/:cid", async (req, res) => {
    try {
        // Obtener el CID del cuerpo de la solicitud
        const { cid } = req.body;

        // Llama al controlador deleteC para eliminar el carrito
        const deleteCartResponse = await cData.deleteC(req, res, cid);

        res.redirect("/carrito")
    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

viewsRouter.post("/carts/:cid/products/:pid/delete", async(req, res)=>{
    try {
        const {cid, pid} = req.body;

        await cData.deleteCPID(req,res,cid,pid);

        res.redirect("/carrito");
    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({ error: "Error interno del servidor" });
    }
})

viewsRouter.post("/carts/:cid/purchase",passport.authenticate("jwt", { session: false }),AllowedUser('user'), async(req,res)=>{
    const {cid} = req.params;
    console.log(cid)
   const purchase= await tData.purchasedTicket(req,res,cid);

   if(purchase.success) {
    
    const ticketData = JSON.parse(JSON.stringify(purchase.ticket.message));
    const user= req.user.first_name;

    console.log("user",user);

    console.log("ticket", ticketData)
    
    res.render("purchase", { user: user, ticket: ticketData });
} else {
    req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
    res.status(500).send({ error: "Error interno del servidor" });
}

})

viewsRouter.get("/mockingproducts", async(req,res)=>{
    const products= [];

    for(let i = 0; i < 100; i++){
        products.push(generateProducts());
    }

    res.json(products)
})

module.exports = viewsRouter;