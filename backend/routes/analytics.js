const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// Get total expense analytics for all vehicles
router.get('/total', auth, analyticsController.getTotalExpenseAnalytics);

// Get detailed analytics for a specific vehicle
router.get('/vehicle/:vehicleId', auth, analyticsController.getVehicleAnalytics);

// Get comparative analytics between vehicles
router.get('/comparative', auth, analyticsController.getComparativeAnalytics);

// Get fuel price trends
router.get('/fuel-prices', auth, analyticsController.getFuelPriceTrends);

// Trip analytics routes
router.get('/trips', auth, analyticsController.getTripAnalytics);
router.get('/trips/vehicle/:vehicleId', auth, analyticsController.getVehicleTripAnalytics);
router.get('/trips/comparative', auth, analyticsController.getComparativeTripAnalytics);

module.exports = router;