import kleur from 'kleur';
import { ElementHandle } from 'puppeteer';
import config from '../config.json';
import { getBrowser } from '../service/browser';
import type { IVideoRecommended, SortType } from '../types';

export const searchResults = async (query: string) => {
  const maxSearches = config.searches <= 10 ? config.searches : 10;

  const browser = await getBrowser();
  const page = await browser.newPage();

  if (config.language !== '') {
    // add header for the navigation requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (!request.isNavigationRequest()) {
        request.continue();
        return;
      }

      const headers = request.headers();
      headers['Accept-Language'] = config.language;
      request.continue({ headers });
    });
  }

  let url = `https://www.youtube.com/results?sp=${sortBy()}&&search_query=${query}`;
  if (config.gl !== '') url = url + `&gl=${config.gl}`;
  await page.goto(url);

  await page.waitForSelector('ytd-video-renderer');
  const results = await page.$$('ytd-video-renderer');

  const items = results.slice(0, maxSearches);

  const videos: IVideoRecommended[] = [];

  for (const item of items) {
    const video = await getDetails(item);
    if (!video) {
      console.log(kleur.red('Link to video not found'));
      continue;
    }

    videos.push(video);
  }

  page.close();

  return videos;
};

const getDetails = async (item: ElementHandle<Element>) => {
  const link = await item.$eval('h3 > a', (content) => content.getAttribute('href'));
  if (!link) return null;

  const id = link.toString().split('=')[1];

  const title = await item.$eval('h3 > a > yt-formatted-string', (content) => content.innerHTML);

  const video: IVideoRecommended = { id, title };

  return video;
};

const sortBy = (value?: SortType) => {
  if (value === 'top_rated') {
    console.log('Sorting search results by rating');
    return 'CAMSAhAB';
  }
  if (value === 'view_count') {
    console.log('Sorting search results by number of views');
    return 'CAE%253D';
  }
  return 'EgIQAQ%253D%253D'; //videos only && relevance
};
