const User = require('../models/User')
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcrypt');

passport.use(new BasicStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, '-__v', function (err, user) {
            if (err || !user) {
                return done(null, false, { message: "Incorrect login details" });
            }
            // Verify password match
            user.comparePassword(password, function (err, isMatch) {
                console.log(`err: ${err}`);
                console.log(`isMatch: ${isMatch}`);
                if (err) return done(null, false, { message: "Unknown error happened during authentication" });
                if (!isMatch) return done(null, false, { message: "Incorrect login details" });

                return done(null, user); // Login is success
            });
        });
    }
));

const authenticateHttpBasic = passport.authenticate('basic', { session: false })

const issueNewJwtToken = async (req, res) => {
    res.status(200).send("Success!")
}

module.exports = {
    issueNewJwtToken,
    authenticateHttpBasic
}