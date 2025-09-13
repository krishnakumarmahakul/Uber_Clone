const rideModel = require('../models/ride.model');
const mapService = require('./map.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');



module.exports.getFare = async (pickup, destination) => {
  if (!pickup || !destination) throw new Error('Pickup and destination are required');

  const distanceData = await mapService.getDistanceTime(pickup, destination);
  // Expecting: distance_meters, duration_seconds
  const distanceMeters = distanceData.distance_meters;
  const distanceKm = distanceMeters / 1000;
  const durationMinutes = (distanceData.duration_seconds || 0) / 60;

  const baseFare = { auto: 30, car: 50, moto: 20 };
  const perKmRate = { auto: 10, car: 15, moto: 8 };
  const perMinuteRate = { auto: 2, car: 3, moto: 1.5 };

  const calc = (t) =>
    Math.round(
      baseFare[t] +
      (distanceKm * perKmRate[t]) +
      (durationMinutes * perMinuteRate[t])
    );

  return {
    auto: calc('auto'),
    car: calc('car'),
    moto: calc('moto'),
    meta: {
      distance_meters: distanceMeters,
      duration_seconds: distanceData.duration_seconds
    }
  };
};


function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}
module.exports.createRide = async ({
    user,
    pickup,
    destination,
    vehicleType,
    
  }) => {
    if (!user || !pickup || !destination || !vehicleType) {
      throw new Error('All fields are required');
    }
  
    const normalizedType = vehicleType === 'motorcycle' ? 'moto' : vehicleType;
  
    const fareResult = await module.exports.getFare(pickup, destination);
    const fareMap = fareResult;
    if (!fareMap[normalizedType]) throw new Error('Invalid vehicleType');
  
   

  
    const ride = await rideModel.create({
      user,
      pickup,
      destination,
      vehicleType: normalizedType,
      fare: fareMap[normalizedType],
      status: 'pending',
      distance: fareResult.meta.distance_meters,
      duration: fareResult.meta.duration_seconds,
      otp: getOtp(6)
    });
  
    return ride;
  };