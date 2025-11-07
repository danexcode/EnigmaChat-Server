import { Router } from 'express';
import passport from 'passport';

import { JwtPayload, User } from '@/types';
import { AuthService } from '@/services/auth.service';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { confirm2faSchema, loginUserSchema, registerUserSchema, verify2faSchema } from '@/schemas/auth.schema';
import { LoginResponse } from '@/types/response';

export const authRouter = Router();
const authService = new AuthService();

// Login route
authRouter.post('/login',
  validateDataHandler(loginUserSchema, 'body'),
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const response: LoginResponse = {
        token: '',
        required2fa: false,
      };
      if (user.is2faEnabled) {
        response.token = await authService.sign2faToken(user.id);
        response.required2fa = true;
        response.message = '2FA verification required';
      } else {
        response.token = await authService.signAuthToken(user.id);
        response.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          imageUrl: user.imageUrl,
          is2faEnabled: user.is2faEnabled,
        };
        response.message = 'Login successful';
      }

      res
        .cookie('accessToken', response.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        })
        .json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Register route
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

// Setup 2FA route
authRouter.post('/setup-2fa',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user2fa = await authService.generate2fa();
      res.json(user2fa);
    } catch (error) {
      next(error);
    }
  }
);

// Confirm 2FA setup route
authRouter.post('/confirm-2fa',
  passport.authenticate('jwt', { session: false }),
  validateDataHandler(confirm2faSchema, 'body'),
  async (req, res, next) => {
    try {
      const user = req.user as JwtPayload;
      const { token, secret } = req.body;

      const response = await authService.confirm2fa(user.sub, token, secret);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Authenticate with 2FA route
authRouter.post('/verify-2fa',
  validateDataHandler(verify2faSchema, 'body'),
  passport.authenticate('jwt-2fa', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as JwtPayload;
      const userId = user.sub;
      const { token } = req.body;
      const response = await authService.verify2fa(userId, token);
      res
        .cookie('accessToken', response.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        })
        .status(200)
        .json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Disable 2FA route
authRouter.post('/disable-2fa',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as JwtPayload;
      const message = await authService.disable2fa(user.sub);
      res.status(200).json(message);
    } catch (error) {
      next(error);
    }
  }
);


