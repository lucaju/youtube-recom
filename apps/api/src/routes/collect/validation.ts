import { Joi } from 'celebrate';
import { MAX_VALUES } from 'youtube-recommendation-crawler';
import * as validation from '../validation';

export const crawler = Joi.object().keys({
  keywords: Joi.string()
    .messages({
      'any.required': `{#label} is required. Provide one or multiple keywords. e.g., '[kiasmos, rock]`,
      message: `{#label} must be between 1 and ${MAX_VALUES.keywords}`,
    })
    .required(),
  seeds: validation.seeds,
  branches: validation.branches,
  depth: validation.depth,
  country: validation.country,
  language: validation.language,
});

export const videoID = Joi.string().messages({
  'any.required': `{#label} is required. Provide an YouTube video id. e.g., ?id=hBk4nV7q6-w`,
  'string.empty': `{#label} cannot be empty. Provide an YouTube video id. e.g., 'hBk4nV7q6-w'`,
});
