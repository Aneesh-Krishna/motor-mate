const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

// @desc    Get all vehicles for a user
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user.id, isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID format'
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      user: req.user.id
    };

    // Validate required fields
    const requiredFields = ['vehicleName', 'company', 'model', 'fuelType', 'purchasedDate', 'vehicleCost', 'insuranceExpiry', 'odometerReading', 'vehicleRegistrationNumber', 'nextServiceDue'];
    const missingFields = requiredFields.filter(field => !vehicleData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate dates
    if (vehicleData.purchasedDate && new Date(vehicleData.purchasedDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Purchase date cannot be in the future'
      });
    }

    if (vehicleData.insuranceExpiry && new Date(vehicleData.insuranceExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Insurance expiry date must be in the future'
      });
    }

    if (vehicleData.nextServiceDue && new Date(vehicleData.nextServiceDue) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Next service due date must be in the future'
      });
    }

    if (vehicleData.emissionTestExpiry && new Date(vehicleData.emissionTestExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Emission test expiry date must be in the future'
      });
    }

    // Check for duplicate registration number for the same user
    if (vehicleData.vehicleRegistrationNumber) {
      const existingReg = await Vehicle.findOne({
        vehicleRegistrationNumber: vehicleData.vehicleRegistrationNumber,
        user: req.user.id,
        isActive: true
      });

      if (existingReg) {
        return res.status(400).json({
          success: false,
          message: 'A vehicle with this registration number already exists in your garage'
        });
      }
    }

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating vehicle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID format'
      });
    }

    let vehicle = await Vehicle.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Validate dates if provided
    if (req.body.purchasedDate && new Date(req.body.purchasedDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Purchase date cannot be in the future'
      });
    }

    if (req.body.insuranceExpiry && new Date(req.body.insuranceExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Insurance expiry date must be in the future'
      });
    }

    if (req.body.nextServiceDue && new Date(req.body.nextServiceDue) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Next service due date must be in the future'
      });
    }

    if (req.body.emissionTestExpiry && new Date(req.body.emissionTestExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Emission test expiry date must be in the future'
      });
    }

    // Check for duplicate registration number (excluding current vehicle)
    if (req.body.vehicleRegistrationNumber && req.body.vehicleRegistrationNumber !== vehicle.vehicleRegistrationNumber) {
      const existingReg = await Vehicle.findOne({
        vehicleRegistrationNumber: req.body.vehicleRegistrationNumber,
        user: req.user.id,
        isActive: true,
        _id: { $ne: req.params.id }
      });

      if (existingReg) {
        return res.status(400).json({
          success: false,
          message: 'A vehicle with this registration number already exists in your garage'
        });
      }
    }

    // Update vehicle
    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete vehicle (soft delete)
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID format'
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Soft delete by setting isActive to false
    await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting vehicle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get vehicle statistics for a user
// @route   GET /api/vehicles/stats
// @access  Private
const getVehicleStats = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user.id, isActive: true });

    const stats = {
      totalVehicles: vehicles.length,
      averageOdometer: 0,
      newestVehicle: null,
      oldestVehicle: null,
      totalCost: 0,
      vehiclesExpiringSoon: 0
    };

    if (vehicles.length > 0) {
      // Calculate average odometer reading
      const totalOdometer = vehicles.reduce((sum, vehicle) => sum + vehicle.odometerReading, 0);
      stats.averageOdometer = Math.round(totalOdometer / vehicles.length);

      // Find newest and oldest vehicles by purchase date
      const sortedByDate = [...vehicles].sort((a, b) => new Date(b.purchasedDate) - new Date(a.purchasedDate));
      stats.newestVehicle = sortedByDate[0];
      stats.oldestVehicle = sortedByDate[sortedByDate.length - 1];

      // Calculate total vehicle cost
      stats.totalCost = vehicles.reduce((sum, vehicle) => sum + vehicle.vehicleCost, 0);

      // Count vehicles with insurance expiring in next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      stats.vehiclesExpiringSoon = vehicles.filter(vehicle =>
        vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) <= thirtyDaysFromNow
      ).length;
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
};