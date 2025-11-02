const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String
  },
  authMethod: {
    type: String,
    enum: ['google'],
    default: 'google'
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic phone number validation (allows international formats)
        return /^[\d\s\-\+\(\)]+$/.test(v) || v === '';
      },
      message: 'Phone number can only contain digits, spaces, hyphens, plus, and parentheses'
    }
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: 200
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100
    },
    state: {
      type: String,
      trim: true,
      maxlength: 50
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: 20
    },
    country: {
      type: String,
      trim: true,
      maxlength: 50
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);