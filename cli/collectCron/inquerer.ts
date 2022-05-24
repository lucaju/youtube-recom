import inquirer from 'inquirer';
import { dim, gray, red } from 'kleur';
import { MAX_VALUES } from '../../crawler';

export const Inquerer = async () => {
  const result = await inquirer.prompt([
    {
      type: 'input',
      name: 'keywords',
      message: `Keywords to search: ${gray('(separate by comma[,])')}\n`,
      validate: (input: string) => {
        if (input === '') return red('You must list at least one keyword!');
        return true;
      },
    },
    {
      type: 'number',
      name: 'seeds',
      message: `Number of seed videos from the search ${gray(`[1-${MAX_VALUES.seeds}]`)}`,
      default: 2,
      validate: (input: number) => {
        if (input > MAX_VALUES.seeds) return red(`Limited to ${MAX_VALUES.seeds} seed videos`);
        if (input < 1) return red(`At least 1 seed videos`);
        return true;
      },
    },
    {
      type: 'number',
      name: 'branches',
      message: `Number of recommendation branches to explores ${gray(
        `[1-${MAX_VALUES.branches}]`
      )}`,
      default: 2,
      validate: (input: number) => {
        if (input > MAX_VALUES.branches) return red(`Limited to ${MAX_VALUES.branches} branches`);
        if (input < 1) return red(`At least 1 branch`);
        return true;
      },
    },
    {
      type: 'number',
      name: 'depth',
      message: `The recommendation depth to explore ${gray(`[1-${MAX_VALUES.depth}]`)}`,
      default: 2,
      validate: (input: number) => {
        if (input > MAX_VALUES.depth) return red(`Limited to depth ${MAX_VALUES.depth}`);
        if (input < 1) return red(`At least depth 1`);
        return true;
      },
    },
    {
      type: 'input',
      name: 'language',
      message: `Limit by language. Use language code. ${dim('eg. "en-CA"')}`,
      suffix: ` ${gray('[optional]')}`,
    },
    {
      type: 'input',
      name: 'country',
      message: `Limit by country. Use contry code. ${dim('eg. "CA"')}`,
      suffix: ` ${gray('[optional]')}`,
    },
    {
      type: 'number',
      name: 'hour',
      message: `This script runs once a day. What time (hour) it should be scheduled? [0-23]`,
      validate: (input: number) => {
        if (isNaN(input)) return red(`Must be number between [0-23]`);
        if (input < 0 || input > 23) return red(`Must be between [0-23]`);
        return true;
      },
    },
    {
      type: 'input',
      name: 'timezone',
      message: `Specify the timezone for the execution. ${gray(
        `Check all timezones available at Luxon Timezone Website`
      )}.`,
      default: '',
      suffix: ` ${gray('[optional]')}`,
    },
    {
      type: 'checkbox',
      name: 'storage',
      message: `Store results on`,
      choices: [
        { name: 'file', value: 'onFile' },
        { name: 'mongoDB (config required)', value: 'useDB' },
      ],
      default: ['onFile'],
    },
    {
      type: 'list',
      name: 'loglevel',
      message: `The log level`,
      choices: ['verbose', 'results', 'silent'],
      default: 0,
    },
  ]);

  return result;
};
