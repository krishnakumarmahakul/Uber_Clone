
const userModel =   require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


module.exports.authUser=async(req,res,next)=>{
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message:"Unauthorized",
            success: false
        });
    }

    try {

        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        const user=await userModel.findById(decoded._id).select("-password");
        if(!user){
            return res.status(401).json({
                message:"Unauthorized",
                success: false
            });
        }

        req.user = user;
        next();

        
    } catch (error) {
        return res.status(401).json({
            message:"invalid token",
            success:false
        })
    }
}