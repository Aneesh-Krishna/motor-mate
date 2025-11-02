const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, googleSuccess, googleFailure } = require('../controllers/authController');
const auth = require('../middleware/auth');
const passport = require('../config/googleAuth');

// Google OAuth routes only
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false
  }),
  googleSuccess
);

router.get('/google/failure', googleFailure);

// Protected profile route for authenticated users
router.get('/profile', auth, getProfile);

// Protected profile update route for authenticated users
router.put('/profile', auth, updateProfile);

module.exports = router;