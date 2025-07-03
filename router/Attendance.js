const express = require("express")
const router = express.Router()
const {addAttendance,getAttendance,getmonthlyattendance} = require("../controller/Attendance")
router.post("/addAttendance",addAttendance)
router.post("/getAttendance",getAttendance)
router.post("/getmonthlyattendance",getmonthlyattendance)
module.exports = router