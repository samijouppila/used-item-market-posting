const User = require('../models/User')
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// -- HttpBasic Authentication --
passport.use(new BasicStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, '-__v', function (err, user) {
            if (err || !user) {
                return done(null, false, { message: "Incorrect login details" });
            }
            // Verify password match
            user.comparePassword(password, function (err, isMatch) {
                if (err) return done(null, false, { message: "Unknown error happened during authentication" });
                if (!isMatch) return done(null, false, { message: "Incorrect login details" });

                // Login is success
                return done(null, {
                    _id: user._id,
                    username: user.username
                });
            });
        });
    }
));

const authenticateHttpBasic = passport.authenticate('basic', { session: false })

// -- Jwt Authentication --

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

const issueNewJwtToken = async (req, res) => {
    const { user } = req;
    const payload = { user };
    const options = {
        expiresIn: '1d'
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, options);

    res.status(200).json({ token });
}

module.exports = {
    authenticateHttpBasic,
    checkJwt,
    issueNewJwtToken
}
