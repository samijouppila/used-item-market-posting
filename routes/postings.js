const express = require('express');
const postingRouter = express.Router();

const multer  = require('multer')
const storage = multer.memoryStorage()
const multerUpload = multer({
    storage: storage,
    limits: {
        files: 1,
        fileSize: 1000000
    }
})

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

postingRouter.post('/:slug/images', checkJwt, multerUpload.single('image'), addImageToPosting);

postingRouter.delete('/:slug/images/:id', checkJwt, deleteSelectedImage);

postingRouter.post('', checkJwt,  createNewPosting);

postingRouter.get('/:slug', getExistingPosting);

postingRouter.get('', searchForPostings);

postingRouter.put('/:slug', checkJwt, modifyExistingPosting);

postingRouter.delete('/:slug', checkJwt, deleteExistingPosting);



module.exports = postingRouter;
