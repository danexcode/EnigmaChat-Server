import { Router } from 'express';
import passport from 'passport';
import { UsersService } from '@/services/users.service';
import { badRequest } from '@hapi/boom';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { findByUsernameSchema, findUserSchema } from '@/schemas/users.schema';

export const usersRouter = Router();
const userService = new UsersService();

// Get user by username or email
usersRouter.get('/',
  validateDataHandler(findUserSchema, 'query'),
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { username, email } = req.query;
      if (!username && !email) {
        throw badRequest('Username or email is required');
      }
      let user;
      if (username) {
        user = await userService.findByUsername(username as string);
      } else if (email) {
        user = await userService.findByEmail(email as string);
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Get some users by username
usersRouter.get('/some',
  validateDataHandler(findByUsernameSchema, 'query'),
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const { username } = req.query;
      const users = await userService.findSomeUsersByUsername(username as string);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

