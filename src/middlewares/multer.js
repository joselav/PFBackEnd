const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destinationFolder; 
        switch(file.fieldname) {
            case "pfp": 
                destinationFolder =  path.resolve(__dirname, '../documents/pfp');
                break; 
            case "pdf": 
                destinationFolder = path.resolve(__dirname, '../documents/pdf');
                break;
            default:
            destinationFolder = path.resolve(__dirname, '../documents/other');
        };
        console.log(`Destination folder: ${destinationFolder}`);
        cb(null, destinationFolder); 
    }, 
    filename: (req, file, cb) => {
        console.log(`File name: ${file.originalname}`); // Agrega esta línea para depuración
        cb(null, file.originalname); 
    }
})

const updateDocs = multer({ storage });

module.exports= updateDocs;