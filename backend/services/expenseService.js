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
      fuelAmount: expenseData.fuelAmount ? parseFloat(expenseData.fuelAmount) : undefined,
      pricePerUnit: expenseData.pricePerUnit ? parseFloat(expenseData.pricePerUnit) : undefined
    });

    await expense.save();
    await expense.populate('vehicle', 'vehicleName company model vehicleRegistrationNumber');

    return expense;
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

    // Update fields
    const allowedFields = [
      'expenseType', 'amount', 'date', 'odometerReading',
      'fuelAmount', 'fuelUnit', 'pricePerUnit',
      'serviceDescription', 'serviceType',
      'description', 'category',
      'notes', 'location', 'paymentMethod', 'receiptNumber'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'amount' || field === 'odometerReading' || field === 'fuelAmount' || field === 'pricePerUnit') {
          expense[field] = parseFloat(updateData[field]);
        } else if (field === 'date') {
          expense[field] = new Date(updateData[field]);
        } else {
          expense[field] = updateData[field];
        }
      }
    });

    await expense.save();
    await expense.populate('vehicle', 'vehicleName company model vehicleRegistrationNumber');

    return expense;
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

    expense.isActive = false;
    await expense.save();

    return true;
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
      const fuelUsed = currentExpense.fuelAmount;

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
      ? ['vehicle', 'expenseType', 'amount', 'date']
      : [];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (data.amount !== undefined && (isNaN(data.amount) || parseFloat(data.amount) <= 0)) {
      throw new Error('Amount must be a positive number');
    }

    if (data.expenseType && !['Fuel', 'Service', 'Other'].includes(data.expenseType)) {
      throw new Error('Invalid expense type');
    }

    if (data.fuelAmount !== undefined && data.fuelAmount <= 0) {
      throw new Error('Fuel amount must be positive');
    }

    if (data.odometerReading !== undefined && data.odometerReading < 0) {
      throw new Error('Odometer reading cannot be negative');
    }
  }

  /**
   * Validate expense type-specific fields
   * @param {Object} data - Expense data
   */
  async validateExpenseTypeSpecificFields(data) {
    switch (data.expenseType) {
      case 'Fuel':
        if (!data.fuelAmount || data.fuelAmount <= 0) {
          throw new Error('Fuel amount is required for fuel expenses');
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
        if (!data.description || !data.description.trim()) {
          throw new Error('Description is required for other expenses');
        }
        if (!data.category) {
          throw new Error('Category is required for other expenses');
        }
        break;
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