const express = require('express');
const imageRouter = express.Router();

const {
    getSelectedImage
} = require('../controllers/imageController');

imageRouter.get('/:id', getSelectedImage);

module.exports = imageRouter;