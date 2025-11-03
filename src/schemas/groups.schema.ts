import Joi from 'joi';

export const createGroupSchema = Joi.object({
  name: Joi.string().required(),
  creatorId: Joi.number().required(),
  enigmaKey: Joi.string().required(),
});

export const updateGroupSchema = Joi.object({
  name: Joi.string(),
  enigmaKey: Joi.string(),
});

export const addMemberSchema = Joi.object({
  groupId: Joi.string().length(8).required(),
  userId: Joi.number().required(),
});

export const findByIdSchema = Joi.object({
  id: Joi.number().required(),
});


