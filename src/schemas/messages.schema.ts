import Joi from 'joi';

const chatId = Joi.string().length(8);
const userId = Joi.string().length(8);

export const createMessageSchema = Joi.object({
  chatId: chatId.required(),
  senderId: userId.required(),
  ciphertext: Joi.string().required(),
});

export const findByChatIdSchema = Joi.object({
  chatId: chatId.required(),
});
