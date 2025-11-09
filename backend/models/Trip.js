const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  startLocation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  endLocation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  distance: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Total distance in kilometers'
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Total cost for the trip (tolls, fuel, etc.) in INR'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  // Odometer readings for accurate tracking
  startOdometer: {
    type: Number,
    min: 0,
    comment: 'Odometer reading at trip start in kilometers'
  },
  endOdometer: {
    type: Number,
    min: 0,
    comment: 'Odometer reading at trip end in kilometers'
  },
  // Trip purpose/category
  purpose: {
    type: String,
    enum: [
      'Business',
      'Personal',
      'Commute',
      'Leisure',
      'Emergency',
      'Other'
    ],
    default: 'Personal'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
TripSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Calculate distance from odometer readings if both are provided
  if (this.startOdometer && this.endOdometer && !this.distance) {
    this.distance = this.endOdometer - this.startOdometer;
  }

  next();
});

// Create indexes for better performance
TripSchema.index({ user: 1, vehicle: 1, isActive: 1 });
TripSchema.index({ user: 1, date: -1, isActive: 1 });
TripSchema.index({ vehicle: 1, date: -1, isActive: 1 });

// Virtual for trip display information
TripSchema.virtual('displayInfo').get(function() {
  return `${this.startLocation} → ${this.endLocation} (${this.distance} km)`;
});

// Virtual for formatted cost
TripSchema.virtual('formattedCost').get(function() {
  return `₹${this.totalCost.toFixed(2)}`;
});

// Virtual for formatted date
TripSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Validation for odometer readings
TripSchema.pre('validate', function(next) {
  if (this.startOdometer && this.endOdometer && this.endOdometer < this.startOdometer) {
    this.invalidate('endOdometer', 'End odometer reading must be greater than start odometer reading');
  }
  next();
});

// Ensure virtuals are included in JSON
TripSchema.set('toJSON', { virtuals: true });
TripSchema.set('toObject', { virtuals: true });

// Static method to get trip statistics for a vehicle
TripSchema.statics.getVehicleTripStats = async function(vehicleId, startDate, endDate) {
  try {
    const matchQuery = {
      vehicle: vehicleId,
      isActive: true
    };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const stats = await this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalCost: { $sum: '$totalCost' },
          averageDistance: { $avg: '$distance' },
          averageCost: { $avg: '$totalCost' },
          earliestDate: { $min: '$date' },
          latestDate: { $max: '$date' }
        }
      }
    ]);

    return stats[0] || {
      totalTrips: 0,
      totalDistance: 0,
      totalCost: 0,
      averageDistance: 0,
      averageCost: 0
    };

  } catch (error) {
    console.error('Error in getVehicleTripStats:', error);
    return {
      totalTrips: 0,
      totalDistance: 0,
      totalCost: 0,
      averageDistance: 0,
      averageCost: 0
    };
  }
};

// Static method to get recent trips for a vehicle
TripSchema.statics.getRecentTrips = async function(vehicleId, limit = 10) {
  return this.find({
    vehicle: vehicleId,
    isActive: true
  })
  .sort({ date: -1 })
  .limit(limit)
  .populate('vehicle', 'vehicleName company model');
};

module.exports = mongoose.model('Trip', TripSchema);