import { scheduleFrequencies, type ProjectSchedule } from '@/types/project';
import { Schema } from 'mongoose';

const hourRegexp = new RegExp(/^(?:\d|[01]\d|2[0-3]):[0-5]\d$/);

export const ProjectScheduleDbSchema = new Schema<ProjectSchedule>(
  {
    time: { type: String, trim: true, match: hourRegexp },
    frequency: { type: String, trim: true, enum: scheduleFrequencies, default: 'once' },
    timezone: { type: String, trim: true },
  },
  { _id: false },
);

// // Set the date to "2018-09-01T16:01:36.386Z"
// const utcDate = zonedTimeToUtc("2018-09-01 18:01:36.386", "Europe/Berlin");

// // Obtain a Date instance that will render the equivalent Berlin time for the UTC date
// const date = new Date("2018-09-01T16:01:36.386Z");
// const timeZone = "Europe/Berlin";
// const zonedDate = utcToZonedTime(date, timeZone);
// // zonedDate could be used to initialize a date picker or display the formatted local date/time

// // Set the output to "1.9.2018 18:01:36.386 GMT+02:00 (CEST)"
// const pattern = "d.M.yyyy HH:mm:ss.SSS 'GMT' XXX (z)";
// const output = format(zonedDate, pattern, { timeZone: "Europe/Berlin" });
