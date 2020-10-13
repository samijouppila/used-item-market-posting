const express = require('express');
const postingRouter = express.Router();

const uploadFile = require('../utils/upload');

const {
    checkJwt
} = require('../controllers/authController')

const {
    createNewPosting,
    getExistingPosting,
    modifyExistingPosting,
    deleteExistingPosting,
    addImageToPosting,
    deleteSelectedImage,
    searchForPostings
} = require('../controllers/postingController');

postingRouter.post('/:slug/images', checkJwt, uploadFile, addImageToPosting);

postingRouter.delete('/:slug/images/:id', checkJwt, deleteSelectedImage);

postingRouter.post('', checkJwt,  createNewPosting);

postingRouter.get('/:slug', getExistingPosting);

postingRouter.get('', searchForPostings);

postingRouter.put('/:slug', checkJwt, modifyExistingPosting);

postingRouter.delete('/:slug', checkJwt, deleteExistingPosting);

module.exports = postingRouter;
