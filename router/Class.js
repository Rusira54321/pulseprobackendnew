const express = require("express")
const router = express.Router()
const {addClass,getClasses,getmembersdata,deleteClass,getClassess} = require("../controller/Class")
router.post("/addclasses",addClass)
router.post("/getclasses",getClasses)
router.get("/getmembersdata/:id",getmembersdata)
router.delete("/deleteclass/:id",deleteClass)
router.post("/getclassess",getClassess)
module.exports = router