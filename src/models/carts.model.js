const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    products: [{
        id_prod: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'products',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
},{versionKey: false});

//al usar el middleware de populate lo que hacemos es decirle que el prod.id_prod sea el mismo que ya existe en el modelo ProductModel. En pocas palabras, se reemplaza por ese valor, tomandolo desde la referencia
cartSchema.pre('findOne', function (next) {
    this.populate('products.id_prod');
    next();
});


const CartModel = mongoose.model('carts', cartSchema);

module.exports= CartModel;