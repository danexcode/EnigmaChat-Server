import express, { type Application } from 'express';

export const apiRouter = (app: Application) => {
  const router = express.Router();

  app.use('/api', router);

  return router;
};
