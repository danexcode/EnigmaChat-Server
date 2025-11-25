import { sign } from 'jsonwebtoken';
import { config } from '@/config';

export class WebSocketService {
  constructor() {}

  // Generate a WebSocket-specific token
  async generateWebSocketToken(userId: string): Promise<string> {
    const token = sign(
      {
        sub: userId,
        purpose: 'websocket',
      },
      config.auth.jwtSecret,
      {
        expiresIn: '1h', // Token válido por 1 hora
      }
    );

    return token;
  }
}
