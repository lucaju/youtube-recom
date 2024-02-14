import kleur from 'kleur';
import log from 'loglevel';
import puppeteer from 'puppeteer';

interface BrowserConfig {
  headless?: boolean;
}

export const launchPuppeteer = async ({ headless }: BrowserConfig = { headless: true }) => {
  const browser = await puppeteer.launch({
    headless,
    defaultViewport: { width: 1400, height: 1200 },
    args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'],
  });

  log.info(kleur.gray('Puppeteer Launched'));

  return browser;
};
