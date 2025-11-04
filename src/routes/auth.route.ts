import { Router } from 'express';
import { authenticate } from 'passport';

import { User } from '@/types';
import { AuthService } from '@/services/auth.service';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { loginUserSchema, registerUserSchema } from '@/schemas/auth.schema';

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
