const { body, param, query, validationResult } = require('express-validator');

// Validation rules for creating/updating trips
const tripValidationRules = () => {
  return [
    // Vehicle validation
    body('vehicle')
      .notEmpty()
      .withMessage('Vehicle ID is required')
      .isMongoId()
      .withMessage('Invalid vehicle ID format'),

    // Date validation
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid date')
      .custom(value => {
        if (new Date(value) > new Date()) {
          throw new Error('Trip date cannot be in the future');
        }
        return true;
      }),

    // Start location validation
    body('startLocation')
      .notEmpty()
      .withMessage('Start location is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('Start location must be between 1 and 200 characters')
      .trim(),

    // End location validation
    body('endLocation')
      .notEmpty()
      .withMessage('End location is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('End location must be between 1 and 200 characters')
      .trim(),

    // Distance validation
    body('distance')
      .notEmpty()
      .withMessage('Distance is required')
      .isFloat({ gt: 0 })
      .withMessage('Distance must be a positive number (in kilometers)'),

    // Total cost validation
    body('totalCost')
      .notEmpty()
      .withMessage('Total cost is required')
      .isFloat({ gt: 0 })
      .withMessage('Total cost must be a positive number (in INR)'),

    // Optional fields validation

    // Notes validation (optional)
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters')
      .trim(),

    // Start odometer validation (optional)
    body('startOdometer')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Start odometer must be a positive number'),

    // End odometer validation (optional)
    body('endOdometer')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('End odometer must be a positive number'),

    // Purpose validation (optional)
    body('purpose')
      .optional()
      .isIn(['Business', 'Personal', 'Commute', 'Leisure', 'Emergency', 'Other'])
      .withMessage('Purpose must be one of: Business, Personal, Commute, Leisure, Emergency, Other')
  ];
};

// Custom validation for odometer readings
const validateOdometerReadings = (req, res, next) => {
  const { startOdometer, endOdometer } = req.body;

  if (startOdometer && endOdometer) {
    if (endOdometer <= startOdometer) {
      return res.status(400).json({
        success: false,
        message: 'End odometer reading must be greater than start odometer reading'
      });
    }
  }

  next();
};

// MongoDB ObjectId validation
const mongoIdValidation = (paramName = 'id') => {
  return [
    param(paramName)
      .isMongoId()
      .withMessage(`Invalid ${paramName} format`)
  ];
};

// Validation for query parameters in list endpoints
const tripQueryValidationRules = () => {
  return [
    // Page validation
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    // Limit validation
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    // Vehicle filter validation
    query('vehicle')
      .optional()
      .isMongoId()
      .withMessage('Invalid vehicle ID format in vehicle filter'),

    // Start date validation
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),

    // End date validation
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ];
};

// Validation for statistics query parameters
const statsQueryValidationRules = () => {
  return [
    // Start date validation
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),

    // End date validation
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ];
};

// Validation for recent trips query parameters
const recentTripsValidationRules = () => {
  return [
    // Limit validation
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ];
};

// Custom validation for date range
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }
  }

  next();
};

// Validation result handler middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  next();
};

module.exports = {
  tripValidationRules,
  validateOdometerReadings,
  mongoIdValidation,
  tripQueryValidationRules,
  statsQueryValidationRules,
  recentTripsValidationRules,
  validateDateRange,
  validate
};