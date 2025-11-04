import passport from 'passport';
import { Router } from 'express';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { ChatsService } from '@/services/chats.service';
import { User } from '@/types';

const chatsRouter = Router();
const chatsService = new ChatsService();

chatsRouter.get('/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as User;
      const userId = user.id;
      const chats = await chatsService.findByUserId(userId);
      res.json(chats);
    } catch (error) {
      next(error);
    }
  }
);
