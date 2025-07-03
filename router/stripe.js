const express = require("express");
const router = express.Router();
const { stripess ,memberpaymentstripe} = require("../controller/stripesss");
router.post("/create-checkout-session", stripess);
router.post("/memberpayment",memberpaymentstripe)
module.exports = router;