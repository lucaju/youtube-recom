import log from 'loglevel';
export type LocalLogLevel = 'silent' | 'verbose' | 'result';

export const getLogLevelDesc = (level: LocalLogLevel) => {
  switch (level) {
    case 'silent':
      return log.levels.SILENT;
    case 'verbose':
      return log.levels.DEBUG;
    case 'result':
    default:
      return log.levels.INFO;
  }
};
