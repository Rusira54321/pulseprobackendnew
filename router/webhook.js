const express = require("express")
const router = express.Router()
const dotenv = require("dotenv")
dotenv.config()
const stripe = require("stripe")(process.env.Stripe_secretkey)
const payment = require("../model/Payment")
const paymentplans = require("../model/paymentplans")
const {transporter} = require("../util/nodemailer")
const suppliment = require("../model/Suppliment")
const member = require("../model/member")
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Payment succeeded
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customerUsername = session.metadata.customerUsername;
    const items = JSON.parse(session.metadata.items);
    const gymkey = session.metadata.key 
    try {
      if(items[0].planID!=null)
      {
           const memberuser =  items[0].memberusername
           const planid = items[0].planID
           const paymentplan = await paymentplans.findOne({PlanID:planid})
           const foundmember = await member.findOne({username:memberuser})
           foundmember.paymentStatus = "done"
           foundmember.paydate = Date.now()
           foundmember.paymentvalidduration = paymentplan.duration
           foundmember.durationUnit = paymentplan.durationUnit
           await foundmember.save()
           const newpayment = new payment({
              customerusername:memberuser,
              paymentType:"card",
              purchaseitems:[planid],
              totalAmount:items[0].totalprice,
              customer_payment:items[0].totalprice,
              balance:0,
              gym:gymkey
           })
        await newpayment.save()
        const mainOptions = {
          from: process.env.SENDER_EMAIL,
          to: foundmember.email,
          subject: "PulsePro Payment successful",
          text: `The PulsePro payment system charged Rs. ${items[0].totalprice} from your credit card.`,
        };
        await transporter.sendMail(mainOptions);
      }
      else{
      let total = 0;
      const itemcodearray = [];

      for (const item of items) {
        itemcodearray.push(item.ItemCode);
        total += item.price * item.Quantity;

        const supplimentts = await suppliment.findOne({ ItemCode: item.ItemCode });
        if (supplimentts) {
          supplimentts.Quantity -= item.Quantity;
          await supplimentts.save();
        }
      }

      const newpayment = new payment({
        customerusername: customerUsername,
        paymentType: "card",
        purchaseitems: itemcodearray,
        totalAmount: total,
        customer_payment: total,
        gym:gymkey
      });

      await newpayment.save();
      const memberr = await member.findOne({ username: items[0].customer });
      if (memberr) {
        const mainOptions = {
          from: process.env.SENDER_EMAIL,
          to: memberr.email,
          subject: "PulsePro Payment successful",
          text: `The PulsePro payment system charged Rs. ${total} from your credit card.`,
        };
        await transporter.sendMail(mainOptions);
      }

      console.log("✅ Payment handled successfully in webhook.");
    }
    } catch (err) {
      console.error("❌ Error handling payment in webhook:", err.message);
    }
  }

  res.status(200).send("Webhook received");
});

module.exports = router;