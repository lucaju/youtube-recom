import { CronJob } from 'cron';
import { readJson } from 'fs-extra';
import { collect } from './collect';
import { argv, config, Inquerer, setConfig } from './config';

//Initial Setup
(async () => {
  //@ts-ignore
  if (argv.queries) {
    setConfig(argv);
  } else {
    const configJson = await readJson('config.json').catch(() => null);
    setConfig(configJson ??  await Inquerer());
  }

  const job = new CronJob({
    cronTime: `* * ${config.cron.hour} * * *`,
    onTick: function () {
      collect();
    },
    // onComplete: null,
    // start: false,
    timeZone: config.cron.timezone,
  });

  job.start();
})();
