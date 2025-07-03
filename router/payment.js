const express = require("express")
const router = express.Router()
const {paymentbycash,membershippaymentbycash,getpayments,getmonthlyrevenue} = require("../controller/payment")
router.post("/addpayment",paymentbycash)
router.post("/membercashpay",membershippaymentbycash)
router.post("/getpayments",getpayments)
router.post("/getmonthlyrevenue",getmonthlyrevenue)
module.exports = router