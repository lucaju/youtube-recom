import 'dotenv/config';
import kleur from 'kleur';
import log from 'loglevel';
import server from './server';

log.setDefaultLevel(log.levels.INFO);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  log.info(kleur.bgGreen().black(`\n Server listening on port ${port}!`));
});
