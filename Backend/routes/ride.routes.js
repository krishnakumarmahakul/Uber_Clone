const express = require('express');
const router = express.Router();
const rideController = require('../controller/ride.controller');
const authMiddleware =require('../middleware/auth.middleware')
const { body } = require('express-validator');

router.post(
  '/create',
  authMiddleware.authUser,
  
  body('pickup').isString().isLength({ min: 3 }).withMessage('pickup too short'),
  body('destination').isString().isLength({ min: 3 }).withMessage('destination too short'),
  body('vehicleType')
    .isIn(['auto', 'car', 'motorcycle', 'moto'])
    .withMessage('vehicleType must be auto, car, motorcycle'),
  body('otp').optional().isString().isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 characters'),
  rideController.createRide
);

module.exports = router;