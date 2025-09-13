const router = require('express').Router();
const mapController = require('../controller/map.controller');
const { query } = require('express-validator');

router.get(
  '/geocode',
  [
    query('address')
      .trim()
      .isString().withMessage('address must be string')
      .isLength({ min: 3 }).withMessage('address too short')
  ],
  mapController.geocodeAddress
);

router.get(
  '/get-distance-time',
  [
    query('origin').trim().isLength({ min: 2 }).withMessage('origin required'),
    query('destination').trim().isLength({ min: 2 }).withMessage('destination required'),
    query('profile').optional().isIn(['driving', 'driving-traffic', 'walking', 'cycling'])
      .withMessage('invalid profile')
  ],
  mapController.getDistanceTime
);

router.get("/get-location-suggetion",
    [
        query('input')
            .trim()
            .isString().withMessage('input must be string')
            .isLength({ min: 1 }).withMessage('input too short')
    ],

     mapController.getLocationSuggetion);

module.exports = router;
