const mongoose = require("mongoose")
const paymentplanSchema = mongoose.Schema({
        PlanID:{
            type:String,
            unique:true,
            required:true
        },
        planName:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        price:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        durationUnit:{
            type:String,
            required:true
        },
        gymname:{
            type:String,
            required:true
        }
})

module.exports = mongoose.model("paymentPlansss",paymentplanSchema)