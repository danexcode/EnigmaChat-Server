import Joi from 'joi';

export const createGroupMessageSchema = Joi.object({
  ciphertext: Joi.string().required(),
  groupId: Joi.string().length(8).required(),
  senderId: Joi.number().required(),
});
