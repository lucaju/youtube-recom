import kleur from 'kleur';
import { scrapeVideo } from '../../src';
import { log } from '../../src/util/log';
import { argv } from './argv';
import { Inquerer } from './inquerer';

const initSetup = async () => {
  let videoId: string;

  if (argv.id) {
    const { id, silent = false } = argv;
    videoId = id;
    log.setLevel(silent ? log.levels.SILENT : log.levels.DEBUG);
  } else {
    const response = await Inquerer();
    videoId = response.id;
    log.setLevel(response.loglevel);
  }

  return videoId;
};

void (async () => {
  const videoId = await initSetup();
  log.info(kleur.magenta(`Scraping Youtube Video: ${videoId}\n`));
  const data = await scrapeVideo(videoId);
  log.info(data);
})();
