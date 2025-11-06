const { body, param, query, validationResult } = require('express-validator');

// Validation rules for creating/updating expenses
const expenseValidationRules = () => {
  return [
    // Vehicle validation
    body('vehicle')
      .notEmpty()
      .withMessage('Vehicle ID is required')
      .isMongoId()
      .withMessage('Invalid vehicle ID format'),

    // Expense type validation
    body('expenseType')
      .notEmpty()
      .withMessage('Expense type is required')
      .isIn(['Fuel', 'Service', 'Other'])
      .withMessage('Expense type must be Fuel, Service, or Other'),

    // Other expense type validation (conditional)
    body('otherExpenseType')
      .if(body('expenseType').equals('Other'))
      .notEmpty()
      .withMessage('Other expense type specification is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Other expense type must be between 1 and 100 characters'),

    // Amount validation (in INR)
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be a positive number (in INR)'),

    // Date validation
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid date'),

    // Description validation (now required for all types)
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1 and 500 characters'),

    // Receipt number validation (optional)
    body('receiptNumber')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Receipt number cannot exceed 100 characters'),

    // Odometer reading validation (now required for all types)
    body('odometerReading')
      .notEmpty()
      .withMessage('Odometer reading is required')
      .isInt({ min: 0 })
      .withMessage('Odometer reading must be a non-negative integer'),

    // Fuel-specific validations (conditional)
    body('fuelAmount')
      .if(body('expenseType').equals('Fuel'))
      .notEmpty()
      .withMessage('Fuel amount is required for fuel expenses')
      .isFloat({ gt: 0 })
      .withMessage('Fuel amount must be a positive number'),

    body('totalFuel')
      .if(body('expenseType').equals('Fuel'))
      .notEmpty()
      .withMessage('Total fuel is required for fuel expenses')
      .isFloat({ gt: 0 })
      .withMessage('Total fuel must be a positive number'),

    body('totalCost')
      .if(body('expenseType').equals('Fuel'))
      .notEmpty()
      .withMessage('Total cost is required for fuel expenses')
      .isFloat({ gt: 0 })
      .withMessage('Total cost must be a positive number (in INR)'),

    body('fuelAdded')
      .if(body('expenseType').equals('Fuel'))
      .notEmpty()
      .withMessage('Fuel added is required for fuel expenses')
      .isFloat({ gt: 0 })
      .withMessage('Fuel added must be a positive number'),

    body('nextFuelingOdometer')
      .optional({ values: 'falsy' })
      .custom((value) => {
        if (value === '' || value === null || value === undefined) {
          return true; // Allow empty values
        }
        const num = parseInt(value);
        if (isNaN(num) || num < 0) {
          throw new Error('Next fueling odometer must be a non-negative integer');
        }
        return true;
      }),

    // Service-specific validations (conditional)
    body('serviceDescription')
      .if(body('expenseType').equals('Service'))
      .notEmpty()
      .withMessage('Service description is required for service expenses')
      .isLength({ min: 1, max: 500 })
      .withMessage('Service description must be between 1 and 500 characters'),

    body('serviceType')
      .if(body('expenseType').equals('Service'))
      .isIn([
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
      ])
      .withMessage('Invalid service type'),

    // Service-specific validations (conditional)
    body('serviceDescription')
      .if(body('expenseType').equals('Service'))
      .notEmpty()
      .withMessage('Service description is required for service expenses')
      .isLength({ min: 1, max: 500 })
      .withMessage('Service description must be between 1 and 500 characters'),

    body('serviceType')
      .if(body('expenseType').equals('Service'))
      .isIn([
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
      ])
      .withMessage('Invalid service type'),

    // Optional fields validation
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters'),

    body('location')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Location cannot exceed 200 characters'),

    body('paymentMethod')
      .optional()
      .isIn(['Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Bank Transfer', 'Other'])
      .withMessage('Invalid payment method'),

    body('receiptNumber')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Receipt number cannot exceed 100 characters')
  ];
};

// Validation rules for query parameters
const expenseQueryValidationRules = () => {
  return [
    query('vehicleId')
      .optional()
      .isMongoId()
      .withMessage('Invalid vehicle ID format'),

    query('expenseType')
      .optional()
      .isIn(['Fuel', 'Service', 'Other'])
      .withMessage('Expense type must be Fuel, Service, or Other'),

    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),

    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),

    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('sortBy')
      .optional()
      .isIn(['date', 'amount', 'expenseType', 'createdAt'])
      .withMessage('Invalid sort field'),

    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ];
};

// Validation rules for MongoDB ObjectId in params
const mongoIdValidation = (paramName = 'id') => {
  return [
    param(paramName)
      .isMongoId()
      .withMessage(`Invalid ${paramName} format`)
  ];
};

// Custom validation for fuel efficiency calculation
const fuelEfficiencyValidationRules = () => {
  return [
    param('vehicleId')
      .isMongoId()
      .withMessage('Invalid vehicle ID format'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ];
};

// Validation for stats query parameters
const statsQueryValidationRules = () => {
  return [
    param('vehicleId')
      .isMongoId()
      .withMessage('Invalid vehicle ID format'),

    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),

    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ];
};

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};

// Custom validation middleware for date ranges
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    // Check if date range is too large (e.g., more than 2 years)
    const maxRange = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
    if (end - start > maxRange) {
      return res.status(400).json({
        success: false,
        message: 'Date range cannot exceed 2 years'
      });
    }
  }

  next();
};

// Custom validation for future dates
const validateNotFutureDate = (req, res, next) => {
  const { date } = req.body;

  if (date) {
    const expenseDate = new Date(date);
    const now = new Date();

    // Allow expenses up to 1 day in the future (for time zone differences)
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (expenseDate > oneDayFromNow) {
      return res.status(400).json({
        success: false,
        message: 'Expense date cannot be more than 1 day in the future'
      });
    }
  }

  next();
};

// Custom validation for reasonable odometer readings
const validateOdometerReading = (req, res, next) => {
  const { odometerReading, vehicle } = req.body;

  if (odometerReading !== undefined && vehicle) {
    // Check if odometer reading is reasonable (not too high)
    const maxReasonableOdometer = 10000000; // 10 million km/miles

    if (odometerReading > maxReasonableOdometer) {
      return res.status(400).json({
        success: false,
        message: 'Odometer reading seems unreasonably high'
      });
    }
  }

  next();
};

module.exports = {
  expenseValidationRules,
  expenseQueryValidationRules,
  mongoIdValidation,
  fuelEfficiencyValidationRules,
  statsQueryValidationRules,
  validate,
  validateDateRange,
  validateNotFutureDate,
  validateOdometerReading
};