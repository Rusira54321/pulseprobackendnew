const mongoose = require("mongoose")
const gymSchema = mongoose.Schema({
    gymname:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["admin"],
        default:"admin"
    },
    otp:{
        type:String,
        default:''
    },
    otpExpiretime:{
        type:Number,
        default:0
    }
})
module.exports = mongoose.model("Gym",gymSchema)