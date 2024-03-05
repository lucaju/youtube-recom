import kleur from 'kleur';
import { scrapeVideo } from 'youtube-recommendation-crawler';
import { log } from '../util/log';
import { argv } from './argv';
import { Inquerer } from './inquerer';

const initSetup = async () => {
  let loglevel: log.LogLevelDesc = log.levels.INFO;
  let videoId: string;

  if (argv.id) {
    const { id, silent = false, verbose = false } = argv;
    videoId = id;
    loglevel = silent ? log.levels.SILENT : verbose ? log.levels.DEBUG : log.levels.INFO;
  } else {
    const response = await Inquerer();
    videoId = response.id;
    if (response.loglevel) loglevel = getLogLevelDesc(response.loglevel);
  }

  log.setLevel(loglevel);

  return videoId;
};

void (async () => {
  const videoId = await initSetup();
  log.info(kleur.magenta(`Scraping Youtube Video: ${videoId}\n`));
  const data = await scrapeVideo(videoId);
  log.info(data);
})();
