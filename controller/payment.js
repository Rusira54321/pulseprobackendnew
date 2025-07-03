const payment = require("../model/Payment")
const dotenv = require("dotenv")
const paymentplan = require("../model/paymentplans")
dotenv.config()
const {transporter} = require("../util/nodemailer")
const supplement = require("../model/Suppliment")
const member = require("../model/member")
const paymentbycash = async(req,res) =>{
    const {items,totalpayment,customerpayment,balance} = req.body
    if(!items || !totalpayment || !customerpayment || !balance)
    {
        return res.status(400).json({message:"missing fields"})
    }else{
        try{
        const customername = items[0].customer
        const purchaseitems = []
        for(const item of items)
        {
            purchaseitems.push(item.ItemCode)
        }
        const newpayment = new payment({
            customerusername:customername,
            paymentType:"cash",
            purchaseitems:purchaseitems,
            totalAmount:totalpayment,
            customer_payment:customerpayment,
            balance:balance
        })
        await newpayment.save()
        for(const item of items)
        {
            var code = item.ItemCode
            const matchsuppliment = await supplement.findOne({ItemCode:code})
            if(matchsuppliment)
            {
                matchsuppliment.Quantity = matchsuppliment.Quantity - item.Quantity
            }           
            await matchsuppliment.save()
        }
        const matchmember = await member.findOne({username:customername})
         const mainOptions = {
          from: process.env.SENDER_EMAIL,
          to: matchmember.email,
          subject: "PulsePro Payment successful",
          text: `The PulsePro payment system charged Rs. ${totalpayment}.`,
        };
        await transporter.sendMail(mainOptions);
        return res.status(200).json({message:"Success"})
    }catch(error)
    {
        return res.status(400).json({message:error})
    }
    }
}
const membershippaymentbycash = async(req,res) =>{
    const {items,balance,customerpayment} = req.body
    if(!items|| !balance || !customerpayment)
    {
        return res.status(400).json({message:"Missing fields"})
    }else
    {
        try{
        const memberuser = items[0].memberusername
        const matchmember = await member.findOne({username:memberuser})
        const planID= items[0].planID
        const matchpaymentplan = await paymentplan.findOne({PlanID:planID})
        matchmember.paymentStatus = "done"
        matchmember.paydate = Date.now()
        matchmember.paymentvalidduration = matchpaymentplan.duration
        matchmember.durationUnit = matchpaymentplan.durationUnit
        await matchmember.save()
        const newpayment = new payment({
            customerusername:memberuser,
            paymentType:"cash",
            purchaseitems:[planID],
            totalAmount:items[0].totalprice,
            customer_payment: customerpayment,
            balance:balance
        })
        await newpayment.save()
        const mainOptions = {
          from: process.env.SENDER_EMAIL,
          to: matchmember.email,
          subject: "PulsePro Payment successful",
          text: `The PulsePro payment system charged Rs. ${items[0].totalprice}`,
        };
        await transporter.sendMail(mainOptions);
        return res.status(200).json({message:"Successful"})
    }catch(error){
        return res.status(400).json({message:error})
    }
    }
}
module.exports = {paymentbycash,membershippaymentbycash}