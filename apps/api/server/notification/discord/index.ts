import type { CrawlerResult } from 'youtube-recommendation-crawler';

export const sendToDiscord = async (projectTitle: string, result: CrawlerResult) => {
  const header = `# Crawler Results: ${projectTitle}\n`;
  const messages = formatMessage(result);
  const string = header + messages;

  await postMessage(string);

  //todo Send a file
  // await postMessage('file', results);
};

const formatMessage = (result: CrawlerResult) => {
  const header = `## Keyword: \`${result.keyword}\`
  *(top 5)*\n`;

  const items = result.videos.slice(0, 5).map(
    (video, index) =>
      `**${index + 1}**: [${video.title}](https://www.youtube.com/watch?v=${video.id})
:fire: \`${video.crawlerResults?.recommended ?? 1}\` | :thumbsup: \`${video.likes ?? 0}\` | :eyes: \`${video.views ?? 1}\``,
  );

  const string = header + items.join('\n');

  return string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postMessage = async (content: string, payload?: any) => {
  const url = process.env.DISCORD_WEBHOOK_URL;
  await fetch(`${url}?wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': payload ? 'multipart/form-data' : 'application/json' },
    body: JSON.stringify({
      content,
      flags: 1 << 2, // do not include any embeds when serializing this message
    }),
  });
};
