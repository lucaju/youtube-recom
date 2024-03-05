import loglevel from 'loglevel';

export const log = loglevel.getLogger('cli');
log.setDefaultLevel('INFO');

//REFERENCE FRON logLevel
// interface LogLevel {
//   TRACE: 0;
//   DEBUG: 1;
//   INFO: 2;
//   WARN: 3;
//   ERROR: 4;
//   SILENT: 5;
// }
