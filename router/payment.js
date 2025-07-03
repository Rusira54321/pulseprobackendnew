const express = require("express")
const router = express.Router()
const {paymentbycash,membershippaymentbycash,getpayments} = require("../controller/payment")
router.post("/addpayment",paymentbycash)
router.post("/membercashpay",membershippaymentbycash)
router.post("/getpayments",getpayments)
module.exports = router