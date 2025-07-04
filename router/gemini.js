const express = require("express")
const router = express.Router()
const {getSchedule,getDietplan,adddietplandata,addSchedule} = require("../controller/gemini")
router.post("/createSchedule",getSchedule)
router.post("/creatediet",getDietplan)
router.post("/adddatadb",adddietplandata)
router.post("/addschedule",addSchedule)
module.exports = router