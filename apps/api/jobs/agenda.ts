import { Agenda } from 'agenda';
import mongoose from 'mongoose';
import { DefineCrawlerJob } from './crawler';

export let agenda: Agenda;

export const connectAgenda = async () => {
  if (agenda) return agenda;

  agenda = new Agenda({
    //@ts-ignore
    mongo: mongoose.connection.db,
    defaultConcurrency: 1,
    maxConcurrency: 5,
  });

  //define jobs
  DefineCrawlerJob(agenda);

  await agenda.start();

  return agenda;
};
