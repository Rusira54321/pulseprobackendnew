const mongoose = require("mongoose")
const memberhistory = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    gym:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model("memberhistory",memberhistory)