import { Router } from 'express';
import { authenticate } from 'passport';

import { User } from '@/types';
import { AuthService } from '@/services/auth.service';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { confirm2faSchema, loginUserSchema, registerUserSchema } from '@/schemas/auth.schema';

export const authRouter = Router();
const authService = new AuthService();

authRouter.post('/login',
  validateDataHandler(loginUserSchema, 'body'),
  authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const token = authService.signToken(user.id);
      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post('/register',
  validateDataHandler(registerUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = await authService.register({
        username,
        email,
        password,
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post('/setup-2fa',
  authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const user2fa = await authService.generate2fa(user.id);
      res.json(user2fa);
    } catch (error) {
      next(`Error generating QR code: ${error}`);
    }
  }
);

authRouter.post('/confirm-2fa',
  authenticate('jwt', { session: false }),
  validateDataHandler(confirm2faSchema, 'body'),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const { token, secret } = req.body;

      const message = await authService.confirm2fa(user.id, token, secret);
      res.status(200).json(message);
    } catch (error) {
      next(`Error verifying 2FA: ${error}`);
    }
  }
);
