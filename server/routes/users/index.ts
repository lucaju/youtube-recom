import { celebrate, errors, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import { UserModel } from '../../../db/users';
import { emitIo } from '../../socket';
import { httpHeaders } from '../headers';
import { auth } from '../middleware/auth';
import * as validation from './validation';

export const router = Router();
router.use(httpHeaders);
router.use(errors());

/**
 * GET User by is
 * Returns a single user
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.id The user id. Matches the user._id | 'me' refers to current user
 * @returns {Object} res.body - User
 */
router.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.alternatives().try(Joi.string().valid('me'), validation.objectId),
    }),
  }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, params }, res) => {
    //if cuurrent user
    if (params.id === 'me') {
      const userData = currentUser.toJSON();
      res.status(200).send(userData);
      return;
    }

    if (currentUser.id !== params.id && currentUser.role !== 'admin') {
      return res.status(401).send();
    }

    //any other user
    const user = await UserModel.findById(params.id);
    if (!user) return res.status(404).send();

    const userData = user.toJSON();
    res.status(200).send(userData);
  }
);

/**
 * GET Users
 * Returns a list of users
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @returns {Object} res.body - Users
 */
router.get('/', auth('bearerJWT'), async ({ currentUser }, res) => {
  if (currentUser.role !== 'admin') return res.status(401).send();

  const users = await UserModel.find();
  const userData = users.map((user) => user.toJSON());
  res.status(200).send(userData);
});

/**
 * POST New User
 * Returns the new user
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @param {Object} req.body User data [required]
 * @returns {Object} res.body - New User
 * @example
 * /
 * { body: { email, name, password, role, ... } }
 */
router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object()
      .keys({
        email: Joi.string().email().required(),
        name: validation.name.required(),
        role: Joi.string().required(),
        password: validation.password.required(),
      })
      .unknown(true),
  }),
  errors(),
  auth('bearerJWT'),
  async ({ currentUser, body }, res) => {
    if (currentUser.role !== 'admin') return res.status(401).send();

    const user = new UserModel(body);
    const response = await user.save().catch(() => ({
      message: 'Failed. Email already exists.',
    }));

    res.status(201).send(response);
  }
);

/**
 * PATCH User
 * Returns the updated user.
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.id User id
 * @param {Object} req.body User data to updated
 * @returns {Object} res.body - Updated User
 * @example
 * /
 * { body: password,  ... } }
 */
router.patch(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.alternatives().try(Joi.string().valid('me'), validation.objectId),
    }),
    [Segments.BODY]: Joi.object()
      .keys({ name: validation.name, password: validation.password })
      .unknown(true),
  }),
  errors(),
  auth('bearerJWT'),
  async ({ body, params, currentUser, token }, res) => {
    if (params.id !== 'me' && currentUser.id !== params.id && currentUser.role !== 'admin') {
      return res.status(401).send();
    }
    // check valid operation
    const updates = Object.keys(body);
    const allowedUpdates = ['name', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    const passwordUpdate = allowedUpdates.find((type) => type === 'password');

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }
    const user = params.id === 'me' ? currentUser : await UserModel.findById(params.id);
    if (!user) return res.status(404).send();

    updates.forEach((update) => (user[update] = body[update]));

    if (passwordUpdate) {
      user.tokens = user.tokens.filter((t: string) => t === token);
    }

    await user.save();

    res.status(200).send(user);
  }
);

/**
 * DELETE User
 * Returns the the deleted user.
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 * @param {String} req.params.id The user id
 * @returns {Object} res.body - Deleted User
 */
router.delete(
  '/:id',
  celebrate({ [Segments.PARAMS]: Joi.object().keys({ id: validation.objectId }) }),
  errors(),
  auth('bearerJWT'),
  async ({ params, currentUser }, res) => {
    if (params.id !== 'me' && currentUser.id !== params.id && currentUser.role !== 'admin') {
      return res.status(401).send();
    }

    currentUser = params.id === 'me' ? currentUser : await UserModel.findById(params.id);
    await UserModel.findOneAndRemove({ _id: currentUser.id });
    res.status(200).send(currentUser);
  }
);

/**
 * POST Login
 * Creates new token
 * Returns the user id, email, and tokwn
 *
 * @async
 * @function
 * @requires BasicAuthentication email:password encrypted base64
 * @returns {Object} res.body - The user id, email, and token
 */
router.post('/login', auth('basic'), async ({ currentUser, token }, res) => {
  if (!currentUser) res.status(404);
  emitIo('userEvent', { msg: 'login' });
  res.status(200).json({ ...currentUser.toJSON(), token });
});

/**
 * POST Logout
 * Remove current token
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 */
router.post('/logout', auth('bearerJWT'), async ({ currentUser, token }, res) => {
  currentUser.tokens = currentUser.tokens.filter((tokn: string) => tokn !== token);
  await currentUser.save();
  emitIo('userEvent', { msg: 'logout' });
  res.status(200).send();
});

/**
 * POST Logout from everywhere
 * Remove all tokens
 *
 * @async
 * @function
 * @requires BearerAuthentication jwt
 */
router.post('/logout/all', auth('bearerJWT'), async ({ currentUser }, res) => {
  currentUser.tokens = [];
  await currentUser.save();
  emitIo('userEvent', { msg: 'logout all' });
  res.status(200).send();
});
