const userModel = require("../models/users.models.js");

const transport = require("../middlewares/nodemailer.js");

class ActivityController {
    
    async getActivity(req, res){
       try {
         ///Límite de dos días;
         const limitDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

         //límite de 30 mínutos: 
         //const limitDate = new Date(Date.now() - 10 * 60 * 1000);

         //Usuarios con inactividad de dos días (o más);
         const oldUser = await userModel.find({last_activity: {$lt: limitDate}}).lean();

         return oldUser;
        
       } catch (error) {
         res.status(500).send("Error al obtener usuarios");
       }
    }

    async deleteUID(uid){
        try {
            const result = await userModel.findByIdAndDelete(uid);

            if(!result){
                return res.status(404).send("Usuario no encontrado");
            };

            await transport.sendMail({
                from: "PF Almacen <testjolav@gmail.com>",
                to: result.email,
                subject: `Tu cuenta ha sido eliminiada, ${result.first_name} `,
                html:`<h1> Tu cuenta ha sido eliminada por inactividad<br>`
            });

            console.log(`Usuario inactivo ${result.first_name} ${result.last_name} con ID:${result._id} ha sido eliminado con éxito`);
            return result;

        } catch (error) {
            res.status(500).send("Error al obtener usuarios");
        }
    }
}

module.exports= ActivityController;