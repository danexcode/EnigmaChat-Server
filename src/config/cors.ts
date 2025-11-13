// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173', // Tu entorno de desarrollo
  'https://enigma-chat.vercel.app', // El dominio de tu app en producción
  'https://enigmachat.vercel.app'
];

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir peticiones si el origen está en la lista blanca
    // o si no hay origen (como en las peticiones de Postman)
    if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
