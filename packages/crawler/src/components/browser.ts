import kleur from 'kleur';
import log from 'loglevel';
import puppeteer, { type Browser } from 'puppeteer';

interface BrowserConfig {
  headless?: boolean;
}

let browser: Browser | undefined = undefined;

export const getBrowser = async ({ headless }: BrowserConfig = { headless: true }) => {
  if (browser) return browser;

  const newBrowser = await puppeteer.launch({
    headless,
    defaultViewport: { width: 1400, height: 1200 },
    args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'],
  });

  log.debug(kleur.gray('Puppeteer Launched'));

  browser = newBrowser;

  return browser;
};

export const closeBrowser = async () => {
  await browser?.close();
};

export const disposeBrowser = async () => {
  if (browser) {
    await browser.close();
    browser = undefined;
  }
};
