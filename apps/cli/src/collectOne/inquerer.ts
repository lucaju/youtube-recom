import inquirer from 'inquirer';
import kleur from 'kleur';

export interface InquererProps {
  id: string;
  loglevel: number | string;
}

export const Inquerer = async () => {
  const result = await inquirer.prompt<InquererProps>([
    {
      type: 'input',
      name: 'id',
      message: `YouTube Video ID: ${kleur.gray('(e.g., udSi-A98L-g)')}\n`,
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
