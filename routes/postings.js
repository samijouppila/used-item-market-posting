const express = require('express');
const postingRouter = express.Router();

const {
    checkJwt
} = require('../controllers/authController')

const {
    createNewPosting,
    getExistingPosting,
    modifyExistingPosting,
    deleteExistingPosting,
    searchForPostings
} = require('../controllers/postingController');

postingRouter.post('', checkJwt,  createNewPosting);

postingRouter.get('/:slug', getExistingPosting);

postingRouter.get('', searchForPostings);

postingRouter.put('/:slug', checkJwt, modifyExistingPosting);

postingRouter.delete('/:slug', checkJwt, deleteExistingPosting);

module.exports = postingRouter;
