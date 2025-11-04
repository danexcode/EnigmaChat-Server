import Joi from "joi";

export const addMemberToGroupSchema = Joi.object({
  userId: Joi.string().length(8).required(),
  role: Joi.string().valid('ADMIN', 'MEMBER').required(),
});
