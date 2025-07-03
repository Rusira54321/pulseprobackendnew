const mongoose = require("mongoose")
const AttendanceSchema = mongoose.Schema({
    userID:{
        type:String,
        required:true
    },
    Membername:{
        type:String,
        required:true
    },
    Username:{
        type:String,
        required:true
    },
    Attendance_Status:{
        type:String,
        enum:[null,"Present","Absent","Sick","Leave"],
        default:null
    },
    date:{
        type:String,
        required:true
    },gym:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model("Attendance",AttendanceSchema)