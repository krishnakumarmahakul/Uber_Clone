const captainService = require('../services/captain.service');
const { validationResult } = require('express-validator');
const captainModel = require('../models/captain.model');
const jwt = require('jsonwebtoken');


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

    const captainId = decoded?.id || decoded?._id || decoded?.captainId;
    if (!captainId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    const captain = await captainModel.findById(captainId);
    if (!captain) {
      return res.status(404).json({ success: false, message: "Captain not found" });
    }

    return res.status(200).json({
      success: true,
      captain: {
        id: captain._id,
        fullname: captain.fullname,
        email: captain.email,
        vehicle: captain.vehicle,
      },
    });
  } catch (err) {
    next?.(err) || res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports.logoutCaptain = async (req, res, next) => {
  // Since JWTs are stateless, we can't truly "log out" a user on the server side.
  // The client should simply delete the token on their end.
  res.status(200).json({
      success: true,
      message: "User logged out successfully"
  });

}