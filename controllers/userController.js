const User = require('../models/User')

const createNewUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.body['username'] })
        if (existingUser) {
            return res.status(400).json({
                errorDescription: "User with that username already exists"
            });
        }
        if (!req.body.hasOwnProperty('contactInformation')) {
            return res.status(400).json({
                errorDescription: "Must include contact information in user creation"
            });
        }
        if (!req.body['contactInformation']['email'] && !req.body['contactInformation']['phoneNumber']) {
            return res.status(400).json({
                errorDescription: "Contact information must have email or phone number"
            });
        }
        const newUser = new User(req.body);
        newUser.save( (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    errorDescription: "Incorrect request body"
                });
            }
            res.status(201).json({
                username: user.username,
                birthDate: user.birthDate,
                contactInformation: user.contactInformation,
                _id: user._id
            })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            errorDescription: "Unknown error occurred"
        });
    }
}

const getSelectedUserData = async (req, res) => {
    User.findOne({ _id: req.params.id }, '-__v -password', function(err, user) {
        if (err || !user) return res.status(404).send({
            errorDescription: "User not found"
        });
        res.status(200).json(user);
    });
}

module.exports = {
    createNewUser,
    getSelectedUserData
}