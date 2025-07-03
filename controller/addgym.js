const bcrypt = require("bcrypt")
const gymmodel = require("../model/gym")
const {transporter} = require("../util/nodemailer")
const {generateToken} = require("../util/jwtUtil")
const creategym = async(req,res) =>{
        const {gymname,username,email,password}=req.body
        if(!gymname || !username || !email || !password)
        {
                return res.status(404).json({message:"missing fields"}) 
        }
        else{
                const existemail = await gymmodel.findOne({email})
                const existusename = await gymmodel.findOne({username})
                if(existusename){
                        return res.status(400).json({message:"please try another user name"})
                }
                if(existemail){
                        return res.status(400).json({message:"your email is existing please use another email"})
                }
                const hashedpassword = await bcrypt.hash(password,10);
                const newgym = new gymmodel({
                        gymname,
                        username,
                        email,
                        password:hashedpassword
                })
                await newgym.save().then(()=>{
                        return res.status(201).json({message:"gym registered successfully"})
                }).catch((error)=>{
                        return res.status(500).json({message:error})
                })
        }
}
const authgym = async(req,res)=>{
        const {username,password} = req.body;
        if(!username || !password)
        {
                return res.status(400).json({message:"The username or password field is not fullfill completly"})
        }
        const existuser = await gymmodel.findOne({username:username})
        if(!existuser)
        {
                return res.status(400).json({message:"You are not a registered user first register"})
        }
        const matchpassword = await bcrypt.compare(password,existuser.password)
        if(matchpassword)
        {
                const token = generateToken(existuser)
                return res.status(200).json({message:"you are successfully logging",token:token})
        }
        else
        {
                return res.status(400).json({message:"Password is not matched"})
        }
}
const authemail = async(req,res) =>{
        const {email} = req.body
        if(!email)
        {
                return res.status(400).json({message:"please input your email"})
        }
        const existemail = await gymmodel.findOne({email:email})
        if(!existemail){
                return res.status(400).json({message:"you are not registered please register"})
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000))
        existemail.otp = otp
        existemail.otpExpiretime= Date.now()+10*60*1000
        await existemail.save()
        const mainOptions = {
            from:process.env.SENDER_EMAIL,
            to:existemail.email,
            subject:"Reset password OTP",
            text:`Your otp is ${existemail.otp},use this otp to reset your password`
        }
        await transporter.sendMail(mainOptions).then(()=>{
                return res.status(200).json({message:"The otp is sent to your email"})
        }).catch((error)=>{
                return res.status(400).json({message:error,email:existemail.email})
        })
}
const authotp = async(req,res)=>{
        const {otp,email} = req.body
        if(!otp||!email)
        {
                return res.status(400).json({message:"please input your otp"})
        }
        const existEmail = await gymmodel.findOne({email})
        if(existEmail)
        {
                if(Date.now()>existEmail.otpExpiretime)
                {
                        return res.status(400).json({message:"otp is expired"})
                }
                if(otp==existEmail.otp)
                {
                        existEmail.otp = ""
                        existEmail.otpExpiretime = 0
                        await existEmail.save()
                        return res.status(200).json({message:"Otp is verified successully",email:existEmail.email})
                }else
                {
                        return res.status(400).json({message:"otp is invalid"})
                }
        }
}
const resetPassword = async(req,res)=>{
        const {email,password}=req.body
        if(!email||!password){
                return res.status(400).json({message:"please input your password"})
        }
        if(!email)
        {
                return res.status(400).json({message:"no email"})
        }
        const existemail=await gymmodel.findOne({email})
        if(existemail){
                const hashedpassword = await bcrypt.hash(password,10);
                existemail.password = hashedpassword
                await existemail.save()
                return res.status(200).json({message:`Password reset successfully${email}`})
        }
}
const getemail = async(req,res) =>{
        const {username} = req.body
        if(!username)
        {
                return res.status(400).json({message:"Enter your user name"})
        }else{
                const existgym = await gymmodel.findOne({username})
                if(!existgym)
                {
                        return res.status(400).json({message:"You are not registered please register"})
                }
                else{
                        const email = existgym.email
                        return res.status(200).json({email:email})
                }
        }
}
module.exports = {creategym,authgym,authemail,authotp,resetPassword,getemail}