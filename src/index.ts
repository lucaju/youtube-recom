import { readJson } from 'fs-extra';
import { blue, magenta, white } from 'kleur';
import browser from './browser';
import { argv, config, Inquerer, setConfig } from './config';
import db from './db';
import Scraper from './scraper';

//Initial Setup
(async () => {
  //@ts-ignore
  if (argv.queries) {
    setConfig(argv);
  } else {
    const configJson = await readJson('config.json').catch(() => null);
    if (configJson) {
      setConfig(configJson);
    } else {
      const result = await Inquerer();
      setConfig(result);
    }
  }

  run();
})();

async function run() {
  const now = new Date();
  console.log(magenta(`Scraping Youtube Recommendations: ${now}\n`));

  await db.connect();

  await browser.launch();

  const queries = config.queries;

  console.log(white('Queries:'));
  console.log(blue(queries.join(',')));

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
  await browser.close();
  db.close();

  console.log(magenta('\nDone'));
}
