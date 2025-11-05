const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
} = require('../controllers/vehicleController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Vehicle CRUD routes
router.route('/')
  .get(getVehicles)
  .post(createVehicle);

router.route('/stats')
  .get(getVehicleStats);

router.route('/:id')
  .get(getVehicleById)
  .put(updateVehicle)
  .delete(deleteVehicle);

module.exports = router;