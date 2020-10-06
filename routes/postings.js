const express = require('express');
const postingRouter = express.Router();

const {
    checkJwt
} = require('../controllers/authController')

const {
    createNewPosting
} = require('../controllers/postingController');

postingRouter.post('', createNewPosting);

module.exports = postingRouter;
