import { Agenda } from '@whisthub/agenda';
import mongoose from 'mongoose';
import { DefineCrawlerJob } from './jobs/crawler';
import { minutesToMilliseconds } from 'date-fns';

export let agenda: Agenda;

export * from './jobs/crawler';

export const connectAgenda = async () => {
  if (agenda) return agenda;

  agenda = new Agenda({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    mongo: mongoose.connection.db,
    defaultConcurrency: 1,
    maxConcurrency: 1,
    defaultLockLifetime: minutesToMilliseconds(60), // in milliseconds
  });

  //define jobs
  DefineCrawlerJob();

  await agenda.start();

  return agenda;
};
