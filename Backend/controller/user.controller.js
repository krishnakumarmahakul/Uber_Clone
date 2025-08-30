const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
module.exports.registerUser = async (req, res ,next) => {


    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {fullname, email, password} = req.body;
    
    const hashPassword= await userModel.hashPassword(password);
   

    const user= await userService.createUser({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password: hashPassword
    })
   

    
    const token = user.generateAuthToken();
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
        },
        token
    });
    

}

module.exports.loginUser=
    async(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    const user= await userModel.findOne({email}).select("+password");

    if(!user){
        return res.status(401).json({
            message:"invalid credentials",
            success: false
        })
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        return res.status(401).json({
            message:"invalid credentials",
            success: false
        })
    }

    const token = user.generateAuthToken();
    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
        },
        token
    });

}


module.exports.getUserProfile = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = decoded?.id || decoded?._id || decoded?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    next?.(err) || res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};







