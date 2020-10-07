const express = require('express');
const postingRouter = express.Router();

const {
    checkJwt
} = require('../controllers/authController')

const {
    createNewPosting
} = require('../controllers/postingController');

postingRouter.post('', checkJwt,  createNewPosting);

module.exports = postingRouter;
