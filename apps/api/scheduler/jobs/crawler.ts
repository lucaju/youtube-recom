import { ProjectDbModel } from '@/db/schemas/projects';
import { logger } from '@/server/logger';
import { Job } from '@whisthub/agenda';
import kleur from 'kleur';
import { Crawler, type CrawlerConfig } from 'youtube-recommendation-crawler';
import { agenda } from '..';
import { config } from '../../config';

export interface CrawlerJobData {
  projectId: string;
  keyword: string;
  crawlerConfig?: CrawlerConfig;
}

export const DefineCrawlerJob = () => {
  agenda.define('crawler', async (job: Job<CrawlerJobData>, done) => {
    const { projectId, keyword, crawlerConfig } = job.attrs.data;

    const project = await ProjectDbModel.findById(projectId);
    if (!project) {
      done();
      return;
    }

    if (await project.hasBeenCollectedOnTimeframe(keyword)) {
      logger.info(
        `Job ${kleur.cyan(job.attrs.name)}: ${kleur.magenta(project.title ?? project.id)} [keyword: ${keyword}] has already been colleted its scheduled time frame `,
      );
      done();
      return;
    }

    logger.info(
      `Job ${kleur.cyan(job.attrs.name)}: ${kleur.magenta(project.title ?? project.id)} started`,
    );

    const crawler = new Crawler(crawlerConfig, {
      delay: {
        seed: config.crawler.delay.seed,
        video: config.crawler.delay.video,
      },
      logLevel: 'INFO',
    });

    // crawler.on('start', ({ message }) => logger.info(message));
    // crawler.on('search', ({ message, data }) => logger.info(message, data));
    // crawler.on('delay', ({ message, data }) => logger.info(message, data));
    // crawler.on('scrape', ({ message, data }) => logger.info(message, data));
    // crawler.on('end', ({ message, data }) => logger.info(message, data));

    const data = await crawler.collect(keyword);

    await project.saveCollection(data);
    await project.notify(data);

    await crawler.dispose();

    done();
  });

  agenda.on('start:crawlProject', async (job) => {
    const data = job.attrs.data as CrawlerJobData;
    const project = await ProjectDbModel.findById(data.projectId);

    logger.info(
      `Job ${kleur.cyan(job.attrs.name)}: ${kleur.magenta(project?.title ?? data.projectId)} started`,
    );
  });

  agenda.on('complete:crawlProject', async (job) => {
    const data = job.attrs.data as CrawlerJobData;
    const project = await ProjectDbModel.findById(data.projectId);

    logger.info(
      `Job ${kleur.cyan(job.attrs.name)}: ${kleur.magenta(project?.title ?? data.projectId)} completed`,
    );
  });
};
