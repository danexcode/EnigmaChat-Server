import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { config } from '@/config';
import { JwtPayload } from '@/types';

export interface MessagePayload {
  chatId: string;
  ciphertext: string;
  senderId: string;
}

export interface SocketData {
  userId: string;
}

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.server.corsOrigin,
      credentials: true,
    },
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('accessToken=')[1]?.split(';')[0];

    if (!token) {
      console.warn('❌ WebSocket connection rejected: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = verify(token, config.auth.jwtSecret) as JwtPayload;
      
      if (decoded.purpose !== 'auth') {
        console.warn('❌ WebSocket connection rejected: Invalid token purpose');
        return next(new Error('Authentication error: Invalid token purpose'));
      }

      // Guardamos el userId en el socket
      (socket.data as SocketData).userId = decoded.sub;
      console.log(`✅ WebSocket authenticated: User ${decoded.sub}`);
      next();
    } catch (error) {
      console.warn('❌ WebSocket connection rejected: Invalid token');
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket.data as SocketData).userId;
    console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

    // Unirse a una sala de chat
    socket.on('join-chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${userId} joined chat: ${chatId}`);
    });

    // Salir de una sala de chat
    socket.on('leave-chat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`User ${userId} left chat: ${chatId}`);
    });

    // Evento de mensaje
    socket.on('message', (payload: MessagePayload) => {
      const { chatId, ciphertext } = payload;
      
      // Emitir el mensaje a todos los usuarios en la sala del chat (excepto el remitente)
      socket.to(chatId).emit('message', {
        chatId,
        ciphertext,
        senderId: userId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Message sent in chat ${chatId} by user ${userId}`);
    });

    // Evento de "escribiendo..."
    socket.on('typing', (chatId: string) => {
      socket.to(chatId).emit('typing', {
        chatId,
        userId,
      });
    });

    // Evento de "dejó de escribir"
    socket.on('stop-typing', (chatId: string) => {
      socket.to(chatId).emit('stop-typing', {
        chatId,
        userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} (Socket ID: ${socket.id})`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
