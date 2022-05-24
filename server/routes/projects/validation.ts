import { Joi } from 'celebrate';
//@ts-ignore
import JoiTimezone from 'joi-tz';
import { MAX_VALUES } from '../../../crawler';
import * as validation from '../validation';

export { objectId } from '../validation';

const Joi_ = Joi.extend(JoiTimezone);

export const crawler = Joi.object().keys({
  keywords: Joi.array()
    .min(1)
    .max(MAX_VALUES.keywords)
    .items(Joi.string())
    .messages({
      'any.required': `{#label} is required. Provide one or multiple keywords. e.g., '[kiasmos, rock]`,
      message: `{#label} must be between 1 and ${MAX_VALUES.keywords}`,
    })
    .required(),
  seeds: validation.seeds.required(),
  branches: validation.branches.required(),
  depth: validation.depth,
  country: validation.country,
  language: validation.language,
});

export const schedule = Joi.object().keys({
  hour: Joi.number()
    .required()
    .ruleset.min(0)
    .max(23)
    .rule({ message: '{#label} must be between 0 and 23' })
    .required(),
  timezone: Joi_.timezone().empty().messages({
    timezone: `{#label} must be a valid timezone name. e.g., 'America/Toronto'`,
  }),
});

export const title = Joi.string().min(3);
