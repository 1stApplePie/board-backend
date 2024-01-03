import express from 'express';
import * as postsCtrl from './posts.ctrl.js';

const postsRouter = express.Router();

postsRouter.get('/', postsCtrl.list);
postsRouter.post('/', postsCtrl.write);
postsRouter.get('/:id', postsCtrl.checkObejctId, postsCtrl.read);
postsRouter.delete('/:id', postsCtrl.checkObejctId, postsCtrl.remove);
postsRouter.patch('/:id', postsCtrl.checkObejctId, postsCtrl.update);

export default postsRouter;
