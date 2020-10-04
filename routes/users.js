const express = require('express');
const userRouter = express.Router();

const {
    checkJwt
} = require('../controllers/authController')

const {
    createNewUser,
    getSelectedUserData
} = require('../controllers/userController');

userRouter.post('', createNewUser);

userRouter.get('/:id', checkJwt, getSelectedUserData);

module.exports = userRouter;