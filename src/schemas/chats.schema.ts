import Joi from 'joi';

const chatId = Joi.string().length(8);
const userId = Joi.string().length(8);

export const createChatSchema = Joi.object({
  type: Joi.string().valid('INDIVIDUAL', 'GROUP').required(),
  creatorId: userId.when('type', { is: 'GROUP', then: Joi.required() }),
  name: Joi.string().when('type', { is: 'GROUP', then: Joi.required() }),
  description: Joi.string(),
  participants: Joi.array().items(userId).min(2).required(),
});

export const findByIdSchema = Joi.object({
  id: chatId.required(),
});
