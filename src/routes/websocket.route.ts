import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { WebSocketService } from '@/services/websocket.service';
import { JwtPayload } from '@/types';
import { config } from '@/config';

const router = Router();
const webSocketService = new WebSocketService();

// Configuración de cookies seguras
const cookieOptions = {
  httpOnly: true,
  secure: config.isProd, // true en producción, false en desarrollo
  sameSite: config.isProd ? 'none' as const : 'lax' as const, // 'none' para producción con HTTPS, 'lax' para desarrollo
  maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
  path: '/', // Asegurar que la cookie esté disponible en todas las rutas
};

/**
 * @route   GET /api/ws/token
 * @desc    Generate a WebSocket connection token
 * @access  Private (requires JWT authentication)
 */
router.get(
  '/token',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as JwtPayload;
      const userId = user.sub;

      const wsToken = await webSocketService.generateWebSocketToken(userId);

      res
        .status(200)
        .cookie('wsToken', wsToken, cookieOptions)
        .json({
          token: wsToken,
          expiresIn: '1h',
        });
    } catch (error) {
      next(error);
    }
  }
);

export { router as webSocketRouter };
