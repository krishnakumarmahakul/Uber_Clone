const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
module.exports.registerUser = async (req, res ,next) => {

    console.log(req.body);
    
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



module.exports.getUserProfile=async(req,res,next)=>{

}
 






