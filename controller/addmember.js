const bcrypt = require("bcrypt")
const memberhistory = require("../model/MemberIdhistory")
const trainerss = require("../model/Trainer")
const member = require("../model/member")
const workout = require("../model/WorkOutPlan")
const dietplan = require("../model/Dietplan")
const addmember = async(req,res) =>{
    const profileimage = req.file.filename
    const usernames = []
    const {name,username,password,height,weight,key,trainer,trainername,email} = req.body
    if (!name || !username || !password || !height || !weight || !trainer || key=="null" || !profileimage || !trainername || !email)
    {
         return res.status(400).json({message:"missing fields"})
    }
    const memberusername = await memberhistory.find()
    if(memberusername)
    {
     for(const memberuser of memberusername)
     {
        if(memberuser.gym==key)
        {
            usernames.push(memberuser.username)
        }
     }
    }
    for(const usernamesss of usernames )
    {
        if(usernamesss==username)
        {
            return res.status(400).json({message:"The username is already exist"})
        }
    }
    
    const existusername = await member.findOne({username:username})
    if(existusername)
    {
        return res.status(400).json({message:"The username is already exist"})
    }
    const hashedpassword = await bcrypt.hash(password,10)
    
    const newmember = new member({
        name,username,password:hashedpassword,heightincm:height,weightinkg:weight,gym:key,trainer:trainername,profileimage,trainerusername:trainer,email:email
    })
    const history = new memberhistory({
            username:username,
            gym:key
    })
    await history.save()
    await newmember.save().then(()=>{
        const updatetrainer = async() =>{
            const trainers = await trainerss.findOne({username:trainer})
            trainers.noOfstudents = trainers.noOfstudents+1
            await trainers.save()
        }
            updatetrainer()
            return res.status(201).json({message:"member created successfully"})
    }).catch((error)=>{
            return res.status(400).json({message:error})
    })
}
const getmemberdetails = async(req,res) =>{
        const {key} = req.body;
        const members  = await member.find()
        var i
        if(members.length==0)
        {
            return res.status(400).json({member:"empty members"})
        }
        var newmember = []
        for (i=0;i<members.length;i++)
        {
            if(members[i].gym==key)
            {
                newmember.push(members[i])
            }
        }
        if(newmember.length==0)
        {
            return res.status(400).json({member:"empty members"})
        }
        return res.status(200).json({member:newmember})
}
const deleteMember = async(req,res) =>{
    const {id} = req.body
    const members = await member.findOne({_id:id})
    const memberusername = members.username
    const matchgym = members.gym
    const matchdietplans = await dietplan.find({gym:matchgym})
    if(matchdietplans)
    {
        for(const dietplans of matchdietplans)
        {
            if(dietplans.memberUsername==memberusername){
                 await dietplan.findByIdAndDelete(dietplans._id);
            }
        }
    }
    const matchworkoutplans = await workout.find({gym:matchgym})
    if(matchworkoutplans)
    {
        for(const workouts of matchworkoutplans)
        {
            if(workouts.memberUsername==memberusername)
            {
                await workout.findByIdAndDelete(workouts._id)
            }
        }
    }
    const traineruser = members.trainerusername
    const trainer = await trainerss.findOne({username:traineruser})
    if(trainer!=null)
    {
        trainer.noOfstudents= trainer.noOfstudents-1
        await trainer.save()
    }
    const deletemember = await member.findByIdAndDelete(id)
    if(!deletemember)
    {
        return res.status(400).json({message:"Cannot delete the member"})
    }
    else{
        return res.status(200).json({message:"member is deleted"})
    }
}
const getmemberbyID = async(req,res) =>{
    const {id} = req.body
    const matchMember = await member.findById(id)
    if(matchMember)
    {
        return res.status(200).json({member:matchMember})
    }
}
const updatemember = async(req,res) =>{
    const {id,password,heightCM,weightKG,trainer} = req.body
    if(!id || !password || !heightCM || !weightKG || !trainer)
    {
        return res.status(400).json({message:"Missing fields"})
    }
    const matchtrainer = await trainerss.findOne({name:trainer})
    const usernames = matchtrainer.username
    const hashedpassword = await bcrypt.hash(password,10)
    const members = await member.findById(id)
    const mtrainer = members.trainer
    if(mtrainer!=trainer)
    {
        if(matchtrainer!=null)
        {
        matchtrainer.noOfstudents =  matchtrainer.noOfstudents + 1
        await matchtrainer.save()
        }

        const updatedtrainer = await trainerss.findOne({name:mtrainer})
        if(updatedtrainer!=null)
        {
        updatedtrainer.noOfstudents = updatedtrainer.noOfstudents-1
        await updatedtrainer.save()
        }
    }
    members.password = hashedpassword
    members.heightincm = heightCM
    members.weightinkg = weightKG
    members.trainer = trainer
    members.trainerusername = usernames
    await members.save().then(()=>{
            return res.status(200).json({message:"updated successfully"})
    }).catch((error)=>{
            return res.status(400).json({message:error.message})
    })
}
const getmemberdetailss = async(req,res) =>{
        const {key} = req.body;
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months start from 0
        const year = today.getFullYear();
        const customFormat = `${day}-${month}-${year}`;
        const members  = await member.find()
        var i
        if(members.length==0)
        {
            return res.status(400).json({member:"empty members"})
        }
        var newmember = []
        for (i=0;i<members.length;i++)
        {
            if(members[i].gym==key)
            {
                newmember.push(members[i])
            }
        }
        if(newmember.length==0)
        {
            return res.status(400).json({member:"empty members"})
        }
        for(i=0;i<newmember.length;i++)
        {
            if(newmember[i].attendancedate!=customFormat)
            {
                newmember[i].attendancedate = null
                newmember[i].attendance = null
            }
        }
        return res.status(200).json({member:newmember})
}
const getmemberDetailBytrainer = async(req,res) =>{
    const {username} = req.body
    const members = await member.find({trainerusername:username})
    if(members.length==0)
    {
        return res.status(400).json({message:"No members"})
    }
    else{
        return res.status(200).json({members:members})
    }
}
const authmember = async(req,res)=>{
    const {username,password} = req.body
    if(!username || !password)
    {
        return res.status(400).json({message:"missing fields"})
    }
    else{
        const existingmember = await member.findOne({username})
        if(!existingmember)
        {
            return res.status(400).json({message:"You are not registered member please register"})
        }else{
            const matchpassword = await bcrypt.compare(password,existingmember.password)
            if(!matchpassword)
            {
                return res.status(400).json({message:"Password is incorrect"})
            }
            if(matchpassword)
            {
                return res.status(200).json({message:"Verified successfully",member:existingmember})
            }
        }
    }
}
const getmembersusernamebyadmin = async(req,res) =>{
    const {gymkey} = req.body
    const usernames = []
    const membersdata = await member.find({gym:gymkey})
    if(membersdata)
    {
        for(const member of membersdata)
        {
            usernames.push(member.username)
        }
        return res.status(200).json({members:usernames})
    }
}
const getnumberofmembers = async(req,res) =>{
        const {username} = req.body
        var numberofmembers = 0
        const matchmembers = await member.find({trainerusername:username})
        if(matchmembers)
        {
            for(const members of matchmembers)
            {
                    numberofmembers = numberofmembers +1
            }
        }
        return res.status(200).json({numberofmembers:numberofmembers})
}
module.exports = {addmember,getmemberdetails,deleteMember,getmemberbyID,getmemberbyID,updatemember,getmemberdetailss,getmemberDetailBytrainer,authmember,getmembersusernamebyadmin,getnumberofmembers}