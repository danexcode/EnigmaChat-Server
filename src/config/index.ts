// Determinar el entorno actual
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Configuración para la aplicación
export const config = {
  env: NODE_ENV,
  isProd,
  isDev: !isProd,

  // Configuración del servidor
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },

  // Configuración de la base de datos
  db: {
    url: isProd ? process.env.DATABASE_URL : process.env.DEV_DATABASE_URL,
    // Si necesitas opciones específicas para diferentes entornos
    options: {
      logging: !isProd,
    },
  },

  // Configuración de autenticación
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-default-secret-for-dev',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Configuración de correo
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '465', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },

  // Configuración de la URL de la aplicación
  frontendUrl: isProd ? process.env.FRONTEND_URL : 'http://localhost:3000',

  // Logging
  logging: {
    level: isProd ? 'info' : 'debug',
  },
};
