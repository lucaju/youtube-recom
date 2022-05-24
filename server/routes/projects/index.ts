import { celebrate, errors, Joi, Modes, Segments } from 'celebrate';
import { Router } from 'express';
import log from 'loglevel';
import { IProject } from '../../../db';
import { ProjectModel } from '../../../db/models';
import { httpHeaders } from '../headers';
import { auth } from '../middleware/auth';
import * as actions from './actions';
import * as validation from './validation';

export const router = Router();
router.use(httpHeaders);
router.use(errors());

/**
 * GET All Project
 * Returns a list of projects
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @returns {Object} res.body - Project
 */
router.get('/all', auth('bearerJWT'), async ({ currentUser }, res) => {
  if (currentUser.role !== 'admin') return res.status(401).send();

  const projects = await actions.getProjects();

  const response = projects.map((project) => ({ ...project.toJSON() }));

  res.status(200).json(response);
});

/**
 * GET All Project by Status
 * Returns a list of projects
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.status The project's status (active/inactive).
 * @returns {Object} res.body - Project
 */
router.get(
  '/all/status/:status',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({ status: Joi.string().valid('active', 'inactive') }),
  }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, params }, res) => {
    if (currentUser.role !== 'admin') return res.status(401).send();

    const active = params.status !== 'active' ? false : true;
    const projects = await actions.getProjects({ active });

    const response = projects.map((project) => ({ ...project.toJSON() }));

    res.status(200).json(response);
  }
);

/**
 * GET Project by ID
 * Returns a single project
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.id The project id.
 * @returns {Object} res.body - The project
 */
router.get(
  '/:id',
  celebrate({ [Segments.PARAMS]: Joi.object().keys({ id: validation.objectId }) }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, params }, res) => {
    const owner = currentUser.role !== 'admin' ? currentUser.id : null;

    const project = await actions.getProject({ id: params.id, owner });

    if (!project) {
      if (currentUser.role !== 'admin') return res.status(401).send();
      return res.status(404).json({ msg: `Project ${params.id} does not exists` });
    }

    res.status(200).json({ ...project.toJSON({ versionKey: currentUser.role === 'admin' }) });
  }
);

/**
 * GET Projects for a User
 * Returns a list of projects
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @returns {Object} res.body - Project
 */
router.get('/', auth('bearerJWT'), async ({ currentUser }, res) => {
  const projects = await actions.getProjects({ owner: currentUser.id });

  const response = projects.map((project) => ({ ...project.toJSON({ versionKey: false }) }));

  res.status(200).json(response);
});

/**
 * GET Project by status for a User
 * Returns a single project
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.status The project status (active/inactive).
 * @returns {Object} res.body - The project
 */
router.get(
  '/status/:status',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({ status: Joi.string().valid('active', 'inactive') }),
  }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, params }, res) => {
    const active = params.status !== 'active' ? false : true;
    const projects = await actions.getProjects({ active, owner: currentUser.id });

    const response = projects.map((project) => ({ ...project.toJSON({ versionKey: false }) }));

    res.status(200).json(response);
  }
);

/**
 * POST new project
 * Send a request with a configuration to start a new cronjob.
 * Returns the project.
 *
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.body.config.keywords A comma-separated list of keywords [required]
 * @param {Number} req.body.config.seeds Number of seed videos from the search [optional]
 * @param {Number} req.body.config.branches Number of seed videos from the search [optional]
 * @param {Number} req.body.config.depth The recommendation depth to explore [optional]
 * @param {String} req.body.config.country Limit by country. Use contry code. [optional]
 * @param {String} req.body.config.language Limit by language. Use language code. [optional]
 * @param {Object} req.body.config.schedule Set the project schedule [required]
 * @param {Number} req.body.config.schedule.hour The hour of the day when the project will run [required]
 * @param {String} req.body.config.schedule.timezone The timezone [optional]
 * @param {String} req.body.title The Project title [required]
 * @returns {Object} res.body - The project
 * @example
 * {
    config {
      "keywords": ["Kiasmos"],
      "seeds": 1,
      "branches": 2,
      "depth": 1,
      "language": "en-CA",
      "country": "CA",
      "schedule": {
          "hour": 20,
          "timezone": "America/Sao_Paulo"
      }
    },
    "title": "my project"
  }
 */
router.post(
  '/',
  celebrate(
    {
      [Segments.BODY]: Joi.object()
        .keys({
          crawler: validation.crawler.required(),
          schedule: validation.schedule.required(),
          title: validation.title.required(),
        })
        .required(),
    },
    { abortEarly: false },
    { mode: Modes.FULL }
  ),
  errors(),
  auth('bearerJWT'),
  async ({ body, currentUser }, res) => {
    const configProject = body as Partial<IProject>;

    const project = await actions.createProject(currentUser.id, configProject);
    if (!project) return res.status(400).json({ msg: 'Invalid config' });

    res.status(201).json({
      project: { ...project.toJSON({ versionKey: false }) },
      msg: `Project ${project.title} created`,
    });
  }
);

/**
 * PUT Project
 * Returns the updated project.
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.id User id
 * @param {Object} req.body project data to updated
 * @returns {Object} res.body - Updated projects
 * @example
 * /
 * { config,  ... } }
 */
router.put(
  '/:id',
  celebrate(
    {
      [Segments.PARAMS]: Joi.object().keys({ id: validation.objectId.required() }).required(),
      [Segments.BODY]: Joi.object()
        .keys({
          crawler: validation.crawler,
          schedule: validation.schedule,
          title: validation.title,
        })
        .required(),
    },
    { abortEarly: false },
    { mode: Modes.FULL }
  ),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, body, params }, res) => {
    const owner = currentUser.role !== 'admin' ? currentUser.id : undefined;

    const sanitizedRequest = actions.sanitizeMongoConditions({ id: params.id, owner });
    if (!sanitizedRequest)
      return res.status(404).json({ msg: `Project ${params.id} does not exists` });

    const project = await ProjectModel.findOne(sanitizedRequest);
    if (!project) {
      if (currentUser.role !== 'admin') return res.status(401).send();
      return res.status(404).json({ msg: `Project ${params.id} does not exists` });
    }

    // check valid operation
    const updates = Object.keys(body);
    const allowedUpdates = ['title', 'config'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    const configUpdate = allowedUpdates.find((type) => type === 'config');

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    //@ts-ignore
    updates.forEach((update) => (project[update] = body[update]));

    await project.save();

    if (configUpdate) {
      await actions.stopJob({ id: params.id, dispose: true });
      await actions.startJob({ id: params.id, owner: currentUser.id });
    }

    res.status(200).json({ ...project.toJSON(), msg: 'Project updated' });
  }
);

/**
 * PATCH Start project
 * Starts an innactive project.
 * Returns the project.
 *
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.id The project id
 * @returns {Object} res.body - The project
 */
router.patch(
  '/:id/start',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({ id: validation.objectId.required() }).required(),
  }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, params }, res) => {
    const owner = currentUser.role !== 'admin' ? currentUser.id : undefined;

    const project = await actions.startJob({ id: params.id, owner });
    if (!project) {
      if (currentUser.role !== 'admin') return res.status(401).send();
      return res.status(404).json({ msg: `Project ${params.id} does not exists` });
    }

    if ('error' in project) return res.status(400).json(project.error);

    log.warn(`Project ${project.id} started`);

    res
      .status(202)
      .json({ project: { ...project.toJSON({ versionKey: false }) }, msg: 'Project started' });
  }
);

/**
 * PATCH Stop project
 * Stops an active project.
 * Returns the project.
 *
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.id The project id
 * @param {Boolean} req.query.dispose Whether to dispose the job entirely [Optional]
 * @returns {Object} res.body - The project
 */
router.patch(
  '/:id/stop',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({ id: validation.objectId.required() }).required(),
    [Segments.QUERY]: Joi.object().keys({ dispose: Joi.boolean().empty() }),
  }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, params, query }, res) => {
    const owner = currentUser.role !== 'admin' ? currentUser.id : undefined;

    const dispose = query.dispose as unknown as boolean;

    const project = await actions.stopJob({ dispose, id: params.id, owner });
    if (!project) {
      if (currentUser.role !== 'admin') return res.status(401).send();
      return res.status(404).json({ msg: `Project ${params.id} does not exists` });
    }
    if ('error' in project) return res.status(406).json({ msg: project.error });

    log.warn(`Project ${project.id} stopped`);

    res
      .status(202)
      .json({ project: { ...project.toJSON({ versionKey: false }) }, msg: 'Project stopped' });
  }
);

/**
 * PATCH Stop all projects
 * Stops all inactive projects.
 * Returns a list of projects.
 *
 * @function
 * @requires BearerAuthentication jwt
 * @param {Boolean} req.query.dispose Whether to dispose the job entirely [Optional]
 * @returns {Object} res.body - The project
 */
router.patch(
  '/stop',
  celebrate({ [Segments.QUERY]: Joi.object().keys({ dispose: Joi.boolean().empty() }) }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, query }, res) => {
    if (currentUser.role !== 'admin') return res.status(401).send();

    const dispose = query.dispose as unknown as boolean;
    await actions.stopAllJob({ dispose });

    log.warn(`All Projects stopped`);
    let msg = 'All Projects stopped.';
    if (dispose) msg = `${msg}. Job pool reseted.`;

    res.status(202).json({ msg });
  }
);

/**
 * DELETE a project
 * Returns the project id.
 *
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.id The project id
 * @returns {Object} res.body.id - The project id
 */
router.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({ id: validation.objectId.required() }).required(),
  }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, params }, res) => {
    const owner = currentUser.role !== 'admin' ? currentUser.id : undefined;

    const projectId = await actions.deleteProject({ id: params.id, owner });
    if (!projectId) {
      if (currentUser.role !== 'admin') return res.status(401).send();
      return res.status(404).json({ msg: `Project ${params.id} does not exists` });
    }

    log.warn(`Project ${projectId} Removed from pool`);

    res.status(202).json({ id: projectId, msg: `Project removed` });
  }
);
