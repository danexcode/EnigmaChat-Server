import passport from 'passport';
import { Router } from 'express';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { ChatsService } from '@/services/chats.service';
import { User } from '@/types';
import { createChatSchema } from '@/schemas/chats.schema';
import { CreateChatDto } from '@/types/dtos';

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

chatsRouter.post('/',
  passport.authenticate('jwt', { session: false }),
  validateDataHandler(createChatSchema, 'body'),
  async (req, res, next) => {
    try {
      const body: CreateChatDto = req.body;
      const newChat = await chatsService.create(body);
      res.json(newChat);
    } catch (error) {
      next(error);
    }
  }
);
