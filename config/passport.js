var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'mobile'
  },
  function(username, password, done) {
    User.findOne({ mobile: username }, function (err, user) {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'Mobile number is not registered.'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'You have entered a wrong Password.'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));