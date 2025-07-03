const express = require("express")
const {upload} = require("../middleware/multer")
const {addtrainer} = require("../controller/trainer")
const {addmember} = require("../controller/addmember")
const router = express.Router()
router.post("/upload",upload.single("profile"),addtrainer)
router.post("/addmember",upload.single("profile"),addmember)
module.exports = router