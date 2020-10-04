const express = require('express');
const userRouter = express.Router();

const {
    createNewUser,
    getSelectedUserData
} = require('../controllers/userController');

userRouter.post('', createNewUser);

userRouter.get('/:id', getSelectedUserData);

module.exports = userRouter;