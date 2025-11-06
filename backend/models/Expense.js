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
  // For "Other" type - allow specification
  otherExpenseType: {
    type: String,
    required: function() {
      return this.expenseType === 'Other';
    },
    trim: true,
    maxlength: 100
  },
  // All amounts in INR
  amount: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Amount in INR'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  // Optional receipt number
  receiptNumber: {
    type: String,
    trim: true,
    maxlength: 100,
    required: false
  },
  // Odometer reading in kms (required for all expense types)
  odometerReading: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Odometer reading in kilometers'
  },
  // Fuel specific fields
  // Total fuel in liters (floating point)
  totalFuel: {
    type: Number,
    required: function() {
      return this.expenseType === 'Fuel';
    },
    min: 0,
    validate: {
      validator: function(value) {
        return this.expenseType !== 'Fuel' || (value > 0);
      },
      message: 'Total fuel is required and must be greater than 0 for fuel expenses'
    }
  },
  // Total cost in INR for fuel expenses
  totalCost: {
    type: Number,
    required: function() {
      return this.expenseType === 'Fuel';
    },
    min: 0,
    validate: {
      validator: function(value) {
        return this.expenseType !== 'Fuel' || (value > 0);
      },
      message: 'Total cost is required and must be greater than 0 for fuel expenses'
    }
  },
  // Fuel added in liters (floating point)
  fuelAdded: {
    type: Number,
    required: function() {
      return this.expenseType === 'Fuel';
    },
    min: 0,
    validate: {
      validator: function(value) {
        return this.expenseType !== 'Fuel' || (value > 0);
      },
      message: 'Fuel added is required and must be greater than 0 for fuel expenses'
    }
  },
  // Odometer reading at next fueling (for mileage calculation)
  nextFuelingOdometer: {
    type: Number,
    min: 0,
    comment: 'Odometer reading at next fueling for mileage calculation'
  },
  // Calculated mileage (kms/litre) - stored when both odometer readings are available
  mileage: {
    type: Number,
    min: 0,
    comment: 'Calculated mileage in kms/litre'
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
    required: false // Made optional since frontend doesn't provide this field
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
  if (this.expenseType === 'Fuel' && this.totalFuel > 0 && !this.pricePerUnit) {
    this.pricePerUnit = this.amount / this.totalFuel;
  }

  // Calculate mileage for fuel expenses when both odometer readings are available
  if (this.expenseType === 'Fuel' && this.odometerReading && this.nextFuelingOdometer && this.fuelAdded) {
    const distanceTraveled = this.nextFuelingOdometer - this.odometerReading;
    if (distanceTraveled > 0 && this.fuelAdded > 0) {
      this.mileage = distanceTraveled / this.fuelAdded; // kms per litre
    } else {
      this.mileage = undefined; // Clear mileage if calculations are invalid
    }
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
  let info = `${this.expenseType}: ₹${this.amount.toFixed(2)}`;
  if (this.expenseType === 'Fuel' && this.totalFuel) {
    info += ` (${this.totalFuel}L)`;
  }
  return info;
});

// Virtual for fuel efficiency calculation (km per liter)
ExpenseSchema.virtual('fuelEfficiency').get(function() {
  if (this.expenseType === 'Fuel' && this.fuelAdded > 0 && this.nextFuelingOdometer && this.odometerReading) {
    const distanceTraveled = this.nextFuelingOdometer - this.odometerReading;
    if (distanceTraveled > 0) {
      return distanceTraveled / this.fuelAdded; // km per liter
    }
  }
  return null;
});

// Virtual for mileage display
ExpenseSchema.virtual('mileageInfo').get(function() {
  if (this.expenseType === 'Fuel') {
    const efficiency = this.fuelEfficiency;
    if (efficiency) {
      return `${efficiency.toFixed(2)} km/l`;
    }
    return 'Mileage calculation pending next fuel entry';
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
        totalExpenses: { $sum: '$amount' },
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

// Static method to calculate and update mileage for fuel expenses
ExpenseSchema.statics.calculateAndUpdateMileage = async function(vehicleId) {
  const fuelExpenses = await this.find({
    vehicle: vehicleId,
    expenseType: 'Fuel',
    isActive: true
  })
  .sort({ odometerReading: 1 }); // Sort by odometer reading ascending

  const mileageUpdates = [];

  for (let i = 0; i < fuelExpenses.length - 1; i++) {
    const currentExpense = fuelExpenses[i];
    const nextExpense = fuelExpenses[i + 1];

    // Calculate distance and fuel used between these two fuelings
    const distanceTraveled = nextExpense.odometerReading - currentExpense.odometerReading;
    const fuelUsed = nextExpense.fuelAdded;

    if (distanceTraveled > 0 && fuelUsed > 0) {
      // Update current expense with next fueling odometer and calculated mileage
      currentExpense.nextFuelingOdometer = nextExpense.odometerReading;
      currentExpense.mileage = distanceTraveled / fuelUsed; // km per liter
      await currentExpense.save();

      const mileage = distanceTraveled / fuelUsed; // km per liter
      mileageUpdates.push({
        expenseId: currentExpense._id,
        date: currentExpense.date,
        odometerStart: currentExpense.odometerReading,
        odometerEnd: nextExpense.odometerReading,
        distanceTraveled,
        fuelUsed,
        mileage: mileage.toFixed(2)
      });
    }
  }

  return mileageUpdates;
};

// Static method to get vehicle mileage statistics
ExpenseSchema.statics.getVehicleMileageStats = async function(vehicleId) {
  const fuelExpenses = await this.find({
    vehicle: vehicleId,
    expenseType: 'Fuel',
    isActive: true,
    nextFuelingOdometer: { $exists: true, $gt: 0 }
  }).populate('vehicle', 'vehicleName company model');

  const mileageData = fuelExpenses.map(expense => {
    const distance = expense.nextFuelingOdometer - expense.odometerReading;
    const mileage = distance / expense.fuelAdded;

    return {
      date: expense.date,
      odometerStart: expense.odometerReading,
      odometerEnd: expense.nextFuelingOdometer,
      distanceTraveled: distance,
      fuelUsed: expense.fuelAdded,
      mileage: mileage.toFixed(2)
    };
  }).filter(item => item.distanceTraveled > 0 && item.fuelUsed > 0);

  if (mileageData.length === 0) {
    return {
      averageMileage: 0,
      bestMileage: 0,
      worstMileage: 0,
      totalDistance: 0,
      totalFuel: 0,
      dataPoints: 0
    };
  }

  const totalDistance = mileageData.reduce((sum, item) => sum + item.distanceTraveled, 0);
  const totalFuel = mileageData.reduce((sum, item) => sum + item.fuelUsed, 0);
  const mileages = mileageData.map(item => parseFloat(item.mileage));

  return {
    averageMileage: (totalDistance / totalFuel).toFixed(2),
    bestMileage: Math.max(...mileages).toFixed(2),
    worstMileage: Math.min(...mileages).toFixed(2),
    totalDistance,
    totalFuel,
    dataPoints: mileageData.length,
    recentMileage: mileageData.slice(-5) // Last 5 data points
  };
};

module.exports = mongoose.model('Expense', ExpenseSchema);