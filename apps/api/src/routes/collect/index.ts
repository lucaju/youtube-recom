import bodyparser from 'body-parser';
import { celebrate, errors, Joi, Modes, Segments } from 'celebrate';
import { Router } from 'express';
import kleur from 'kleur';
import log from 'loglevel';
import {
  crawler,
  launchPuppeteer,
  watchPage,
  type ICrawlerConfig,
} from 'youtube-recommendation-crawler';
import { httpHeaders } from '../headers';
import { auth } from '../middleware/auth';
import * as validation from './validation';

export const router = Router();

router.use(httpHeaders);
router.use(errors());
router.use(bodyparser.urlencoded({ extended: true }));

/**
 * GET Project
 * Send a request with a configuration to the scraper.
 * Returns the result of the scraper.
 *
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.query.keywords A comma-separated list of keywords [required]
 * @param {Number} req.query.seeds Number of seed videos from the search [optional]
 * @param {Number} req.query.branches Number of seed videos from the search [optional]
 * @param {Number} req.query.depth The recommendation depth to explore [optional]
 * @param {String} req.query.country Limit by country. Use contry code. [optional]
 * @param {String} req.query.language Limit by language. Use language code. [optional]
 * @returns {Object} res.body - The results of the scraper
 * @example
 * /collect?keywords=kiasmos&seeds=1&branches=2&depth=1
 */
router.get(
  '/',
  celebrate(
    { [Segments.QUERY]: validation.crawler.required() },
    { abortEarly: false },
    { mode: Modes.FULL },
  ),
  // errors(),
  auth('bearerJWT'),
  async (req, res) => {
    /* #swagger.tags = ['Collect']
      #swagger.path = '/collect'
      #swagger.description = 'Endpoint for a single non recurrent collection'
    */

    const config = req.query as unknown as ICrawlerConfig;
    if (typeof config.keywords === 'string') config.keywords = [config.keywords];

    const results = await crawler(config);

    res.status(200).send(results);
  },
);

/**
 * GET Video
 * Send a request with a video id to the scraper.
 * Returns the result of the scraper.
 *
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.query.id Youtube Video id [required]
 * @returns {Object} res.body - The results of the scraper
 * @example
 * /collect/video?id=hBk4nV7q6-w
 */
router.get(
  '/video',
  celebrate({ [Segments.QUERY]: Joi.object().keys({ id: validation.videoID.required() }) }),
  // errors(),
  auth('bearerJWT'),
  async (req, res) => {
    /* #swagger.tags = ['Collect']
       #swagger.description = 'Endpoint to scrape a single video'
    */

    if (!req.query.id) return res.status(400).send({ msg: `Missing 'id' keyword` });
    log.warn(kleur.magenta(`Scraping Youtube Recommendations: ${req.query.id}\n`));

    const browser = await launchPuppeteer();
    const videos = await watchPage({ browser, ytId: req.query.id.toString() });
    await browser.close();

    log.warn(kleur.magenta('\nDone'));

    res.status(200).json(videos);
    return;
  },
);
