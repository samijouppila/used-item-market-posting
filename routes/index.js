const express = require('express');
const userRouter = require('./users');
const authRouter = require('./auth');
const postingRouter = require('./postings');

const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
    res.status(200).send("Used item market API root. See /documentation");
})

apiRouter.get('/documentation', (req, res) => {
    // TODO Add documentation here
    res.status(200).send("Placeholder for documentation");
})

apiRouter.use('/users', userRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/postings', postingRouter);


module.exports = apiRouter;