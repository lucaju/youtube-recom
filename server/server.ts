import express from 'express';
import path from 'path';
import db from '../db';
// import helmet from 'helmet';
import { collect, project, users } from './routes';
import { createIo } from './socket';

// ? Check this: Express.js role-based permissions middleware: https://gist.github.com/joshnuss/37ebaf958fe65a18d4ff

const publicPath = path.join(__dirname, '..', 'public');

const app = express();
// const server = createIo(app);
const server = app;

// app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));

app.use(express.json({ limit: '5mb' })); // support json encoded bodies
app.use('/collect', collect);
app.use('/projects', project);
app.use('/users', users);

db.connect();

app.use(express.static(publicPath));

export default server;
