import express from 'express';
import postsRouter from './posts/index.js';
import authRouter from './auth/index.js';

const api = express.Router();

api.use('/posts', postsRouter);
api.use('/auth', authRouter);

export default api;
