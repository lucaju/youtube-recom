import kleur from 'kleur';
import type { Browser, ElementHandle } from 'puppeteer';
import { getBrowser } from '../components/index.ts';
import { config } from '../config.ts';
import { log } from '../util/log.ts';
import type { CrawlerConfig, VideoBase } from '../types/index.ts';

type SortType = 'top_rated' | 'view_count' | 'Sorting search results by relevance';

interface Props extends Pick<CrawlerConfig, 'country' | 'language' | 'seeds'> {
  browser?: Browser;
  keyword: string;
}

export const searchPage = async ({
  browser,
  country,
  keyword,
  language,
  seeds = config.seeds.default,
}: Props) => {
  if (!browser) browser = await getBrowser();
  const maxSeeds = seeds;

  const page = await browser.newPage();

  if (language) {
    // add header for the navigation requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (!request.isNavigationRequest()) {
        void request.continue();
        return;
      }

      const headers = request.headers();
      headers['Accept-Language'] = language ?? '';
      void request.continue({ headers });
    });
  }

  //* Search params
  const searchParams = new URLSearchParams({ sp: sortBy(), search_query: keyword });
  if (country) searchParams.append('country', country);

  const url = `https://www.youtube.com/results?${searchParams.toString()}`;
  await page.goto(url);

  await page.waitForSelector('ytd-video-renderer').catch();
  const results = await page.$$('ytd-video-renderer');

  const items = results.slice(0, maxSeeds);

  const videos: VideoBase[] = [];

  for (const item of items) {
    const video = await getDetails(item);
    if (!video) {
      log.warn(kleur.red('Link to video not found'));
      continue;
    }

    videos.push(video);
  }

  await page.close();

  return videos;
};

const getDetails = async (item: ElementHandle<Element>) => {
  const link = await item.$eval('h3 > a', (content) => content.getAttribute('href'));
  if (!link) return null;

  const id = link.toString().split('=')[1];

  const title = await item.$eval('h3 > a > yt-formatted-string', (content) => content.innerHTML);

  const video: VideoBase = { id, title };

  return video;
};

const sortBy = (value?: SortType) => {
  if (value === 'top_rated') {
    log.info('Sorting search results by rating');
    return 'CAMSAhAB';
  }
  if (value === 'view_count') {
    log.info('Sorting search results by number of views');
    return 'CAE%253D';
  }
  return 'EgIQAQ%253D%253D'; //videos only && relevance
};
