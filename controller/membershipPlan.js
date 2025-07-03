const membership = require("../model/paymentplans")
const addmembershipPlan = async(req,res) =>{
    const {PlanID,planName,description,price,duration,durationUnit,gymname} = req.body
    if(!PlanID || !planName || !description || !price || !duration || !durationUnit || !gymname)
    {
        return res.status(400).json({message:"Missing fields"})
    }else{
        const existplanid = await membership.findOne({PlanID})
        if(existplanid)
        {
            return res.status(400).json({message:"you must choose another planID"})
        }
            const newMembership = new membership({
                PlanID,
                planName,
                description,
                price,duration,durationUnit,gymname
            })
            try{
            await newMembership.save()
            return res.status(201).json({message:"successfully added membership plan"})
            }catch(error)
            {
                return res.status(400).json({message:error.message})
            }
    }
}
const getmembershipplan = async(req,res) =>{
    const {key} = req.body
    const membershipplan = await membership.find({gymname:key})
    if(membershipplan)
    {
        return res.status(200).json({membershipPlan:membershipplan})
    }
}
const memberplandelete = async(req,res) =>{
    const {id} = req.params
    try{
        await membership.findByIdAndDelete(id)
        return res.status(200).json({message:"Deleted plan"})
    }catch(error)
    {
        return res.status(400).json({message:error.message})
    }
}
const getmembershipbyid = async(req,res) =>{
    const {id} = req.body
    if(id)
    {
        const membershipplan = await membership.findById(id)
        if(membershipplan)
        {
            return res.status(200).json({membership:membershipplan})
        }
    }
}
const updatemembershipbyid = async(req,res) =>{
    const {id,planName,Description,price,duration,durationUnit} = req.body
    if(!id || !planName || !Description || !price || !duration || !durationUnit)
    {
        return res.status(400).json({message:"Missing fields"})
    }else{
        const updateddata = await membership.findByIdAndUpdate(
                                                 id,
                                                    {
                                                        planName,
                                                        description:Description,
                                                        price,duration,durationUnit
                                                    },
                                                    { new: true })
            if(updateddata)
            {
                return res.status(200).json({message:"Update successfull"})
            }else{
                return res.status(400).json({message:"Update is unsuccessfull"})
            }
   }
}
const getmembershipplanbyplanid = async(req,res) =>{
    const {planID} = req.body
    if(planID)
    {
        const membershipp = await membership.findOne({PlanID:planID})
        if(membershipp)
        {
            return res.status(200).json({membership:membershipp})
        }
    }
}
module.exports = {addmembershipPlan,getmembershipplan,memberplandelete,getmembershipbyid,updatemembershipbyid,getmembershipplanbyplanid}