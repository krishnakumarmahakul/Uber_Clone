const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');

module.exports.createRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
  
    try {
      const { userId, pickup, destination, vehicleType, otp } = req.body;
      const ride = await rideService.createRide({
        user: req.user._id,
        pickup,
        destination,
        vehicleType,
        otp
      });

      // Calculate formatted values
      const fareFormatted = `₹${ride.fare.toLocaleString('en-IN')}`;
      const distanceKm = +(ride.distance / 1000).toFixed(2);
      const totalSeconds = ride.duration;
      const totalMinutes = Math.round(totalSeconds / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const durationText = `${hours}h ${minutes}m`;

      return res.status(201).json({
        success: true,
        ride: {
          _id: ride._id,
          user: ride.user,
          pickup: ride.pickup,
          destination: ride.destination,
          fare: ride.fare,
          fare_formatted: fareFormatted,
          distance_meters: ride.distance,
          distance_km: distanceKm,
          duration_seconds: totalSeconds,
          duration_text: durationText,
          status: ride.status,
          otp: ride.otp
        }
      });
    } catch (e) {
      next(e);
    }
  };