import { Joi } from 'celebrate';
export { objectId } from '../validation';

export const name = Joi.string().min(3);

export const password = Joi.string()
  .pattern(new RegExp('^(?=.*)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$'))
  .messages({
    'string.pattern.base': `{#label} must be at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, and can contain special characters`,
  });
