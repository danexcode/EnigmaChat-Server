import Joi from 'joi';

const username = Joi.string().alphanum().min(3).max(30);
const email = Joi.string().email();
const password = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'));
const imageUrl = Joi.string().uri();
const is2faEnabled = Joi.boolean();
const twoFactorSecret = Joi.string().allow(null);
const resetPasswordToken = Joi.string().allow(null);
const resetPasswordExpires = Joi.date().allow(null);

export const createUserSchema = Joi.object({
  username: username.required(),
  email: email.required(),
  password: password.required(),
});

export const updateUserSchema = Joi.object({
  username,
  email,
  password,
  imageUrl,
  is2faEnabled,
  twoFactorSecret,
  resetPasswordToken,
  resetPasswordExpires,
});

export const findByIdSchema = Joi.object({
  id: Joi.string().length(8).required(),
});

export const findByEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const findByUsernameSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
});

export const twoFactorSchema = Joi.object({
  code: Joi.string().length(6).required(),
});
