const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: profile.id });

    if (existingUser) {
      // User already exists, return them
      return done(null, existingUser);
    }

    // Create new user from Google profile (only Google auth allowed)
    const newUser = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      username: profile.displayName || profile.emails[0].value.split('@')[0],
      avatar: profile.photos[0].value,
      authMethod: 'google'
    });

    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;