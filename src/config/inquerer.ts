import inquirer from 'inquirer';
import { dim, gray, red } from 'kleur';
import { defaults } from './index';

export const Inquerer = async () => {
  const result = await inquirer.prompt([
    {
      type: 'input',
      name: 'queries',
      message: `Keywords to search: \n${gray('(separate by comma[,])')}\n`,
      validate: (input: string) => {
        if (input === '') return red('You must list at least one keyword!');
        return true;
      },
    },
    {
      type: 'number',
      name: 'searches',
      message: `Number of seed videos from the search ${gray(`[1-${defaults.maxSearches}]`)}`,
      default: defaults.searches,
      validate: (input: number) => {
        if (input > defaults.maxSearches) {
          return red(`Limited to ${defaults.maxSearches} seed videos`);
        }
        if (input < 1) return red(`At least 1 seed videos`);
        return true;
      },
    },
    {
      type: 'number',
      name: 'branch',
      message: `Number of recommendation branches to explores ${gray(`[1-${defaults.maxBranch}]`)}`,
      default: defaults.branch,
      validate: (input: number) => {
        if (input > defaults.maxBranch) return red(`Limited to ${defaults.maxBranch} branches`);
        if (input < 1) return red(`At least 1 branch`);
        return true;
      },
    },
    {
      type: 'number',
      name: 'depth',
      message: `The recommendation depth to explore ${gray(`[1-${defaults.maxDepth}]`)}`,
      default: defaults.depth,
      validate: (input: number) => {
        if (input > defaults.maxDepth) return red(`Limited to depth ${defaults.maxDepth}`);
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
      name: 'gl',
      message: `Limit by country. Use contry code. ${dim('eg. "CA"')}`,
      suffix: ` ${gray('[optional]')}`,
    },
  ]);

  return result;
};
