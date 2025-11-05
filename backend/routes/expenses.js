const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  expenseValidationRules,
  expenseQueryValidationRules,
  mongoIdValidation,
  statsQueryValidationRules,
  fuelEfficiencyValidationRules,
  validate,
  validateDateRange,
  validateNotFutureDate,
  validateOdometerReading
} = require('../middleware/expenseValidation');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getVehicleExpenseStats,
  getFuelExpenses
} = require('../controllers/expenseController');

// Apply authentication middleware to all routes
router.use(auth);

// @route   GET /api/expenses
// @desc    Get all expenses for a user (with filtering and pagination)
// @access  Private
router.get('/', expenseQueryValidationRules(), validateDateRange, validate, getExpenses);

// @route   GET /api/expenses/:id
// @desc    Get single expense by ID
// @access  Private
router.get('/:id', mongoIdValidation('id'), validate, getExpenseById);

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/',
  expenseValidationRules(),
  validateNotFutureDate,
  validateOdometerReading,
  validate,
  createExpense
);

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id',
  mongoIdValidation('id'),
  expenseValidationRules(),
  validateNotFutureDate,
  validateOdometerReading,
  validate,
  updateExpense
);

// @route   DELETE /api/expenses/:id
// @desc    Delete expense (soft delete)
// @access  Private
router.delete('/:id', mongoIdValidation('id'), validate, deleteExpense);

// @route   GET /api/expenses/stats/:vehicleId
// @desc    Get expense statistics for a specific vehicle
// @access  Private
router.get('/stats/:vehicleId', statsQueryValidationRules(), validateDateRange, validate, getVehicleExpenseStats);

// @route   GET /api/expenses/fuel/:vehicleId
// @desc    Get fuel expenses for efficiency calculations
// @access  Private
router.get('/fuel/:vehicleId', fuelEfficiencyValidationRules(), validate, getFuelExpenses);

module.exports = router;