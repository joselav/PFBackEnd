const userModel = require("../models/users.models.js");
const path = require("path");

class PremiumController{

    async UpdateDocs(req, res){
       try {
        const { uid } = req.params;
        const uploadedDocuments = req.files;

        console.log('Uploaded documents:', uploadedDocuments);

        const user = await userModel.findById(uid);

        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }

        if (uploadedDocuments) {
            if (uploadedDocuments.pfp) {
                user.documents = user.documents.concat(uploadedDocuments.pfp.map(doc => ({
                    name: doc.originalname,
                    reference: path.join('src/documents/pfp', doc.filename) 
                })));
            }

            if (uploadedDocuments.pdf) {
                user.documents = user.documents.concat(uploadedDocuments.pdf.map(doc => ({
                    name: doc.originalname,
                    reference: path.join('src/documents/pdf', doc.filename)
                })));
            }
        }

        await user.save();

        res.redirect(`/${user._id}/documents`)
       } catch (error) {
        req.logger.error(`Error interno del servidor en ${req.url} - ${new Date().toLocaleTimeString()}`);
        res.status(500).send('Error del servidor al intentar cargar archivos.');
       }


    }

    async UpdateUser(req, res){
        try {
            const { uid } = req.params;
            const user = await userModel.findById(uid);
            if (!mongoose.Types.ObjectId.isValid(uid)) {
                return res.status(400).send("ID de usuario inválido.");
            }
    
            if (!user) {
                return res.status(404).send("Usuario no encontrado.");
            }
    
            if (user.rol === 'user') {
                if (user.documents.length === 0) {
                    return res.status(400).send("No se han cargado documentos.");
                }
    
                user.rol = 'premium';
                await user.save();
                return "El usuario ha sido actualizado a premium.";
    
            } else if (user.rol === 'premium') {
                user.rol = 'user';
                await user.save();
                return "El usuario ha sido revertido a usuario.";
            } else {
                return res.status(400).send("Rol de usuario no válido.");
            }
        } catch (error) {
            console.error("Error al verificar documentos y actualizar usuario:", error);
            res.status(500).send('Error del servidor al intentar actualizar a premium.');
        }
    }

}


module.exports= PremiumController;


//Modificar el endpoint /api/users/premium/:uid   para que sólo actualice al usuario a premium si ya ha cargado los siguientes documentos