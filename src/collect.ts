import { blue, green, magenta, white } from 'kleur';
import { DateTime } from 'luxon';
import browser from './browser';
import { config } from './config';
import db from './db';
import Scraper from './scraper';

export async function collect() {
  const startDate = DateTime.now();
  console.log(magenta(`Scraping Youtube Recommendations: ${startDate}\n`));

  await db.connect();

  await browser.launch();

  const queries = config.queries;

  console.log(white('Queries:'));
  console.log(blue(queries.join(',')));

  // * Each Keyword
  for (const query of queries) {
    const scraper = new Scraper(query);
    await scraper.collect();
    console.table(scraper.videos, ['recommended', 'depth', 'title', 'views', 'likes']);
    await scraper.save();
  }

  //send log email
  // await sendEmail();

  //done
  await browser.close();
  db.close();

  const endDate = DateTime.now();
  const duration = endDate.diff(startDate, ['hours','minutes', 'seconds']);

  console.log(green(`\n(${duration.toHuman({ unitDisplay: "short" })})`));
  console.log(magenta(`\nDone at ${endDate}`));
}
