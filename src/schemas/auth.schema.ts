import Joi from "joi";

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const registerUserSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const confirm2faSchema = Joi.object({
  token: Joi.string().pattern(/^[0-9]{6}$/).required(),
  secret: Joi.string().required(),
});

export const verify2faSchema = Joi.object({
  token: Joi.string().pattern(/^[0-9]{6}$/).required(),
});
