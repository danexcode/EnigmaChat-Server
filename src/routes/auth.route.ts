import { Router } from 'express';
import passport from 'passport';

import { JwtPayload } from '@/types';
import { UserResponseDto } from '@/types/dtos';
import { LoginResponse } from '@/types/response';
import { AuthService } from '@/services/auth.service';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { confirm2faSchema, loginUserSchema, registerUserSchema, verify2faSchema } from '@/schemas/auth.schema';

export const authRouter = Router();
const authService = new AuthService();

// Login
authRouter.post('/login',
  validateDataHandler(loginUserSchema, 'body'),
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as UserResponseDto;
      const response: LoginResponse = {
        token: '',
      };
      // Si el usuario tiene 2FA habilitado, retornamos el token de 2FA
      if (user.is2faEnabled) {
        response.token = await authService.sign2faToken(user.id);
        response.message = '2FA verification required';
        response.required2fa = true;
      }
      // Si el usuario no tiene 2FA habilitado, retornamos el token de autenticación
      else {
        response.token = await authService.signAuthToken(user.id);
        response.message = 'Login successful';
        response.user = user;
      }
      // Setear el token de autenticación en el cookie
      res
        .status(200)
        .cookie('accessToken', response.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
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
      const token = await authService.signAuthToken(user.id);
      res
        .status(200)
        .cookie('accessToken', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        })
        .json(user);
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
      const { pin, secret } = req.body;

      const response = await authService.confirm2fa(user.sub, pin, secret);
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
      const { pin } = req.body;
      const response = await authService.verify2fa(user.sub, pin);
      res
        .status(200)
        .cookie('accessToken', response.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        })
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
      const response = await authService.disable2fa(user.sub);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);


