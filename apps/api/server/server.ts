import { contract } from '@/contract';
import db from '@/db';
import { createExpressEndpoints } from '@ts-rest/express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import 'dotenv/config';
import express, { type Express } from 'express';
import helmet from 'helmet';
// import * as swaggerUi from 'swagger-ui-express';
import { router } from './routes';
// import { openApiDocument } from './swagger';
import { morganWinstonMiddleware } from './logger';
import { Session } from './session';
// import { createIo } from './socket';

let server: Express | undefined;

export const createServer = () => {
  if (server) return server;

  server = express();
  // const server = createIo(express());

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(express.json());

  server.use(Session);
  server.use(cors());
  server.use(helmet());
  server.use(compression());
  server.use(morganWinstonMiddleware);

  createExpressEndpoints(contract, router, server);

  server.get('/healthz', (_req, res) => res.send('OK'));
  // server.get('/open-api.json', (_req, res) => res.send(openApiDocument));
  // server.use('/', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  void db.connect();

  return server;
};
