import { disposeBrowser, getBrowser } from './components';
import { watchPage } from './pages';

export const scrapeVideo = async (id: string) => {
  await getBrowser();
  const videoInfo = await watchPage(id);
  await disposeBrowser();
  return videoInfo;
};
