const suppliment = require("../model/Suppliment")
const addSuppliment = async(req,res)=>{
    
    const {supname,category,brandname,quantity,unitType,itemcode,price,key} = req.body
    if(!supname || !category || !brandname || !quantity || !unitType || !itemcode || !price ||!req.file|| key=="null")
    {
        return res.status(400).json({message:"Missing fields"})
    }
    if(category == "")
    {
        return res.status(400).json({message:"Missing fields"})
    }
    if(unitType=="")
    {
        return res.status(400).json({message:"Missing fields"})
    }
    const image = req.file.filename
    const existsupplimentcode = await suppliment.findOne({ItemCode:itemcode})
    if(existsupplimentcode)
    {
        return res.status(400).json({message:"Sorry this product is already added to our system"})
    }
    else{
    const newsuppliment = new suppliment({
        supplimentName:supname,
        category,
        brandName:brandname,
        Quantity:quantity,
        UnitType:unitType,
        ItemCode:itemcode,
        Price:price,
        image,
        key
    })
    await newsuppliment.save().then(()=>{
        return res.status(201).json({message:"Suppliment added successfully"})
    }).catch((error)=>{
        return res.status(400).json({message:error.message})
    })
    }
    
}
const getSuppliments = async(req,res) =>{
    const {key} = req.body
    var i
    var matchsuppliment = []
    const suppliments = await suppliment.find()
    for(i=0;i<suppliments.length;i++)
    {
        if(suppliments[i].key==key)
        {
            matchsuppliment.push(suppliments[i])
        }   
    }
    
    return res.status(200).json({suppliment:matchsuppliment})
}
const deleteSupplement = async(req,res) =>{
    const {id} = req.params
    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const deleted = await suppliment.findByIdAndDelete(id)
    if(deleted)
    {
        return res.status(200).json({message:"Deleted successfully"})
    }
    else{
        return res.status(400).json({message:"Deletion is unsuccessfull"})
    }
}
const getsupplimentbyId = async(req,res) =>{
    const {id}  =  req.body
    const supplimentsss = await suppliment.findById(id)
    if(supplimentsss)
    {
        return res.status(200).json({suppliment:supplimentsss})
    }
}
const updateSuppliment = async(req,res) =>{
        const {quantity,price,id} = req.body
        if(!quantity || !price)
        {
            return res.status(400).json({message:"Missing inputs"})
        }
        const suppliments = await suppliment.findById(id)
        suppliments.Quantity = quantity
        suppliments.Price = price
        await suppliments.save().then(()=>{
            return res.status(200).json({message:"updated successfully"})
        }).catch((error)=>{
            return res.status(400).json({message:error.message})
        })
}
const getsupplementsbyids = async(req,res) =>{
    const {ids} = req.body
    const supplements = []
    for(id of ids)
    {
        const supplimentdata  =await suppliment.findById(id)
        if(supplimentdata)
        {
            supplements.push(supplimentdata)
        }
    }
    return res.status(200).json({supplements:supplements})
}
module.exports = {addSuppliment,getSuppliments,deleteSupplement,getsupplimentbyId,updateSuppliment,getsupplementsbyids}


