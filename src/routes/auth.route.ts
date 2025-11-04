import express from 'express';
import { UsersService } from '@/services/users.service';
import { badRequest } from '@hapi/boom';
import { AuthService } from '@/services/auth.service';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { loginUserSchema, registerUserSchema } from '@/schemas/auth.schema';

export const authRouter = express.Router();
const authService = new AuthService();

authRouter.post('/login',
  validateDataHandler(loginUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
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
