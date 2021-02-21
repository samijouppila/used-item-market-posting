const User = require('../models/User')
const passport = require('passport');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// Jwt options
let options = {}
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET;

passport.use(new JwtStrategy(options, function (jwt_payload, done) {
    const now = Date.now() / 1000;
    if (jwt_payload.exp < now) {
        return done(null, false)
    }
    User.findOne({ _id: jwt_payload.user._id, username: jwt_payload.user.username }, '-__v -password', function (err, user) {
        if (err) return done(err, false);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

const checkJwt = passport.authenticate('jwt', { session: false })

module.exports = {
    checkJwt
}
