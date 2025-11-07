import { Router } from 'express';
import passport from 'passport';
import { UsersService } from '@/services/users.service';
import { badRequest } from '@hapi/boom';

export const usersRouter = Router();
const userService = new UsersService();

usersRouter.get('/',
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
      }
      if (email) {
        user = await userService.findByEmail(email as string);
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);
