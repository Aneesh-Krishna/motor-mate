const Trip = require('../models/Trip');
const mongoose = require('mongoose');

// @desc    Get all trips for a user
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const { page = 1, limit = 20, vehicle, startDate, endDate } = req.query;

    // Build query
    const query = { user: req.user.id, isActive: true };

    // Add vehicle filter if provided
    if (vehicle && mongoose.Types.ObjectId.isValid(vehicle)) {
      query.vehicle = vehicle;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const trips = await Trip.find(query)
      .populate('vehicle', 'vehicleName company model')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      count: trips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: trips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trips',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    }).populate('vehicle', 'vehicleName company model');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      user: req.user.id
    };

    // Validate required fields
    const requiredFields = ['vehicle', 'date', 'startLocation', 'endLocation', 'distance', 'totalCost'];
    const missingFields = requiredFields.filter(field => !tripData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate date is not in future
    if (new Date(tripData.date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Trip date cannot be in the future'
      });
    }

    // Validate distance and cost are positive
    if (tripData.distance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Distance must be greater than 0'
      });
    }

    if (tripData.totalCost <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total cost must be greater than 0'
      });
    }

    // Validate odometer readings if provided
    if (tripData.startOdometer && tripData.endOdometer) {
      if (tripData.endOdometer <= tripData.startOdometer) {
        return res.status(400).json({
          success: false,
          message: 'End odometer reading must be greater than start odometer reading'
        });
      }
    }

    const trip = new Trip(tripData);
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'vehicleName company model');

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: populatedTrip
    });
  } catch (error) {
    console.error('Error creating trip:', error);

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
      message: 'Server error while creating trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Validate date is not in future if provided
    if (req.body.date && new Date(req.body.date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Trip date cannot be in the future'
      });
    }

    // Validate distance and cost are positive if provided
    if (req.body.distance !== undefined && req.body.distance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Distance must be greater than 0'
      });
    }

    if (req.body.totalCost !== undefined && req.body.totalCost <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total cost must be greater than 0'
      });
    }

    // Validate odometer readings if both are provided
    if (req.body.startOdometer && req.body.endOdometer) {
      if (req.body.endOdometer <= req.body.startOdometer) {
        return res.status(400).json({
          success: false,
          message: 'End odometer reading must be greater than start odometer reading'
        });
      }
    }

    Object.assign(trip, req.body);
    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'vehicleName company model');

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: updatedTrip
    });
  } catch (error) {
    console.error('Error updating trip:', error);

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
      message: 'Server error while updating trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete trip (soft delete)
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID format'
      });
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    trip.isActive = false;
    await trip.save();

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get trip statistics for a specific vehicle
// @route   GET /api/trips/stats/:vehicleId
// @access  Private
const getVehicleTripStats = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID format'
      });
    }

    const stats = await Trip.getVehicleTripStats(vehicleId, startDate, endDate);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting trip statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting trip statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get recent trips for a vehicle
// @route   GET /api/trips/recent/:vehicleId
// @access  Private
const getRecentTrips = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID format'
      });
    }

    const trips = await Trip.getRecentTrips(vehicleId, parseInt(limit));

    res.json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error('Error getting recent trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting recent trips',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getVehicleTripStats,
  getRecentTrips
};