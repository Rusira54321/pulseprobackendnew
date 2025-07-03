const bcrypt = require("bcrypt")
const trainer = require("../model/Trainer")
const member = require("../model/member")
const {generateToken} =require("../util/jwtUtil")
const addtrainer = async(req,res) =>{
        const profileimage = req.file.filename
        const {name,username,password,email,phone,gender,dob,key} = req.body
        if(!name ||!username || !password || !email || !phone || !gender || !dob || !profileimage || key=="null")
        {
            return res.status(400).json({message:"missing fields"})
        }
        if(gender!=="Male" && gender!=="Female" && gender!=="Other")
        {
            return res.status(400).json({message:"incorrect gender"})
        }
        const existname = await trainer.findOne({name})
        if(existname)
        {
            return res.status(400).json({message:"this name is already exist"})
        }
        const existusername = await trainer.findOne({username})
        if(existusername)
        {
            return res.status(400).json({message:"Try another username"})
        }
        const existemail =  await trainer.findOne({email})
        if(existemail)
            {
                return res.status(400).json({message:"Try another email"})
            }
        const hashedpassword = await bcrypt.hash(password,10)
        const  newtrainer = new trainer({
            name,username,password:hashedpassword,email,phone,gender,dob,profileimage,key
        })
        await newtrainer.save().then(()=>{
                return res.status(201).json({message:"Trainer created successfully"})
        }).catch((error)=>{
                return res.status(400).json({message:error})
        })

        
}
const authtrainer = async(req,res)=>{
    const {username,password} = req.body
    if(!username || !password)
    {
        return res.status(400).json({message:"missing fields"})
    }
    const existusername = await trainer.findOne({username})
    if(!existusername)
    {
        return res.status(400).json({message:"You are not registered trainer please register by admin"})
    }
    if(existusername)
    {
        const matchpassword = await bcrypt.compare(password,existusername.password)
        if(!matchpassword)
        {
            return res.status(400).json({message:"Password is incorrect"})
        }
        if(matchpassword)
        {
            const token = generateToken(existusername)
            return res.status(200).json({message:"Verified successfully",token:token})
        }
    }
}
const gettrainers = async(req,res) =>{
    const {key} = req.body
    const trainers = await trainer.find()
    var i
    var newtrainers = []
    for(i=0;i<trainers.length;i++)
        {
            if(trainers[i].key==key)
            {
                newtrainers.push(trainers[i])
            }
        } 
    if(!newtrainers)
    {
        return res.status(400).json({message:"Trainers not found"})
    }else{
        return res.status(200).json({trainers:newtrainers})
    }
}
const deleteTrainer = async(req,res) =>{
    const {id,username} = req.body
    const members  = await member.find()
    var i
    for(i=0;i<members.length;i++)
    {
        if(members[i].trainer==username)
        {
            members[i].trainer = "No Trainer"
            await members[i].save()
        }
    }
    const deletetrainer = await trainer.findByIdAndDelete(id)
    if(!deletetrainer)
    {
        return res.status(400).json({message:"Cannot delete the trainer"})
    }else{
        return res.status(200).json({message:"trainer is deleted"})
    }
}
const gettrainername = async(req,res) =>{
    const {username} = req.body
    const trainerdetails = await trainer.findOne({username})
    const trainername = trainerdetails.name
    res.status(200).json({name:trainername})
}
const getTrainerbyID = async(req,res) =>{
    const {id} = req.body
    const matchTrainer = await trainer.findById(id)
    if(matchTrainer)
    {
        return res.status(200).json({Trainer:matchTrainer})
    }
}
const updateTrainer = async(req,res) =>{
    const {password,email,phone,id} = req.body
    if(!password || !email || !phone)
    {
        return res.status(400).json({message:"Missing fields"})
    }
    const hashedpassword = await bcrypt.hash(password,10)
    const matchtrainer = await trainer.findById(id)
    matchtrainer.password = hashedpassword
    matchtrainer.email = email
    matchtrainer.phone = phone
    await matchtrainer.save().then(()=>{
        return res.status(200).json({message:"Update successfully"})
    })
}
const gettrainersbytrainer = async(req,res) =>{
        const {key} = req.body
        const trainers = await trainer.find({key:key})
        if(trainers)
        {
            res.status(200).json({trainers:trainers})
        }
}
module.exports = {addtrainer,authtrainer,gettrainers,deleteTrainer,gettrainername,getTrainerbyID,updateTrainer,gettrainersbytrainer}