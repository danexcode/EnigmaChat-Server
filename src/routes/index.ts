import express, { type Application } from 'express';
import { authRouter } from '@/routes/auth.route';
import { chatsRouter } from '@/routes/chats.route';
import { groupsRouter } from '@/routes/groups.route';
import { usersRouter } from '@/routes/users.route';

export const apiRouter = (app: Application) => {
  const router = express.Router();

  app.use('/api', router);

  //router.use('/auth', authRouter);
  //router.use('/chats', chatsRouter);
  router.use('/groups', groupsRouter);
  //router.use('/users', usersRouter);

  return router;
};
