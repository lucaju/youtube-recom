import loglevel from 'loglevel';

export const log = loglevel.getLogger('api');
log.setDefaultLevel(process.env.NODE_ENV === 'production' ? 'WARN' : 'DEBUG');

//REFERENCE FRON logLevel
// interface LogLevel {
//   TRACE: 0;
//   DEBUG: 1;
//   INFO: 2;
//   WARN: 3;
//   ERROR: 4;
//   SILENT: 5;
// }
