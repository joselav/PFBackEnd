const express =require ("express"); 
const CartModel = require("../models/carts.model.js");
const messageModel = require("../models/messages.model.js");

const userModel = require("../models/users.models.js")

const lastActivityController = require("../controllers/lastactivity.controller.js");

const LAController = new lastActivityController();

//FAKER:
const generateProducts = require("../utils/faker.js");
//controller: 
const productController= require("../controllers/products.controller.js");
const pData= new productController();
//middleware Users: 
const AllowedUser = require("../middlewares/checkRoles.js");

//DTO: 
const userDTO = require("../dto/userDTO.js")

const passport = require("passport")
const viewsRouter = express.Router();

const cartController = require("../controllers/cart.controller.js");
const ticketController = require("../controllers/ticket.controller.js");
const cData = new cartController();
const tData= new ticketController();

const cartServices = require("../repository/cart.repository.js");
const CartD = new cartServices();

//Nodemailer: 

const transport = require("../middlewares/nodemailer.js");
const premiumController = require("../controllers/premium.controller.js");

const PremiumController = new premiumController;

const updateDocs = require("../middlewares/multer.js")


viewsRouter.get("/products", passport.authenticate("jwt", {session:false}), AllowedUser(['user', 'premium']), async (req,res)=>{

    try{
        const products= await pData.getPViews(req);
        console.log('Productos para vista:', products); // Debug

        const string = products.payload;

        console.log("string", string)


        const cart = req.user.cart.toString();

        // console.log("req.user=", req.user);

        // console.log("req.user.cart=",req.user.cart)

        const cartID = await CartModel.findById(cart); 

        // console.log("carrito!!!", req.user.cart.toString())

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
        // console.log(user)

        //enviamos la información a la vista
        res.render("products", 
        {productos: products, user: user});
    }catch(error){
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({error: "Error interno del servidor"});
    }
    
});

viewsRouter.post("/products/add", passport.authenticate("jwt", {session:false}), AllowedUser('admin'), async(req, res)=>{
try {
    await pData.addPID(req,res)

    res.redirect("/realtimeproducts")
    
} catch (error) {
    req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
    res.status(500).send({error: "Error interno del servidor"});
}
})

viewsRouter.post("/products/delete/:pid", passport.authenticate("jwt", {session:false}), AllowedUser('admin'),async(req, res)=>{
    try {
        await pData.deletePID(req,res)

        res.redirect("/realtimeproducts")
        
    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send("Error del servidor");
    }
})

viewsRouter.get("/home", passport.authenticate("jwt", {session:false}), async(req,res)=>{
    const user= {
        id: req.user._id.toString(),
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        rol: req.user.rol,
        documents: req.user.documents
    };

    console.log("mostrar info usuario:", user)
    
    const users = await LAController.getActivity(req, res);


    // console.log("users aka Activity: ", users)


    res.render("home", {user: user, activity: users});
})

viewsRouter.post("/admin/deleteUser/:uid", passport.authenticate("jwt", {session: false}), AllowedUser('admin'), async (req,res)=>{
    try {
        const {uid} = req.params;

        console.log("UID recibido:", uid);

        await LAController.deleteUID(uid);

        res.redirect("/home");
    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({ error: "Error interno del servidor" });
    }
} )

viewsRouter.get("/carrito", passport.authenticate("jwt", {session: false}), AllowedUser(['user', 'premium']), async (req, res) => {
    try {
        // Llamamos la información del carrito desde el controlador
       const cart = await cData.getCartsViews(req, res);

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

viewsRouter.get("/chat",passport.authenticate("jwt", {session:false}), AllowedUser(['user', 'premium']), async (req,res)=>{
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

viewsRouter.post("/chat", passport.authenticate("jwt", {session: false}), AllowedUser(['user', 'premium']), async (req,res)=>{
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

viewsRouter.post("/carts/:cid/products/:pid/update", passport.authenticate("jwt", { session: false}), AllowedUser(['user', 'premium']), async(req,res)=>{
    try {
        // Llamamos a la función del controlador para manejar la actualización
      await cData.updateCPIDView(req, res);

    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({ error: "Error interno del servidor" });
    }
})

viewsRouter.post("/carts/:cid/clear", passport.authenticate("jwt", {session: false}), AllowedUser(['user', 'premium']), async (req, res)=> {
        try {
            const { cid } = req.params; 

            const cartId = cid; 

            await CartD.clearCart(cartId); 

            res.redirect("/carrito")

        } catch (error) {
            req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
            res.status(500).send({ error: "Error interno del servidor" });
        }
})

viewsRouter.post("/carts/:cid/products/:pid", passport.authenticate("jwt", { session: false }), AllowedUser(['user', 'premium']), async (req, res) => {
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
        await cData.deleteC(req, res, cid);

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

viewsRouter.post("/carts/:cid/purchase",passport.authenticate("jwt", { session: false }),AllowedUser(['user', 'premium']), async(req,res)=>{
    const {cid} = req.params;
    console.log(cid)
   const purchase= await tData.purchasedTicket(req,res,cid);

   if(purchase.success) {
    
    const ticketData = JSON.parse(JSON.stringify(purchase.ticket.message));
    const user= req.user.first_name;

    console.log("user",user);

    console.log("ticket", ticketData)

    await transport.sendMail({
        from: "PF Almacen <testjolav@gmail.com>",
        to: req.user.email,
        subject: `Tu compra ha sido procesada con éxito, ${user} `,
        html:`<h1> Detalle de tu compra </h1> <br> 
        <p> Código de compra: ${ticketData.code}</p>
        <p> Cantidad de la compra: $${ticketData.amount} </p>`
    })
    
    res.render("purchase", { user: user, ticket: ticketData });
} else {
    req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
    res.status(500).send({ error: "Error interno del servidor" });
}

})

viewsRouter.get("/users", passport.authenticate("jwt", { session: false}), AllowedUser('admin'), async(req,res)=>{
    try {
        const users = await userModel.find().exec();

        console.log("usuarios encontrados", users)

        res.render("users", {users})

    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send({ error: "Error interno del servidor" });
    }
})

viewsRouter.get("/:uid/documents", passport.authenticate("jwt", {session:false}), AllowedUser(['user', 'premium']), async(req, res)=>{
   try {
    const {uid} = req.params

    const user = await userModel.findById(uid);

    const id = user._id.toString();

    console.log( "usuario info:", user)

    console.log( "usuario id: ", id)

    res.render("becomepremium", {id,  documents: user.documents || []})
   } catch (error) {
    req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
    res.status(500).send({ error: "Error interno del servidor" });
   }
})

viewsRouter.post("/:uid/documents", passport.authenticate("jwt", {session: false}), AllowedUser(['user', 'premium']), updateDocs.fields([ { name: 'pfp', maxCount: 1 },
{ name: 'pdf', maxCount: 3 }]), async(req, res)=>{
    try {
       await PremiumController.UpdateDocs(req, res);

    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send("Error del servidor al verificar los documentos.");
    }
})

viewsRouter.get("/premium/:uid", passport.authenticate("jwt", {session: false}), AllowedUser(['user', 'premium']), async(req, res)=>{
 try {
    await PremiumController.UpdateUser(req,res);

    res.redirect("/home");
 } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send("Error del servidor");
 }
})

viewsRouter.get("/premium-products", passport.authenticate("jwt", {session:false}), AllowedUser('premium'), async(req,res)=>{
    try {
        const prodPremium = await pData.getProductsPremium(req,res);

        res.render("premiumproducts", {productos: prodPremium.docs})
    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send("Error del servidor");
    }
})

viewsRouter.post("/premium/add", passport.authenticate("jwt", {session: false}), AllowedUser('premium'), async(req, res)=>{
    try {
        await pData.addPID(req,res)
 
        res.redirect("/products")
         
     } catch (error) {
         req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
         res.status(500).send("Error del servidor");
     }
})

viewsRouter.post("/premium/delete/:pid", passport.authenticate("jwt", {session:false}), AllowedUser('admin'),async(req, res)=>{
    try {
        await pData.deletePIDPremium(req,res)

        res.redirect("/premium-products") 
    } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send("Error del servidor");
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