import kleur from 'kleur';
import log from 'loglevel';
import { launchPuppeteer, watchPage } from 'youtube-recommendation-crawler';
import { argv } from './argv';
import { Inquerer } from './inquerer';

let loglevel: log.LogLevelDesc = 'INFO';
let videoId: string;

const initSetup = async () => {
  if (argv.id) {
    const { id, silent = false, verbose = false } = argv;
    videoId = id;
    loglevel = silent ? 'SILENT' : verbose ? 'DEBUG' : 'INFO';
  } else {
    const { id, loglevel: _loglevel } = await Inquerer();
    videoId = id;
    loglevel = _loglevel === 'silent' ? 'SILENT' : _loglevel === 'verbose' ? 'DEBUG' : 'INFO';
  }

  log.setLevel(loglevel);

  return videoId;
};

void (async () => {
  const videoId = await initSetup();
  log.info(kleur.magenta(`Scraping Youtube Recommendations: ${videoId}\n`));

  const browser = await launchPuppeteer();
  const data = await watchPage({ browser, ytId: videoId });
  await browser.close();

  log.info(kleur.blue('Result'));
  log.warn(data);

  log.info(kleur.magenta('\nDone'));
})();
