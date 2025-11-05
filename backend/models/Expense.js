const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
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
  expenseType: {
    type: String,
    required: true,
    enum: ['Fuel', 'Service', 'Other'],
    default: 'Other'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  odometerReading: {
    type: Number,
    required: function() {
      return this.expenseType === 'Fuel' || this.expenseType === 'Service';
    },
    min: 0
  },
  // Fuel specific fields
  fuelAmount: {
    type: Number,
    required: function() {
      return this.expenseType === 'Fuel';
    },
    min: 0,
    validate: {
      validator: function(value) {
        // Only validate fuel amount if expense type is Fuel
        return this.expenseType !== 'Fuel' || (value > 0);
      },
      message: 'Fuel amount is required and must be greater than 0 for fuel expenses'
    }
  },
  fuelUnit: {
    type: String,
    enum: ['liters', 'gallons'],
    default: 'liters',
    required: function() {
      return this.expenseType === 'Fuel';
    }
  },
  pricePerUnit: {
    type: Number,
    min: 0,
    validate: {
      validator: function(value) {
        // Only calculate if it's a fuel expense and fuel amount is provided
        return this.expenseType !== 'Fuel' || this.fuelAmount <= 0 || value >= 0;
      },
      message: 'Price per unit must be non-negative for fuel expenses'
    }
  },
  // Service specific fields
  serviceDescription: {
    type: String,
    required: function() {
      return this.expenseType === 'Service';
    },
    trim: true,
    maxlength: 500,
    validate: {
      validator: function(value) {
        return this.expenseType !== 'Service' || (value && value.trim().length > 0);
      },
      message: 'Service description is required for service expenses'
    }
  },
  serviceType: {
    type: String,
    enum: [
      'Oil Change',
      'Tire Service',
      'Brake Service',
      'Engine Service',
      'Transmission Service',
      'Battery Service',
      'AC Service',
      'General Maintenance',
      'Repair',
      'Inspection',
      'Other'
    ],
    required: function() {
      return this.expenseType === 'Service';
    }
  },
  // Other expense fields
  description: {
    type: String,
    required: function() {
      return this.expenseType === 'Other';
    },
    trim: true,
    maxlength: 500,
    validate: {
      validator: function(value) {
        return this.expenseType !== 'Other' || (value && value.trim().length > 0);
      },
      message: 'Description is required for other expenses'
    }
  },
  category: {
    type: String,
    enum: [
      'Parking',
      'Toll',
      'Car Wash',
      'Insurance',
      'Registration',
      'Tax',
      'Fine',
      'Accessories',
      'Other'
    ],
    required: function() {
      return this.expenseType === 'Other';
    }
  },
  // Common fields
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Bank Transfer', 'Other'],
    default: 'Other'
  },
  receiptNumber: {
    type: String,
    trim: true,
    maxlength: 100
  },
  // For trip tracking (if this expense is related to a specific trip)
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
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
ExpenseSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Calculate price per unit for fuel expenses if not provided
  if (this.expenseType === 'Fuel' && this.fuelAmount > 0 && !this.pricePerUnit) {
    this.pricePerUnit = this.amount / this.fuelAmount;
  }

  next();
});

// Create indexes for better performance
ExpenseSchema.index({ user: 1, vehicle: 1, isActive: 1 });
ExpenseSchema.index({ user: 1, expenseType: 1, isActive: 1 });
ExpenseSchema.index({ vehicle: 1, date: -1, isActive: 1 });
ExpenseSchema.index({ date: -1, isActive: 1 });

// Virtual for expense display info
ExpenseSchema.virtual('displayInfo').get(function() {
  let info = `${this.expenseType}: $${this.amount.toFixed(2)}`;
  if (this.expenseType === 'Fuel' && this.fuelAmount) {
    info += ` (${this.fuelAmount} ${this.fuelUnit})`;
  }
  return info;
});

// Virtual for fuel efficiency calculation
ExpenseSchema.virtual('fuelEfficiency').get(function() {
  if (this.expenseType === 'Fuel' && this.fuelAmount > 0 && this.odometerReading) {
    // This would need previous odometer reading to calculate accurately
    // For now, return null to indicate it needs calculation
    return null;
  }
  return null;
});

// Ensure virtuals are included in JSON
ExpenseSchema.set('toJSON', { virtuals: true });
ExpenseSchema.set('toObject', { virtuals: true });

// Static method to get expense statistics for a vehicle
ExpenseSchema.statics.getVehicleExpenseStats = async function(vehicleId, startDate, endDate) {
  const matchCondition = {
    vehicle: vehicleId,
    isActive: true
  };

  if (startDate && endDate) {
    matchCondition.date = {
      $gte: startDate,
      $lte: endDate
    };
  }

  const stats = await this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$expenseType',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: '$totalAmount' },
        expenseBreakdown: {
          $push: {
            type: '$_id',
            total: '$totalAmount',
            count: '$count',
            average: '$avgAmount'
          }
        }
      }
    }
  ]);

  return stats[0] || { totalExpenses: 0, expenseBreakdown: [] };
};

// Static method to get fuel expenses for efficiency calculations
ExpenseSchema.statics.getFuelExpensesForVehicle = async function(vehicleId, limit = 50) {
  return this.find({
    vehicle: vehicleId,
    expenseType: 'Fuel',
    isActive: true,
    odometerReading: { $exists: true, $gt: 0 }
  })
  .sort({ date: -1, odometerReading: -1 })
  .limit(limit)
  .populate('vehicle', 'vehicleName company model');
};

module.exports = mongoose.model('Expense', ExpenseSchema);