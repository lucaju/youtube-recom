import kleur from 'kleur';
import log from 'loglevel';
import type { Browser, ElementHandle } from 'puppeteer';
import type { RecommendedVideo, SortType } from '../types';

interface Props {
  country?: string;
  browser: Browser;
  keyword: string;
  language?: string;
  seeds: number;
}

export const searchPage = async ({ browser, keyword, seeds, country, language }: Props) => {
  const maxSeeds = seeds <= 10 ? seeds : 10;

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

  const videos: RecommendedVideo[] = [];

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

  const ytId = link.toString().split('=')[1];

  const title = await item.$eval('h3 > a > yt-formatted-string', (content) => content.innerHTML);

  const video: RecommendedVideo = { ytId, title };

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
