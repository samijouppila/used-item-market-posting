const express = require('express');
const postingRouter = express.Router();

const {
    checkJwt
} = require('../controllers/authController')

const {
    createNewPosting,
    modifyExistingPosting,
    deleteExistingPosting,
    addImageToPosting
} = require('../controllers/postingController');

postingRouter.post('', checkJwt,  createNewPosting);

postingRouter.put('/:slug', checkJwt, modifyExistingPosting);

postingRouter.delete('/:slug', checkJwt, deleteExistingPosting);

postingRouter.post('/:slug/images', checkJwt, addImageToPosting);

module.exports = postingRouter;
