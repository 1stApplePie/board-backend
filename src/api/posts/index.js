import express from 'express';
import * as postsCtrl from './posts.ctrl.js';
import checkLoggedIn from '../../lib/checkLoggedIn.js';

const postsRouter = express.Router();

postsRouter.get('/', postsCtrl.list);
postsRouter.post('/', checkLoggedIn, postsCtrl.write);

const postRouter = express.Router();

postRouter.get('/', postsCtrl.read);
postRouter.delete('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.remove);
postRouter.patch('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.update);

postsRouter.use('/:id', postsCtrl.getPostById, postRouter);

export default postsRouter;
