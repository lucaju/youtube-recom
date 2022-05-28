import type { IAdCompanion, IRecommendedVideo, IVideo } from '../types';
import { DateTime } from 'luxon';
import { Browser, ElementHandle, Page } from 'puppeteer';

interface IWatchPageParams {
  browser: Browser;
  branches?: number;
  timezone?: string;
  ytId: string;
}

export const watchPage = async ({ browser, branches, ytId, timezone }: IWatchPageParams) => {
  const url = `https://www.youtube.com/watch?v=${ytId}`;

  const page = await browser.newPage();

  await page.goto(url);

  const metadata = await getMetadata(page);
  if (!metadata) return;

  const recommendations: IRecommendedVideo[] = await getRecommendations(page, branches);

  const collectedAt = DateTime.now().setZone(timezone).toBSON();

  const video: IVideo = {
    ytId,
    ...metadata,
    recommendations,
    collectedAt,
    recommended: 1,
    depth: 0,
  };

  await page.close();
  return video;
};

const getMetadata = async (page: Page) => {
  // * Metadata headers
  const watchContent = await page.$('#watch7-content');
  if (!watchContent) return;

  const metas: { [x: string]: any } = await watchContent.$$eval('meta', (content) => {
    const metaObject = {};

    content.forEach((meta) => {
      const key = meta.getAttribute('itemprop');
      const value = meta.getAttribute('content');
      if (!key || !value) return;

      //@ts-ignore
      metaObject[key] = value;
    });

    return metaObject;
  });

  const title = metas.name;
  const description = metas.description;
  const paid = metas.paid === 'True' ? true : false;
  const channelId = metas.channelId;
  const duration = metas.duration;
  const uploadDate = metas.uploadDate;
  const datePublished = metas.datePublished;

  const channelMeta: { [x: string]: any } = await watchContent.$$eval(
    'span[itemprop="author"] > link',
    (content) => {
      const metaObject = {};

      content.forEach((meta) => {
        const key = meta.getAttribute('itemprop');
        const value = meta.getAttribute('content') || meta.getAttribute('href');
        if (!key || !value) return;

        //@ts-ignore
        metaObject[key] = value;
      });

      return metaObject;
    }
  );
  const channelName = channelMeta.name ?? '';

  await page.waitForSelector('#info-contents');

  // * Info Contents

  const container = await page.$('#info-contents');
  if (!container) return;

  // * Views
  const viewCount = await container
    .$eval(
      'div > #count > ytd-video-view-count-renderer > .view-count',
      (content) => content.innerHTML
    )
    .catch(() => '');
  const views = cleanCount(viewCount);

  // * Hashtags
  const hastags = await container.$$eval('div > .super-title > a', (content) =>
    content.map((n) => n.innerHTML)
  );

  const interactButtons = await container.$$('div > ytd-toggle-button-renderer');
  // first button: Like
  // second button: dislike

  // * Likes Exact
  //aria-label contains the exact number.
  const likesExactCount = await interactButtons?.[0]?.$eval('yt-formatted-string', (content) =>
    content.getAttribute('aria-label')
  );
  const likes = likesExactCount ? cleanCount(likesExactCount) : -1;

  // * Comments
  const commentsAvailable = await page
    .waitForSelector('ytd-comments-header-renderer', { timeout: 5000 })
    .catch(() => null);
  const commentsContainer = commentsAvailable ? await page.$('ytd-comments-header-renderer') : null;

  const commentsCount = await commentsContainer?.$eval(
    'div > h2 > yt-formatted-string > span',
    (content) => content.innerHTML
  );

  const comments = commentsCount ? cleanCount(commentsCount) : -1;

  const adCompanion = await getAdCompanion(page);

  // * Results
  const videoDetails: Partial<IVideo> = {
    title,
    description,
    duration,
    hastags,
    uploadDate,
    datePublished,
    channel: {
      id: channelId,
      name: channelName,
    },
    paid,
    views,
    likes,
    comments,
    adCompanion,
  };

  return videoDetails;
};

const getAdCompanion = async (page: Page) => {
  const container = await page.$('#companion');
  if (!container) return;

  const block = await page.$('#block > div#text');
  if (!block) return;

  const title = await block.$eval('div#header', (content) => content.innerHTML.trim());
  const domain = await block.$eval('div#desc > span#domain', (content) => content.innerHTML.trim());

  if (!title && !domain) return;

  const adCompanion: IAdCompanion = { title, domain };

  return adCompanion;
};

const getRecommendations = async (page: Page, branches?: number) => {
  await page.waitForSelector('ytd-watch-next-secondary-results-renderer');

  const container = await page.$('ytd-watch-next-secondary-results-renderer');
  if (!container) return [];

  // * Recommendation List
  const items = await page.$$('ytd-compact-video-renderer');

  // * Details
  const recommendations: IRecommendedVideo[] = [];

  for (const item of items.splice(0, branches ?? 1)) {
    const videoRecomended = await getRecommendedVideoDetails(item);
    if (videoRecomended) recommendations.push(videoRecomended);
  }

  // * Results
  return recommendations;
};

const getRecommendedVideoDetails = async (item: ElementHandle<Element>) => {
  // * Link
  const link = await item.$eval('div.metadata > a', (content) => content.getAttribute('href'));
  if (!link) return;

  // * ID
  const ytId = link.toString().split('=')[1];

  // * Title
  const title = await item.$eval('#video-title', (content) => content.innerHTML.trim());

  // * Results
  const recommendedVideo: IRecommendedVideo = { ytId, title };
  return recommendedVideo;
};

const cleanCount = (value: string) => {
  const onlyNumber = value.match(/[\d,]+/);
  const valueNumber = onlyNumber ? parseFloat(onlyNumber[0].replaceAll(',', '')) : -1;
  return valueNumber;
};
