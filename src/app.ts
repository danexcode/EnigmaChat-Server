import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import { apiRouter } from '@/routes';
import { setupAuthStrategies } from '@/auth';
import { boomErrorHandler, errorHandler, ormErrorHandler } from '@/middlewares/errors.handler';
import passport from 'passport';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());


  setupAuthStrategies();
  app.use(passport.initialize());


  apiRouter(app);

  app.use(boomErrorHandler);
  app.use(ormErrorHandler);
  app.use(errorHandler);

  return app;
}
