import { input, select } from '@inquirer/prompts';
import kleur from 'kleur';
import { LogLevelDesc } from 'loglevel';

export interface InquererProps {
  id: string;
  loglevel: number | string;
}

export const Inquerer = async () => {
  const result = {
    id: await input({
      message: `YouTube Video ID: ${kleur.gray('(e.g., udSi-A98L-g)')}\n`,
      validate: (input: string) => input !== '',
    }),
    loglevel: await select<LogLevelDesc>({
      message: `The log level`,
      choices: [
        { name: 'verbose', value: 'DEBUG' },
        { name: 'silent', value: 'SILENT' },
      ],
      default: 'verbose',
    }),
  };

  return result;
};
