import Joi from 'joi';
import type { CreateGroupChatDto, CreateIndividualChatDto } from '@/types/dtos';

const chatId = Joi.string().length(8);
const username = Joi.string().max(50);

const name = Joi.string();
const description = Joi.string();
const participants = Joi.array().items(username).min(2).required();
const isOpenChat = Joi.boolean().default(true);
const isEditable = Joi.boolean().default(false);
const canInvite = Joi.boolean().default(false);
const enigmaMasterKey = Joi.string();

export const createGroupChatSchema: Joi.ObjectSchema<CreateGroupChatDto> = Joi.object({
  name: name.required(),
  description,
  participants: participants.required(),
  isOpenChat,
  isEditable,
  canInvite,
  enigmaMasterKey: enigmaMasterKey.required(),
});

export const createIndividualChatSchema: Joi.ObjectSchema<CreateIndividualChatDto> = Joi.object({
  participants: participants.required(),
  enigmaMasterKey: enigmaMasterKey.required(),
});

export const findByIdSchema = Joi.object({
  id: chatId.required(),
});

export const findByMessageIdSchema = Joi.object({
  id: chatId.required(),
  messageId: chatId.required(),
});

export const rotateChatKeySchema = Joi.object({
  key: Joi.string().required(),
});
