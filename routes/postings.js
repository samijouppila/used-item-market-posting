const express = require('express');
const postingRouter = express.Router();

const {
    checkJwt
} = require('../controllers/authController')

const {
    createNewPosting,
    modifyExistingPosting,
    deleteExistingPosting
} = require('../controllers/postingController');

postingRouter.post('', checkJwt,  createNewPosting);

postingRouter.put('/:slug', checkJwt, modifyExistingPosting);

postingRouter.delete('/:slug', checkJwt, deleteExistingPosting);

module.exports = postingRouter;
