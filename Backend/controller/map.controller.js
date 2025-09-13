const mapService = require('../services/map.service');
const { validationResult } = require('express-validator');

async function geocodeAddress(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { address } = req.query;
  if (!address) return res.status(400).json({ success: false, message: 'address is required' });

  try {
    const result = await mapService.getAddressCordinate(address);
    return res.json({
      success: true,
      data: {
        provider: result.provider,
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude
      }
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
}

async function getDistanceTime(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { origin, destination, profile } = req.query;
  if (!origin || !destination) {
    return res.status(400).json({ success: false, message: 'origin and destination are required' });
  }

  try {
    const result = await mapService.getDistanceTime(origin, destination, profile);
    return res.json({ success: true, data: result });
  } catch (e) {
    const notFound = /Route|Geocode failure|no route|NoRoute/i.test(e.message);
    return res.status(notFound ? 400 : 500).json({ success: false, message: e.message });
  }
}

module.exports = { geocodeAddress, getDistanceTime };