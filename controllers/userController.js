const User = require('../models/User')

const createNewUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.body['username'] })
        if (existingUser) {
            return res.status(400).json({
                errorDescription: "User with that username already exists"
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

module.exports = {
    createNewUser
}