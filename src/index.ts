import kleur from 'kleur';
import config from './config.json';
import Scraper from './scraper';
import pupeteer from './service/browser';
import db from './service/db';

const run = async () => {
  const now = new Date();
  console.log(kleur.magenta(`Scraping Youtube Recommendations: ${now}\n`));

  await db.connect();
  await pupeteer.launch();

  const queries = config.query;

  console.log(kleur.white('Queries:'));
  console.log(kleur.blue(queries.join(',')));

  // * Each Keyword
  for (const query of queries) {
    const scraper = new Scraper(query);
    await scraper.collect();
    console.table(scraper.videos, ['recommended', 'depth', 'title', 'viewCountString', 'likes']);
    await scraper.save();
  }

  //send log email
  // await sendEmail();

  //done
  await pupeteer.close();
  db.close();

  console.log(kleur.magenta('\nDone'));
};

run();
