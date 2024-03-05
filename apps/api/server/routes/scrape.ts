import { contract } from '@/contract';
import { auth } from '@/server/middleware/auth';
import { initServer } from '@ts-rest/express';
import { scrapeVideo } from 'youtube-recommendation-crawler';

const s = initServer();

export const routerScrape = s.router(contract.scrape, {
  video: {
    middleware: [auth('bearerJWT')],
    handler: async ({ params, req: { currentUser } }) => {
      if (!currentUser) {
        return { status: 401, body: { message: 'Unauthorized' } };
      }
      const video = await scrapeVideo(params.id);
      return { status: 200, body: video };
    },
  },
});
