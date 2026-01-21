import cors from 'cors';
import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';

import { apiRouter } from '@/routes';
import { setupAuthStrategies } from '@/auth';
import {
  boomErrorHandler,
  errorHandler,
  ormErrorHandler
} from '@/middlewares/errors.handler';
import { corsOptions } from '@/config/cors';
import helmet from 'helmet';

export const createApp = () => {
  const app = express();

  // middlewares
  app.use(express.json());

  app.use(cors(corsOptions));
  app.use(cookieParser());
  // Activa 11 capas de seguridad pequeñas (X-XSS-Protection, Hide Powered-By, etc.)
  app.use(helmet());

  // setear estrategias de autenticación
  setupAuthStrategies();
  app.use(passport.initialize());

  app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // configurar rutas
  apiRouter(app);

  // configurar manejadores de errores
  app.use(boomErrorHandler);
  app.use(ormErrorHandler);
  app.use(errorHandler);

  return app;
}
