const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  tripValidationRules,
  tripQueryValidationRules,
  mongoIdValidation,
  statsQueryValidationRules,
  recentTripsValidationRules,
  validate,
  validateDateRange,
  validateOdometerReadings
} = require('../middleware/tripValidation');
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getVehicleTripStats,
  getRecentTrips
} = require('../controllers/tripController');

// Apply authentication middleware to all routes
router.use(auth);

// @route   GET /api/trips
// @desc    Get all trips for a user (with filtering and pagination)
// @access  Private
router.get('/', tripQueryValidationRules(), validateDateRange, validate, getTrips);

// @route   GET /api/trips/:id
// @desc    Get single trip by ID
// @access  Private
router.get('/:id', mongoIdValidation('id'), validate, getTripById);

// @route   POST /api/trips
// @desc    Create new trip
// @access  Private
router.post('/',
  tripValidationRules(),
  validateOdometerReadings,
  validate,
  createTrip
);

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id',
  mongoIdValidation('id'),
  tripValidationRules(),
  validateOdometerReadings,
  validate,
  updateTrip
);

// @route   DELETE /api/trips/:id
// @desc    Delete trip (soft delete)
// @access  Private
router.delete('/:id', mongoIdValidation('id'), validate, deleteTrip);

// @route   GET /api/trips/stats/:vehicleId
// @desc    Get trip statistics for a specific vehicle
// @access  Private
router.get('/stats/:vehicleId', mongoIdValidation('vehicleId'), statsQueryValidationRules(), validateDateRange, validate, getVehicleTripStats);

// @route   GET /api/trips/recent/:vehicleId
// @desc    Get recent trips for a vehicle
// @access  Private
router.get('/recent/:vehicleId', mongoIdValidation('vehicleId'), recentTripsValidationRules(), validate, getRecentTrips);

module.exports = router;