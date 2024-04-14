import { disposeBrowser, getBrowser } from './components/index.ts';
import { watchPage } from './pages/index.ts';
import { Video } from './types/index.ts';

export const scrapeVideo = async (id: string): Promise<Video> => {
  await getBrowser();
  const videoInfo = await watchPage(id);
  await disposeBrowser();
  return videoInfo;
};
