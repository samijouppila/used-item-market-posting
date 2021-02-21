const express = require('express');
const postingRouter = require('./postings');
const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
    res.status(200).send("Used item market posting service API root.");
})

apiRouter.use('/postings', postingRouter);

module.exports = apiRouter;