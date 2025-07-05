const mongoose = require("mongoose")
const notificationSchema = mongoose.Schema({
        senderUsername:{
            type:String,
            required:true
        },
        senderRole:{
            type:String,
            enum:["admin","trainer","member"],
            required:true
        },
        receiverUsername:{
            type:String,
            required:true
        },
        receiverRole:{
            type:String,
            enum:["admin","trainer","member"],
            required:true
        },
        message:{
            type:String,
            required:true
        },
        isRead:{
            type:Boolean,
            default:false
        },
        createdAt:{
            type:Date,
            default:Date.now()
        }
})
module.exports = mongoose.model("Notification",notificationSchema)