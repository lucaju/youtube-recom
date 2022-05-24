import inquirer from 'inquirer';
import { gray } from 'kleur';

export const Inquerer = async () => {
  const result = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: `YouTube Video ID: ${gray('(e.g., udSi-A98L-g)')}\n`,
      validate: (input) => input !== '',
    },
    {
      type: 'list',
      name: 'loglevel',
      message: `The log level`,
      choices: ['verbose', 'results', 'silent'],
      default: 1,
    },
  ]);

  return result;
};
