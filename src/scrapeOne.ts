import kleur from 'kleur';
import pupeteer from './browser';
import { watchPage } from './scraper/watch';

const ytID = 'uBY1AoiF5Vo';

const run = async () => {
  console.log(kleur.magenta(`Scraping Youtube Recommendations: ${ytID}\n`));

  await pupeteer.launch({ headless: false });
  await watchPage({ id: ytID });
  await pupeteer.close();

  console.log(kleur.magenta('\nDone'));
};

run();
