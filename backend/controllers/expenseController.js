const expenseService = require('../services/expenseService');
const mongoose = require('mongoose');

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { expenses, pagination } = await expenseService.getExpenses(req.user.id, req.query);

    res.json({
      success: true,
      data: expenses,
      pagination
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);

    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await expenseService.getExpenseById(req.user.id, req.params.id);

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error fetching expense:', error);

    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const expense = await expenseService.createExpense(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    console.error('Error creating expense:', error);

    if (error.message.includes('Invalid') || error.message.includes('required') || error.message.includes('not found')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await expenseService.updateExpense(req.user.id, req.params.id, req.body);

    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);

    if (error.message.includes('Invalid') || error.message.includes('required') || error.message.includes('not found')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete expense (soft delete)
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    await expenseService.deleteExpense(req.user.id, req.params.id);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);

    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get expense statistics for a vehicle
// @route   GET /api/expenses/stats/:vehicleId
// @access  Private
const getVehicleExpenseStats = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;

    const data = await expenseService.getVehicleExpenseStats(
      req.user.id,
      vehicleId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);

    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get fuel expenses for efficiency calculations
// @route   GET /api/expenses/fuel/:vehicleId
// @access  Private
const getFuelExpenses = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 50 } = req.query;

    const fuelExpenses = await expenseService.getFuelExpenses(
      req.user.id,
      vehicleId,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: fuelExpenses
    });
  } catch (error) {
    console.error('Error fetching fuel expenses:', error);

    if (error.message.includes('Invalid') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching fuel expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getVehicleExpenseStats,
  getFuelExpenses
};