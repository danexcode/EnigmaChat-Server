import { authenticate } from 'passport';
import { Router } from 'express';

import { User } from '@/types';
import { ChatsService } from '@/services/chats.service';
import { CreateChatDto, CreateMessageDto } from '@/types/dtos';
import { createMessageSchema } from '@/schemas/messages.schema';
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { authorizeMessageDeletion } from '@/middlewares/auth.handler';
import { createChatSchema, findByIdSchema, findByMessageIdSchema } from '@/schemas/chats.schema';

const chatsRouter = Router();
const chatsService = new ChatsService();

// Get user chats
chatsRouter.get('/',
  authenticate('jwt', { session: false }),
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

// Create chat
chatsRouter.post('/',
  authenticate('jwt', { session: false }),
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

// Get chat by id
chatsRouter.get('/:id',
  authenticate('jwt', { session: false }),
  validateDataHandler(findByIdSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const chat = await chatsService.findById(id);
      res.json(chat);
    } catch (error) {
      next(error);
    }
  }
);

// Get messages by chat id
chatsRouter.get('/:id/messages',
  authenticate('jwt', { session: false }),
  validateDataHandler(findByIdSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const messages = await chatsService.findMessagesByChatId(id);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }
);

// Send message to chat
chatsRouter.post('/:id/messages',
  authenticate('jwt', { session: false }),
  validateDataHandler(findByIdSchema, 'params'),
  validateDataHandler(createMessageSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body: CreateMessageDto = req.body;
      const messages = await chatsService.sendMessage(id, body);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }
);

chatsRouter.delete('/:id/messages/:messageId',
  authenticate('jwt', { session: false }),
  validateDataHandler(findByMessageIdSchema, 'params'),
  authorizeMessageDeletion('ADMIN'),
  async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const deletedMessage = await chatsService.deleteMessage(messageId);
      res.json(deletedMessage);
    } catch (error) {
      next(error);
    }
  }
);
