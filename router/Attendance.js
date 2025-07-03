const express = require("express")
const router = express.Router()
const {addAttendance,getAttendance} = require("../controller/Attendance")
router.post("/addAttendance",addAttendance)
router.post("/getAttendance",getAttendance)
module.exports = router