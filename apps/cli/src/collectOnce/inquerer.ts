import inquirer from 'inquirer';
import kleur from 'kleur';
import { MAX_VALUES, type ICrawlerConfig } from 'youtube-recommendation-crawler';

export interface InquererProps extends Omit<ICrawlerConfig, 'keywords'> {
  keywords: string;
  storage: 'onFile';
  loglevel:'verbose' | 'results' | 'silent';
}

export const Inquerer = async () => {
  const result = await inquirer.prompt<InquererProps>([
    {
      type: 'input',
      name: 'keywords',
      message: `Keywords to search: ${kleur.gray('(separate by comma[,])')}\n`,
      validate: (input: string) => {
        if (input === '') return kleur.red('You must list at least one keyword!');
        return true;
      },
    },
    {
      type: 'number',
      name: 'seeds',
      message: `Number of seed videos from the search ${kleur.gray(`[1-${MAX_VALUES.seeds}]`)}`,
      default: 2,
      validate: (input: number) => {
        if (input > MAX_VALUES.seeds)
          return kleur.red(`Limited to ${MAX_VALUES.seeds} seed videos`);
        if (input < 1) return kleur.red(`At least 1 seed videos`);
        return true;
      },
    },
    {
      type: 'number',
      name: 'branches',
      message: `Number of recommendation branches to explore ${kleur.gray(`[1-${MAX_VALUES.branches}]`)}`,
      default: 2,
      validate: (input: number) => {
        if (input > MAX_VALUES.branches) {
          return kleur.red(`Limited to ${MAX_VALUES.branches} branches`);
        }
        if (input < 1) return kleur.red(`At least 1 branch`);
        return true;
      },
    },
    {
      type: 'number',
      name: 'depth',
      message: `The recommendation depth to explore ${kleur.gray(`[1-${MAX_VALUES.depth}]`)}`,
      default: 2,
      validate: (input: number) => {
        if (input > MAX_VALUES.depth) return kleur.red(`Limited to depth ${MAX_VALUES.depth}`);
        if (input < 1) return kleur.red(`At least depth 1`);
        return true;
      },
    },
    {
      type: 'input',
      name: 'language',
      message: `Limit by language. Use language code. ${kleur.dim('eg. "en-CA"')}`,
      suffix: ` ${kleur.gray('[optional]')}`,
    },
    {
      type: 'input',
      name: 'country',
      message: `Limit by country. Use contry code. ${kleur.dim('eg. "CA"')}`,
      suffix: ` ${kleur.gray('[optional]')}`,
    },
    {
      type: 'checkbox',
      name: 'storage',
      message: `Store results on`,
      choices: [{ name: 'file', value: 'onFile' }],
      default: ['onFile'],
    },
    {
      type: 'list',
      name: 'loglevel',
      message: `The log level`,
      choices: ['verbose', 'results', 'silent'],
      default: 'silent',
    },
  ]);

  return result;
};
