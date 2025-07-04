const express = require("express")
const {creategym,authgym,authemail,authotp,resetPassword,getemail,getgymdata,numberoftotalmembers,numberofTrainers,totalrevenue} =require("../controller/addgym")
const router = express.Router()
router.post("/addgym",creategym)
router.post("/authgym",authgym)
router.post("/email",authemail)
router.post("/otp",authotp)
router.post("/reset",resetPassword)
router.post("/getemail",getemail)
router.post("/getgym",getgymdata)
router.post("/sumtotalmembers",numberoftotalmembers)
router.post("/sumtotaltrainers",numberofTrainers)
router.post("/totalrevenue",totalrevenue)
module.exports = router