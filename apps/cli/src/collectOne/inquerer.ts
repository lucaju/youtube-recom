import { input, select } from '@inquirer/prompts';
import kleur from 'kleur';
import type { LocalLogLevel } from '../util';

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
    loglevel: await select<LocalLogLevel>({
      message: `The log level`,
      choices: [
        { name: 'verbose', value: 'verbose' },
        { name: 'result', value: 'result' },
        { name: 'silent', value: 'silent' },
      ],
      default: 'results',
    }),
  };

  return result;
};
