const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

class ExpenseService {
  /**
   * Create a new expense with validation
   * @param {string} userId - User ID
   * @param {Object} expenseData - Expense data
   * @returns {Promise<Object>} Created expense
   */
  async createExpense(userId, expenseData) {
    // Validate required fields
    this.validateExpenseData(expenseData, true);

    // Verify vehicle ownership
    await this.verifyVehicleOwnership(expenseData.vehicle, userId);

    // Type-specific validation
    await this.validateExpenseTypeSpecificFields(expenseData);

    // Create expense
    const expense = new Expense({
      ...expenseData,
      user: userId,
      amount: parseFloat(expenseData.amount),
      date: new Date(expenseData.date),
      odometerReading: expenseData.odometerReading ? parseInt(expenseData.odometerReading) : undefined,
      totalFuel: expenseData.totalFuel ? parseFloat(expenseData.totalFuel) : undefined,
      totalCost: expenseData.totalCost ? parseFloat(expenseData.totalCost) : undefined,
      fuelAdded: expenseData.fuelAdded ? parseFloat(expenseData.fuelAdded) : undefined,
      nextFuelingOdometer: expenseData.nextFuelingOdometer ? parseInt(expenseData.nextFuelingOdometer) : undefined
    });

    try {
      await expense.save();

      // Auto-update previous fuel expense's nextFuelingOdometer if this is a fuel expense
      if (expense.expenseType === 'Fuel' && expense.odometerReading) {
        await this.updatePreviousFuelExpenseNextOdometer(expense);
      }

      await expense.populate('vehicle', 'vehicleName company model vehicleRegistrationNumber');
      return expense;
    } catch (saveError) {
      console.error('Error creating expense:', saveError);
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw new Error('Failed to create expense');
    }
  }

  /**
   * Get expenses with filtering and pagination
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Expenses and pagination info
   */
  async getExpenses(userId, filters = {}) {
    const {
      vehicleId,
      expenseType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = filters;

    // Build query
    let query = { user: userId, isActive: true };

    if (vehicleId) {
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        throw new Error('Invalid vehicle ID format');
      }
      query.vehicle = vehicleId;
    }

    if (expenseType && ['Fuel', 'Service', 'Other'].includes(expenseType)) {
      query.expenseType = expenseType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const expenses = await Expense.find(query)
      .populate('vehicle', 'vehicleName company model vehicleRegistrationNumber')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(query);

    return {
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Get single expense by ID
   * @param {string} userId - User ID
   * @param {string} expenseId - Expense ID
   * @returns {Promise<Object>} Expense
   */
  async getExpenseById(userId, expenseId) {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      throw new Error('Invalid expense ID format');
    }

    const expense = await Expense.findOne({
      _id: expenseId,
      user: userId,
      isActive: true
    }).populate('vehicle', 'vehicleName company model vehicleRegistrationNumber');

    if (!expense) {
      throw new Error('Expense not found');
    }

    return expense;
  }

  /**
   * Update expense
   * @param {string} userId - User ID
   * @param {string} expenseId - Expense ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated expense
   */
  async updateExpense(userId, expenseId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      throw new Error('Invalid expense ID format');
    }

    const expense = await Expense.findOne({
      _id: expenseId,
      user: userId,
      isActive: true
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Validate update data
    this.validateExpenseData(updateData, false);

    // Type-specific validation for updates
    await this.validateExpenseTypeSpecificFields({ ...expense.toObject(), ...updateData });

    // Capture original odometer reading before update (for tracking changes)
    const originalOdometerReading = expense.odometerReading;

    // Update fields
    const allowedFields = [
      'expenseType', 'otherExpenseType', 'amount', 'date', 'description', 'receiptNumber', 'odometerReading',
      'totalFuel', 'totalCost', 'fuelAdded', 'nextFuelingOdometer',
      'serviceDescription', 'serviceType', 'category',
      'notes', 'location', 'paymentMethod'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'odometerReading' || field === 'nextFuelingOdometer') {
          // Only update if the value is not empty string, null, or undefined
          if (updateData[field] !== '' && updateData[field] !== null && updateData[field] !== undefined) {
            const parsedValue = parseInt(updateData[field]);
            if (isNaN(parsedValue)) {
              throw new Error(`${field} must be a valid integer`);
            }
            expense[field] = parsedValue;
          }
          // If the value is empty/null/undefined, don't update the existing value (preserve it)
        } else if (field === 'amount' ||
            field === 'totalFuel' || field === 'totalCost' || field === 'fuelAdded') {
          // Only update if the value is not empty string, null, or undefined
          if (updateData[field] !== '' && updateData[field] !== null && updateData[field] !== undefined) {
            const parsedValue = parseFloat(updateData[field]);
            if (isNaN(parsedValue)) {
              throw new Error(`${field} must be a valid number`);
            }
            expense[field] = parsedValue;
          }
        } else if (field === 'date') {
          if (updateData[field] !== '' && updateData[field] !== null && updateData[field] !== undefined) {
            expense[field] = new Date(updateData[field]);
          }
        } else {
          // For non-numeric fields, only update if not empty string
          if (updateData[field] !== '' && updateData[field] !== null && updateData[field] !== undefined) {
            expense[field] = updateData[field];
          }
        }
      }
    });

    try {
      await expense.save();

      // Auto-update previous fuel expense's nextFuelingOdometer if this is a fuel expense and odometer changed
      if (expense.expenseType === 'Fuel' && updateData.odometerReading && expense.odometerReading) {
        await this.updatePreviousFuelExpenseNextOdometer(expense);

        // Also update the next fuel expense that was referencing this expense's old odometer
        await this.updateNextFuelExpenseNextOdometer(expense, originalOdometerReading);
      }

      await expense.populate('vehicle', 'vehicleName company model vehicleRegistrationNumber');
      return expense;
    } catch (saveError) {
      console.error('Error updating expense:', saveError);
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(err => err.message);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
      throw new Error('Failed to update expense');
    }
  }

  /**
   * Delete expense (soft delete)
   * @param {string} userId - User ID
   * @param {string} expenseId - Expense ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteExpense(userId, expenseId) {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      throw new Error('Invalid expense ID format');
    }

    const expense = await Expense.findOne({
      _id: expenseId,
      user: userId,
      isActive: true
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    try {
      expense.isActive = false;
      await expense.save();
      return true;
    } catch (saveError) {
      console.error('Error soft deleting expense:', saveError);
      throw new Error('Failed to delete expense');
    }
  }

  /**
   * Get expense statistics for a vehicle
   * @param {string} userId - User ID
   * @param {string} vehicleId - Vehicle ID
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @returns {Promise<Object>} Statistics and recent expenses
   */
  async getVehicleExpenseStats(userId, vehicleId, startDate = null, endDate = null) {
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      throw new Error('Invalid vehicle ID format');
    }

    // Verify vehicle ownership
    await this.verifyVehicleOwnership(vehicleId, userId);

    const stats = await Expense.getVehicleExpenseStats(vehicleId, startDate, endDate);

    // Get recent expenses
    const recentExpenses = await Expense.find({
      vehicle: vehicleId,
      user: userId,
      isActive: true
    })
      .populate('vehicle', 'vehicleName company model')
      .sort({ date: -1 })
      .limit(5);

    return { stats, recentExpenses };
  }

  /**
   * Get fuel expenses for efficiency calculations
   * @param {string} userId - User ID
   * @param {string} vehicleId - Vehicle ID
   * @param {number} limit - Maximum number of records
   * @returns {Promise<Array>} Fuel expenses
   */
  async getFuelExpenses(userId, vehicleId, limit = 50) {
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      throw new Error('Invalid vehicle ID format');
    }

    // Verify vehicle ownership
    await this.verifyVehicleOwnership(vehicleId, userId);

    return await Expense.getFuelExpensesForVehicle(vehicleId, parseInt(limit));
  }

  /**
   * Calculate fuel efficiency from consecutive fuel expenses
   * @param {string} userId - User ID
   * @param {string} vehicleId - Vehicle ID
   * @param {number} limit - Maximum number of records to analyze
   * @returns {Promise<Array>} Fuel efficiency data points
   */
  async calculateFuelEfficiency(userId, vehicleId, limit = 20) {
    const fuelExpenses = await this.getFuelExpenses(userId, vehicleId, limit);

    const efficiencyData = [];

    for (let i = 0; i < fuelExpenses.length - 1; i++) {
      const currentExpense = fuelExpenses[i];
      const previousExpense = fuelExpenses[i + 1];

      const distanceTraveled = currentExpense.odometerReading - previousExpense.odometerReading;
      const fuelUsed = currentExpense.fuelAdded;

      if (distanceTraveled > 0 && fuelUsed > 0) {
        const efficiency = distanceTraveled / fuelUsed; // km per liter

        efficiencyData.push({
          date: currentExpense.date,
          odometerReading: currentExpense.odometerReading,
          fuelAmount: fuelUsed,
          distanceTraveled,
          efficiency,
          unit: 'km/L'
        });
      }
    }

    return efficiencyData.sort((a, b) => b.date - a.date);
  }

  /**
   * Calculate and update mileage for fuel expenses
   * @param {string} userId - User ID
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise<Array>} Updated mileage data
   */
  async calculateAndUpdateMileage(userId, vehicleId) {
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      throw new Error('Invalid vehicle ID format');
    }

    // Verify vehicle ownership
    await this.verifyVehicleOwnership(vehicleId, userId);

    return await Expense.calculateAndUpdateMileage(vehicleId);
  }

  /**
   * Get vehicle mileage statistics
   * @param {string} userId - User ID
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise<Object>} Mileage statistics
   */
  async getVehicleMileageStats(userId, vehicleId) {
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      throw new Error('Invalid vehicle ID format');
    }

    // Verify vehicle ownership
    await this.verifyVehicleOwnership(vehicleId, userId);

    return await Expense.getVehicleMileageStats(vehicleId);
  }

  /**
   * Get monthly expense summary
   * @param {string} userId - User ID
   * @param {number} months - Number of months to look back
   * @returns {Promise<Array>} Monthly expense data
   */
  async getMonthlyExpenseSummary(userId, months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isActive: true,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            expenseType: '$expenseType'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          totalExpenses: { $sum: '$totalAmount' },
          expenseBreakdown: {
            $push: {
              type: '$_id.expenseType',
              total: '$totalAmount',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]);

    return monthlyData;
  }

  /**
   * Validate expense data
   * @param {Object} data - Expense data to validate
   * @param {boolean} isCreate - Whether this is for creating a new expense
   */
  validateExpenseData(data, isCreate) {
    const requiredFields = isCreate
      ? ['vehicle', 'expenseType', 'amount', 'date', 'description', 'odometerReading']
      : [];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (data.amount !== undefined && (isNaN(data.amount) || parseFloat(data.amount) <= 0)) {
      throw new Error('Amount must be a positive number (in INR)');
    }

    if (data.expenseType && !['Fuel', 'Service', 'Other'].includes(data.expenseType)) {
      throw new Error('Invalid expense type');
    }

    if (data.expenseType === 'Other' && !data.otherExpenseType) {
      throw new Error('Other expense type specification is required');
    }

    // Fuel-specific validations - only apply to fuel expenses
    if (data.expenseType === 'Fuel') {
      if (data.totalFuel !== undefined && data.totalFuel <= 0) {
        throw new Error('Total fuel must be positive');
      }

      if (data.fuelAdded !== undefined && data.fuelAdded <= 0) {
        throw new Error('Fuel added must be positive');
      }

      if (data.totalCost !== undefined && data.totalCost <= 0) {
        throw new Error('Total cost must be positive');
      }
    }

    if (data.odometerReading !== undefined && data.odometerReading < 0) {
      throw new Error('Odometer reading cannot be negative');
    }

    if (data.nextFuelingOdometer !== undefined && data.nextFuelingOdometer < 0) {
      throw new Error('Next fueling odometer reading cannot be negative');
    }
  }

  /**
   * Validate expense type-specific fields
   * @param {Object} data - Expense data
   */
  async validateExpenseTypeSpecificFields(data) {
    switch (data.expenseType) {
      case 'Fuel':
        if (!data.totalFuel || data.totalFuel <= 0) {
          throw new Error('Total fuel is required for fuel expenses');
        }
        if (!data.totalCost || data.totalCost <= 0) {
          throw new Error('Total cost is required for fuel expenses');
        }
        if (!data.fuelAdded || data.fuelAdded <= 0) {
          throw new Error('Fuel added is required for fuel expenses');
        }
        if (!data.odometerReading || data.odometerReading < 0) {
          throw new Error('Odometer reading is required for fuel expenses');
        }
        break;

      case 'Service':
        if (!data.serviceDescription || !data.serviceDescription.trim()) {
          throw new Error('Service description is required for service expenses');
        }
        if (!data.odometerReading || data.odometerReading < 0) {
          throw new Error('Odometer reading is required for service expenses');
        }
        break;

      case 'Other':
        if (!data.otherExpenseType || !data.otherExpenseType.trim()) {
          throw new Error('Other expense type specification is required');
        }
        break;
    }
  }

  /**
   * Auto-update previous fuel expense's nextFuelingOdometer
   * @param {Object} newExpense - Newly created or updated fuel expense
   */
  async updatePreviousFuelExpenseNextOdometer(newExpense) {
    try {
      // Find the most recent fuel expense for the same vehicle, excluding the current one
      const previousFuelExpense = await Expense.findOne({
        _id: { $ne: newExpense._id }, // Exclude current expense
        vehicle: newExpense.vehicle,
        expenseType: 'Fuel',
        isActive: true,
        odometerReading: { $lt: newExpense.odometerReading } // Previous fueling should have lower odometer
      })
      .sort({ odometerReading: -1, date: -1 }) // Get the most recent one by odometer and date
      .exec();

      if (previousFuelExpense && !previousFuelExpense.nextFuelingOdometer) {
        // Update the previous fuel expense's nextFuelingOdometer with current expense's odometer
        previousFuelExpense.nextFuelingOdometer = newExpense.odometerReading;
        await previousFuelExpense.save();

        console.log(`Updated previous fuel expense ${previousFuelExpense._id} nextFuelingOdometer to ${newExpense.odometerReading}`);
      }
    } catch (error) {
      // Log the error but don't fail the expense creation
      console.error('Error updating previous fuel expense nextFuelingOdometer:', error);
      // This is a non-critical operation, so we don't throw an error
    }
  }

  /**
   * Auto-update next fuel expense's nextFuelingOdometer when current expense's odometer changes
   * @param {Object} updatedExpense - The updated fuel expense
   * @param {number} oldOdometerReading - The original odometer reading before update
   */
  async updateNextFuelExpenseNextOdometer(updatedExpense, oldOdometerReading) {
    try {
      // Find the next fuel expense that was referencing the old odometer reading
      const nextFuelExpense = await Expense.findOne({
        _id: { $ne: updatedExpense._id }, // Exclude current expense
        vehicle: updatedExpense.vehicle,
        expenseType: 'Fuel',
        isActive: true,
        nextFuelingOdometer: oldOdometerReading // Find expense that had old odometer as nextFuelingOdometer
      })
      .sort({ odometerReading: 1, date: 1 }) // Get the next one by odometer and date
      .exec();

      if (nextFuelExpense) {
        // Update the next fuel expense's nextFuelingOdometer with the new odometer reading
        nextFuelExpense.nextFuelingOdometer = updatedExpense.odometerReading;
        await nextFuelExpense.save();

        console.log(`Updated next fuel expense ${nextFuelExpense._id} nextFuelingOdometer from ${oldOdometerReading} to ${updatedExpense.odometerReading}`);
      }
    } catch (error) {
      // Log the error but don't fail the expense update
      console.error('Error updating next fuel expense nextFuelingOdometer:', error);
      // This is a non-critical operation, so we don't throw an error
    }
  }

  /**
   * Verify vehicle ownership
   * @param {string} vehicleId - Vehicle ID
   * @param {string} userId - User ID
   */
  async verifyVehicleOwnership(vehicleId, userId) {
    const vehicleExists = await Vehicle.findOne({
      _id: vehicleId,
      user: userId,
      isActive: true
    });

    if (!vehicleExists) {
      throw new Error('Vehicle not found or does not belong to user');
    }

    return vehicleExists;
  }
}

module.exports = new ExpenseService();