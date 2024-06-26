import { checkbox, input, select } from '@inquirer/prompts';
import kleur from 'kleur';
import { LogLevelDesc } from 'loglevel';
import type { Config } from './index.ts';
import { crawlerConfig } from '../../src/index.ts';

export const Inquerer = async () => {
  const result = {
    keywords: await input({
      message: `Keywords to search: ${kleur.gray('(separate by comma[,])')}\n`,
      validate: (input: string) => {
        if (input === '') return kleur.red('You must list at least one keyword!');
        return true;
      },
    }),
    seeds: await input({
      message: `Number of seed videos from the search ${kleur.gray(`[1-${crawlerConfig.seeds.max}]`)}`,
      default: '2',
      validate: (input: string) => {
        if (Number(input) > crawlerConfig.seeds.max) {
          return kleur.red(`Limited to ${crawlerConfig.seeds.max} seed videos`);
        }
        if (Number(input) < 1) return kleur.red(`At least 1 seed videos`);
        return true;
      },
    }),
    branches: await input({
      message: `Number of recommendation branches to explore ${kleur.gray(`[1-${crawlerConfig.branches.max}]`)}`,
      default: '2',
      validate: (input: string) => {
        if (Number(input) > crawlerConfig.branches.max) {
          return kleur.red(`Limited to ${crawlerConfig.branches.max} branches`);
        }
        if (Number(input) < 1) return kleur.red(`At least 1 branch`);
        return true;
      },
    }),
    depth: await input({
      message: `The recommendation depth to explore ${kleur.gray(`[1-${crawlerConfig.depth.max}]`)}`,
      default: '2',
      validate: (input: string) => {
        if (Number(input) > crawlerConfig.depth.max) {
          return kleur.red(`Limited to depth ${crawlerConfig.depth.max}}`);
        }
        if (Number(input) < 1) return kleur.red(`At least depth 1`);
        return true;
      },
    }),
    delayVideo: await input({
      message: 'Delay scraper for each video in seconds',
      default: '0',
      validate: (input: string) => {
        if (Number(input) < 0) return kleur.red(`Min: 0 seconds`);
        return true;
      },
    }),
    delaySeed: await input({
      message: 'Delay scraper for each seed video in seconds',
      default: '0',
      validate: (input: string) => {
        if (Number(input) < 0) return kleur.red(`Min: 0 seconds`);
        return true;
      },
    }),
    language: await input({
      message: `Limit by language. Use language code. ${kleur.dim('eg. "en-CA"')} ${kleur.gray('[optional]')}`,
    }),
    country: await input({
      message: `Limit by country. Use contry code. ${kleur.dim('eg. "CA"')} ${kleur.gray('[optional]')}`,
    }),
    storage: await checkbox({
      message: `Store results on`,
      choices: [{ name: 'file', value: 'onFile', checked: true }],
    }),
    loglevel: await select<LogLevelDesc>({
      message: `The log level`,
      choices: [
        { name: 'verbose', value: 'DEBUG' },
        { name: 'silent', value: 'SILENT' },
      ],
      default: 'results',
    }),
  };

  const config: Config = {
    keywords: result.keywords.split(','),
    seeds: Number(result.seeds),
    branches: Number(result.branches),
    depth: Number(result.depth),
    delay: {
      video: Number(result.delayVideo),
      seed: Number(result.delaySeed),
    },
    country: result.country,
    language: result.language,
    logLevel: result.loglevel,
  };

  return config;
};
