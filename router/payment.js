const express = require("express")
const router = express.Router()
const {paymentbycash,membershippaymentbycash} = require("../controller/payment")
router.post("/addpayment",paymentbycash)
router.post("/membercashpay",membershippaymentbycash)
module.exports = router