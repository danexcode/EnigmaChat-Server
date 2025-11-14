const allowedOrigins = [
  'http://localhost:5173',
  'https://enigmam3chat.vercel.app',
  'https://enigmam3chat.vercel.app/' // Asegúrate de que esta sea la URL correcta de tu frontend en producción
];

// Configuración detallada de CORS
export const corsOptions = {
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
