import express from 'express';
import * as authCtrl from './auth.ctrl.js';

const authRouter = express.Router();

authRouter.post('/register', authCtrl.register);
authRouter.post('/login', authCtrl.login);
authRouter.get('/check', authCtrl.check);
authRouter.post('/logout', authCtrl.logout);

export default authRouter;
