const User = require("../models/User");
const OTP = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const {sendOtpEmail} = require("../utils/email")


const generateToken = (id,role)=>{
       return jwt.sign({id,role},process.env.JWT_SECRET,{expiresIn: '7d'});
}


exports.registerUser = async(req,res)=>{
    const {name,email,password,role} = req.body;


   let userExists = await User.findOne({email});
   if(userExists)
   {
    return res.status(400).json({error:"User Already Exists"})
   }

   const salt = await bcrypt.genSalt(10);
   const hashedPassword =  await bcrypt.hash(password,salt);

    try{
          const user = new User({name,email,password: hashedPassword,role:'user',isVerified:false});
          await user.save();
          

          const otp = Math.floor(100000 + Math.random() * 900000).toString();

          await OTP.create({email,otp,action:'account_verification'})
          console.log(`Otp for ${email}:${otp}`)
          await sendOtpEmail(email,otp,'account_verification');

          res.status(201).json({
            message:"User registered Successfully.Please check your email for Otp to verify your account",
            email: user.email
        })
    }
    catch(error)
    {
        res.status(400).json({error:error.message});
    }
}


exports.loginUser = async(req,res)=>{
    const {email,password} = req.body;
    
    let user = await User.findOne({email});

    if(!user){
        return res.status(400).json({message:"User Does not Exists"})
    }
    

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch)
    {
        return res.status(400).json({message:"Invalid Credentials"})
    }

    if(!user.isverified  && user.role !== 'admin'){
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({email,action:"account_verification"});
       const savedOtp = await OTP.create({email,otp,action:"account_verification"});

     
        await sendOtpEmail(email,otp,'account_verification');

        return res.status(400).json({
            error:"Account not Verified.A new Otp has been sent to your Email",
              needsVerification:true
        })
        
    }

    res.json({
        message:"Login Successfully",
        _id:user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token:generateToken(user._id,user.role)
    })
}


exports.verifyOtp = async(req,res)=>{
    const {email,otp} = req.body;

    const otprecord = await OTP.findOne({email,otp,action:"account_verification"})

    if(!otprecord)
    {
        return res.status(400).json({error:"Invalid or expired OTP"})
    }

    const user =    await User.findOneAndUpdate({email},{isVerified:true});
    await OTP.deleteMany({email,action:"account_verification"});

    res.json({
        message:"Account Verified Successfully.You can now log in",
        _id: user._id,
        name:user.name,
        email: user.email,
        role :user.role,
        token :generateToken(user._id,user.role)
    })
}