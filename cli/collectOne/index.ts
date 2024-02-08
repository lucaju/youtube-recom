import { blue, magenta } from 'kleur';
import log from 'loglevel';
import { launchPuppeteer } from '../../crawler/browser';
import { watchPage } from '../../crawler/scraper';
import { argv } from './argv';
import { Inquerer } from './inquerer';

interface IConfig {
  id: string;
  loglevel: log.LogLevelDesc;
}

const initSetup = async () => {
  let config: IConfig;

  if (argv.id) {
    const { id, silent, verbose } = argv;
    config = {
      id,
      loglevel: silent ? log.levels.SILENT : verbose ? log.levels.DEBUG : log.levels.WARN,
    };
  } else {
    const { id, loglevel } = await Inquerer();
    config = {
      id,
      loglevel:
        loglevel === 'silent'
          ? log.levels.SILENT
          : loglevel === 'verbose'
            ? log.levels.DEBUG
            : log.levels.WARN,
    };
  }

  return config;
};

(async () => {
  const { loglevel, id } = await initSetup();
  log.setLevel(loglevel);

  log.info(magenta(`Scraping Youtube Recommendations: ${id}\n`));

  const browser = await launchPuppeteer();
  const data = await watchPage({ browser, ytId: id });
  await browser.close();

  log.info(blue('Result'));
  log.warn(data);

  log.info(magenta('\nDone'));
})();
