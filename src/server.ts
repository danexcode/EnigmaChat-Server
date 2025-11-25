import 'dotenv/config';
import 'module-alias/register';
import '../module-alias.config';  // Carga la configuración de alias
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { createApp } from '@/app';
import { initializeSocket } from '@/utils/socket';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter });

// Crear aplicación Express
const app = createApp();
const PORT = process.env.PORT || 3000;

// Crear servidor HTTP
const httpServer = createServer(app);

// Inicializar Socket.IO
initializeSocket(httpServer);

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO initialized`);
});
