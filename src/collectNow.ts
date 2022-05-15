import { readJson } from 'fs-extra';
import { argv, Inquerer, setConfig } from './config';
import { collect } from './collect';

//Initial Setup
(async () => {
  //@ts-ignore
  if (argv.queries) {
    setConfig(argv);
  } else {
    const configJson = await readJson('config.json').catch(() => null);
    setConfig(configJson ?? (await Inquerer()));
  }

  collect();
})();
