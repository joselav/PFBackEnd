const mongoose = require("mongoose");

const CartModel = require("../models/carts.model.js")

const userSchema = new mongoose.Schema({
    first_name: {
        type: String, 
        required: true
    }, 
    last_name: {
        type: String, 
        required: true
    }, 
    age: {
        type: Number,
    },
    email: {
        type: String, 
        required: true,
        unique: true
    },
    password: {
        type: String, 
       // required: true
    },
    rol: {
        type: String, 
        default: 'user'
    },
    documents: [{
        name: {
            type: String,
            default: ''
        },
        reference: {
            type: String,
            default: ''
        }
    }],
    cart:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    },
    last_activity: {
        type: Date, 
        default: Date.now
    }
}, {versionKey: false});

userSchema.pre('save', async function(next){
    try{
        if (this.isNew) {
            const newCart = await CartModel.create({});
            this.cart = newCart._id;
        }
        next();
    } catch (error) {
        next(error);
    }
})

const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;