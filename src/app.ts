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
    'https://enigmam3chat.vercel.app',
    'https://enigmam3chat.vercel.app/' // Asegúrate de que esta sea la URL correcta de tu frontend en producción
  ];

  // Configuración detallada de CORS
  const corsOptions = {
    origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Permitir peticiones sin origen (como apps móviles o curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Si el origen no está en la lista, denegar
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie', 'Set-Cookie']
  };

  app.use(cors(corsOptions));
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
