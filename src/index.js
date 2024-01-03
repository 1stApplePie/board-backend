import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import api from './api/index.js';

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

router.use('/api', api);

// 라우터 적용 전 bodyParser 적용
app.use(bodyParser());

app.use(router);

const port = PORT || 4000;
app.listen(port, () => {
  console.log('Listening to port 4000');
});
