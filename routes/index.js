const express = require('express');
const userRouter = require('./users');
const authRouter = require('./auth');
const postingRouter = require('./postings');
const imageRouter = require('./image');
const apiRouter = express.Router();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../reference/documentation.v1.json');

apiRouter.get('/', (req, res) => {
    res.status(200).send("Used item market API root. See /documentation");
})

apiRouter.use('/documentation', swaggerUi.serve);
apiRouter.get('/documentation', swaggerUi.setup(swaggerDocument));

apiRouter.use('/users', userRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/postings', postingRouter);
apiRouter.use('/images', imageRouter);



module.exports = apiRouter;