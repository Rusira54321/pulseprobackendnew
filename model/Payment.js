const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    customerusername:{
        type:String,
        required:true
    },
    paymentType:{
        type:String,
        enum:['card','cash'],
        required:true
    },
    purchaseitems:{
        type:[String],
    },
    totalAmount:{
        type:Number,
        required:true
    },
    customer_payment:{
        type:Number,
        required:true
    },
    balance:{
        type:Number
    },
    paymentDate:{
        type:Date,
        default:Date.now()
    },gym:
    {
        type:String,
        required:true
    }
})
module.exports = mongoose.model('Payment', paymentSchema);