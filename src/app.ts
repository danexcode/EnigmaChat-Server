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

export const createApp = () => {
  const app = express();

  // middlewares
  app.use(express.json());
  const allowedOrigins = [
    'http://localhost:5173',
    'https://enigmam3chat.vercel.app' // Asegúrate de que esta sea la URL correcta de tu frontend en producción
  ];

  app.use(cors({
    origin: function(origin, callback) {
      // Permitir peticiones sin origen (como apps móviles o curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'Origen no permitido por CORS';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  }));
  app.use(cookieParser());

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
