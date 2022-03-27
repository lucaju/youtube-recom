import { Browser, ElementHandle, Page } from 'puppeteer';
import { getBrowser } from '../browser';
import { config } from '../config';
import type { IVideo, IVideoRecommended } from '../types';

let browser: Browser;

export const watchPage = async ({ id }: IVideo | IVideoRecommended) => {
  const url = `https://www.youtube.com/watch?v=${id}`;

  browser = await getBrowser();
  const page = await browser.newPage();

  await page.goto(url);
  // page.setDefaultTimeout(180000);
  // page.waitForTimeout(5000);

  const metadata = await getMetadata(page);
  if (!metadata) return;

  const recomendations: IVideoRecommended[] = await getRecommendations(page);

  // const collectedAt = new Date().toISOString();
  const collectedAt = new Date();

  const video: IVideo = {
    id,
    ...metadata,
    recomendations,
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
  // console.log(metas);

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
  // console.log(container);
  if (!container) return;

  // * Views
  const viewCount = await container
    .$eval(
      'div > #count > ytd-video-view-count-renderer > .view-count',
      (content) => content.innerHTML
    )
    .catch(() => '');
  // console.log(viewCount);
  const views = cleanCount(viewCount);

  // * Hashtags
  const hastags = await container.$$eval('div > .super-title > a', (content) =>
    content.map((n) => n.innerHTML)
  );
  // console.log(hastags);

  const interactButtons = await container.$$('div > ytd-toggle-button-renderer');
  //first button: Like
  // second button: dislike

  // * Likes Exact
  //aria-label contains the exact number.
  const likesExactCount = await interactButtons?.[0]?.$eval('yt-formatted-string', (content) =>
    content.getAttribute('aria-label')
  );
  const likes = likesExactCount ? cleanCount(likesExactCount) : -1;
  // console.log(likes_exact);

  // * Comments
  const commentsAvailable = await page
    .waitForSelector('ytd-comments-header-renderer', { timeout: 5000 })
    .catch(() => null);
  const commentsContainer = commentsAvailable ? await page.$('ytd-comments-header-renderer') : null;
  // console.log(container);

  const commentsCount = await commentsContainer?.$eval(
    'div > h2 > yt-formatted-string > span',
    (content) => content.innerHTML
  );
  // console.log(commentsCount);
  const comments = commentsCount ? cleanCount(commentsCount) : -1;

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
  };

  // console.log(videoDetails);
  return videoDetails;
};

const getRecommendations = async (page: Page) => {
  await page.waitForSelector('ytd-watch-next-secondary-results-renderer');

  const container = await page.$('ytd-watch-next-secondary-results-renderer');
  if (!container) return [];

  // * Reccomendation List
  const items = await page.$$('ytd-compact-video-renderer');

  // * Details
  const recommendations: IVideoRecommended[] = [];

  for (const item of items.splice(0, config.branch ?? 1)) {
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
  const id = link.toString().split('=')[1];

  // * Title
  const title = await item.$eval('#video-title', (content) => content.innerHTML.trim());

  // * Results
  const recommendedVideo: IVideoRecommended = { id, title };
  return recommendedVideo;
};

const cleanCount = (value: string) => {
  const onlyNumber = value.match(/[\d,]+/);
  const valueNumber = onlyNumber ? parseFloat(onlyNumber[0].replaceAll(',', '')) : -1;
  return valueNumber;
};
