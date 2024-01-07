import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import api from './api/index.js';
import jwtMiddleware from './lib/jwtMiddleware.js';

const app = express();
const router = express.Router();

const { PORT, MONGO_URI } = process.env;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.error(e);
  });

app.use(cookieParser());
// app.use(express.json());
app.use(bodyParser.json());

app.use(jwtMiddleware);

router.use('/api', api);
app.use(router);

const port = PORT || 4000;
app.listen(port, () => {
  console.log('Listening to port 4000');
});
