import { Joi } from 'celebrate';
import { MAX_VALUES } from '../../crawler';

export const objectId = Joi.alternatives(
  Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'valid mongo id'),
  Joi.object().keys({
    id: Joi.any(),
    _bsontype: Joi.allow('ObjectId'),
  })
);

export const seeds = Joi.number()
  .empty()
  .integer()
  .ruleset.min(1)
  .max(MAX_VALUES.seeds)
  .rule({ message: `{#label} must be between 1 and ${MAX_VALUES.seeds}` });

export const branches = Joi.number()
  .empty()
  .integer()
  .ruleset.min(1)
  .max(MAX_VALUES.branches)
  .rule({ message: `{#label} must be between 1 and ${MAX_VALUES.branches}` });

export const depth = Joi.number()
  .empty()
  .integer()
  .ruleset.min(1)
  .max(MAX_VALUES.branches)
  .rule({ message: `{#label} must be between 1 and ${MAX_VALUES.depth}` });

export const country = Joi.string().empty().pattern(new RegExp('^[A-Z]{2}$')).messages({
  'string.pattern.base': `{#label} must be a country code. e.g., 'CA' for Canada`,
});

export const language = Joi.string().empty().pattern(new RegExp('^[a-z]{2}-[A-Z]{2}$')).messages({
  'string.pattern.base': `{#label} must be a language code. e.g., 'en-CA' for English Canada`,
});
