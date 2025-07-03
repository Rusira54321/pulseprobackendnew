const dotenv = require("dotenv")
dotenv.config()
const stripe = require("stripe")(process.env.Stripe_secretkey)
const stripess = async(req,res) =>{
        const {items} = req.body;
        const lineItems = items.map((item)=>(
            {
                price_data:{
                    currency:"USD",
                    product_data:{
                        name:item.supplimentName,
                    },
                    unit_amount:Math.round(item.priceinUSD*100),
                },
                quantity:item.Quantity
            }
        ))
        try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:lineItems,
            mode:"payment",
            success_url:"http://localhost:5173/successful-payment",
            cancel_url:"http://localhost:5173/unsuccessful-payment",
            metadata: {
                        customerUsername: items[0].customer,
                        items: JSON.stringify(items)  // stringify items for later use
                      }
        })
        res.status(200).json({id:session.id});
    }catch(error)
    {
        return res.status(404).json({message:"Session is not created"});
    }
} 
const memberpaymentstripe = async(req,res) =>{
     const {items} = req.body;
        const lineItems = items.map((item)=>(
            {
                price_data:{
                    currency:"USD",
                    product_data:{
                        name:item.planID,
                    },
                    unit_amount:Math.round(item.totalpriceinusd*100),
                },
                quantity:1
            }
        ))
        try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:lineItems,
            mode:"payment",
            success_url:"http://localhost:5173/success/pay",
            cancel_url:"http://localhost:5173/unsuccessful-payment",
            metadata: {
                        customerUsername: items[0].memberusername,
                        items: JSON.stringify(items)  // stringify items for later use
                      }
        })
        res.status(200).json({id:session.id});
    }catch(error)
    {
        return res.status(404).json({message:"Session is not created"});
    }
}
module.exports = {stripess,memberpaymentstripe};