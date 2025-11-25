import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { WebSocketService } from '@/services/websocket.service';
import { JwtPayload } from '@/types';

const router = Router();
const webSocketService = new WebSocketService();

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

      res.json({
        token: wsToken,
        expiresIn: '1h',
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as webSocketRouter };
