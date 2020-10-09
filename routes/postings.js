const express = require('express');
const postingRouter = express.Router();

const {
    checkJwt
} = require('../controllers/authController')

const {
    createNewPosting,
    modifyExistingPosting
} = require('../controllers/postingController');

postingRouter.post('', checkJwt,  createNewPosting);
postingRouter.put('/:slug', checkJwt, modifyExistingPosting);

module.exports = postingRouter;
