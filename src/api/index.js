import express from 'express';
import postsRouter from './posts/index.js';

const api = express.Router();

api.use('/posts', postsRouter);

export default api;
