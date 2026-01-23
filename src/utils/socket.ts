import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { config } from '@/config';
import { JwtPayload } from '@/types';

export interface MessagePayload {
  chatId: string;
  ciphertext: string;
  sender: string;
}

export interface SocketData {
  userId: string;
}

export class RateLimiter {
  private userTimestamps: Map<string, number[]> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
    
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleUsers();
    }, 60000);
  }

  checkLimit(userId: string): boolean {
    const now = Date.now();
    const timestamps = this.userTimestamps.get(userId) || [];
    
    // Filter out timestamps older than the window
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
    
    if (validTimestamps.length >= this.limit) {
      return false;
    }

    validTimestamps.push(now);
    this.userTimestamps.set(userId, validTimestamps);
    return true;
  }

  // Remove users who haven't sent messages in a while to prevent memory leaks
  private cleanupStaleUsers() {
    const now = Date.now();
    for (const [userId, timestamps] of this.userTimestamps.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
      if (validTimestamps.length === 0) {
        this.userTimestamps.delete(userId);
      } else {
        this.userTimestamps.set(userId, validTimestamps);
      }
    }
  }
  
  stop() {
    clearInterval(this.cleanupInterval);
  }
}

const rateLimiter = new RateLimiter(
  config.socket.rateLimit.maxMessages, 
  config.socket.rateLimit.windowMs
);

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
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('wsToken=')[1]?.split(';')[0];

    if (!token) {
      console.warn('❌ WebSocket connection rejected: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = verify(token, config.auth.jwtSecret) as JwtPayload;
      
      // Aceptar tokens con propósito 'auth' o 'websocket'
      if (decoded.purpose !== 'auth' && decoded.purpose !== 'websocket') {
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
      if (!rateLimiter.checkLimit(userId)) {
        console.warn(`User ${userId} exceeded rate limit. Disconnecting...`);
        socket.disconnect(true);
        return;
      }

      const { chatId, ciphertext, sender } = payload;
      
      // Emitir el mensaje a todos los usuarios en la sala del chat (excepto el remitente)
      socket.to(chatId).emit('message', {
        chatId,
        ciphertext,
        sender,
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

    // Evento de cambio de estado del chat (abierto/cerrado)
    socket.on('chat-state-change', (payload: { chatId: string; isOpenChat: boolean }) => {
      const { chatId, isOpenChat } = payload;
      
      // Emitir a todos los usuarios en la sala del chat (incluyendo el remitente)
      io!.to(chatId).emit('chat-state-change', {
        chatId,
        isOpenChat,
        userId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Chat ${chatId} state changed to ${isOpenChat ? 'open' : 'closed'} by user ${userId}`);
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
