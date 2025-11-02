const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  model: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'],
    default: 'Petrol'
  },
  purchasedDate: {
    type: Date,
    required: true
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  vehicleCost: {
    type: Number,
    required: true,
    min: 0
  },
  insuranceExpiry: {
    type: Date,
    required: true
  },
  insuranceNumber: {
    type: String,
    trim: true,
    maxlength: 50
  },
  emissionTestExpiry: {
    type: Date,
    trim: true
  },
  odometerReading: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  vehicleRegistrationNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
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
VehicleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better performance
VehicleSchema.index({ user: 1, isActive: 1 });
VehicleSchema.index({ user: 1, nickname: 1 });
VehicleSchema.index({ vin: 1 }, { sparse: true });
VehicleSchema.index({ licensePlate: 1 }, { sparse: true });

// Virtual for vehicle display name
VehicleSchema.virtual('displayName').get(function() {
  return `${this.vehicleName} (${this.company} ${this.model})`;
});

// Ensure virtuals are included in JSON
VehicleSchema.set('toJSON', { virtuals: true });
VehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);