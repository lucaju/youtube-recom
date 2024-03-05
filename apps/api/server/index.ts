import { log } from '@/util/log';
import 'dotenv/config';
import { bgBlue } from 'kleur/colors';
import { createServer } from './server';

const PORT = process.env.PORT ?? 3000;
const server = createServer();
server.listen(PORT, () => log.info(`Listening at ${bgBlue(`http://localhost:${PORT}`)}`));
