import cors from 'cors';
import express from 'express';

import { apiRouter } from '@/routes';
import { setupAuthStrategies } from '@/auth';
import { boomErrorHandler, errorHandler, ormErrorHandler } from '@/middlewares/errors.handler';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  setupAuthStrategies();

  apiRouter(app);

  app.use(boomErrorHandler);
  app.use(ormErrorHandler);
  app.use(errorHandler);

  return app;
}
