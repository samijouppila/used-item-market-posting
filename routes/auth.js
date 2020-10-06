const express = require('express');
const authRouter = express.Router();

const {
    issueNewJwtToken,
    authenticateHttpBasic
} = require('../controllers/authController');

authRouter.get('/login', authenticateHttpBasic, issueNewJwtToken)

module.exports = authRouter;