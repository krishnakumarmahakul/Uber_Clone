const captainService = require('../services/captain.service');
const { validationResult } = require('express-validator');
const captainModel = require('../models/captain.model');



module.exports.registerCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {fullname,email,password,vehicle}=req.body;
    const hashPassword= await captainModel.hashPassword(password);

    const captain=await captainService.createCaptain({
        firstname:fullname.firstname,
        lastname:fullname.lastname,
        email,
        password: hashPassword,
        color:vehicle.color,
        plate:vehicle.plate,
        capacity:vehicle.capacity,
        vehicleType:vehicle.vehicleType

    })

    const token = captain.generateAuthToken();
    res.status(201).json({
        suscess:true,
        mensage:"Captain registered successfully",
        captain:{
            id:captain._id,
            fullname:captain.fullname,
            email:captain.email,
            vehicle:captain.vehicle
        },
        token
    })

}

module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const captain=await captainModel.findOne({email}).select("+password");
    if(!captain){
        return res.status(401).json({
            message:"invalid credentials",
            success: false
        })
    }
    const isMatch=await captain.comparePassword(password);
    if(!isMatch){
        return res.status(401).json({
            message:"invalid credentials",
            success: false
        })
    }
    const token=captain.generateAuthToken();
    res.status(200).json({
        success:true,
        message:"Captain logged in successfully",
        captain:{
            id:captain._id,
            fullname:captain.fullname,
            email:captain.email,
            vehicle:captain.vehicle
        },
        token
    })
}

module.exports.getCaptainProfile = async (req, res, next) => {
    
}