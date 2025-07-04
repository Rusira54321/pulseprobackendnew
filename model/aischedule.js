const mongoose = require("mongoose")
const aischedule = mongoose.Schema({
    memberusername:{
        type:String,
        unique:true,
        required:true
    },
    schedule:{
        type:Object,
        required:true
    },
    durationUnit:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    createddata:{
        type:Date,
        default:Date.now()
    }
})
module.exports = mongoose.model("aischedule",aischedule)