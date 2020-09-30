const env = require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send("Used item market application root. See /api for the API");
})

const apiRouter = require('./routes');

app.use('/api', apiRouter);

let server = null;

module.exports = {
  close: function () {
    server.close();
  },
  start: async function (mode) {
    let dbUri;
    if (mode === "production") {
      dbUri = process.env.MONGODB_PRODUCTION_URI;
    }
    if (mode === "test") {
      dbUri = process.env.MONGODB_TEST_URI;
    }
    try {
      console.log("Connecting to database...")
      await mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
        useCreateIndex: true,
      });
      console.log('Connected to database');
      server = app.listen(port, () => {
        console.log(`Used item market API listening on http://localhost:${port}/api\n`);
      });
    } catch (err) {
      throw new Error(err);
    }
  }
};