import { gray } from 'kleur';
import puppeteer, { Browser } from 'puppeteer';

interface BrowserConfig {
  headless?: boolean;
}

let browser: Browser;

const launch = async ({ headless }: BrowserConfig = { headless: true }) => {
  browser = await puppeteer.launch({
    headless,
    defaultViewport: { width: 1400, height: 1200 },
  });

  console.log(gray('Puppeteer Launched'));

  return browser;
};

export const getBrowser = async () => {
  if (!browser) await launch();
  return browser;
};

export const getPage = async () => {
  if (!browser) await launch();
  const page = await browser.newPage();
  return page;
};

const close = async () => await browser.close();

export default {
  launch,
  getBrowser,
  getPage,
  close,
};
