import { format } from 'date-fns';
import type { CrawlerResult, Video } from 'youtube-recommendation-crawler';

interface Props {
  date: Date;
  results: CrawlerResult[];
  title: string;
}

const TOP_VIDEOS = 5;

const numberFormat = new Intl.NumberFormat('en-CA', { notation: 'compact' });

export const composer = (content: Props) => {
  const email = `
  <!DOCTYPE html>
    ${composeHead()}
    ${composeBody(content)}
  </html>
  `;
  return email;
};

const composeHead = () => {
  const body = `
  <head style="margin: 24px; font-family: sans-serif">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="format-detection" content="telephone=no" />
    <style>
      a { color: #5c7cd2; text-decoration: none; }
    </style>
  </head>
`;

  return body;
};

const composeBody = ({ title, date, results }: Props) => {
  const body = `
  <div>
    <div style="margin-bottom: 60px">
      <h1>YouTube Recommendation Algorithm Project</h1>
      <h2>${title}</h2>
      <p>${format(date, 'dd LLL yyyy - HH:mm')}</p>
    </div>
    <div>
      ${results.map((result) => composeKeywordTable(result)).join('')}
    </div>
  </div>
`;

  return body;
};

const composeKeywordTable = ({ keyword, videos }: CrawlerResult) => {
  const moreVideos = videos.length - TOP_VIDEOS;
  return `
  <div style="margin-bottom: 60px">
		<h3>${keyword}</h3>
		<table style="width: 100%">
		  <thead style="text-align: left">
				<th>🏆</th>
				<th>🎈</th>
				<th>Title</th>
				<th>Views</th>
				<th>Likes</th>
				<th>Channel</th>
			</thead>
			<tbody>
        ${videos
          .slice(0, TOP_VIDEOS)
          .map((video, index) => composeVideoLine(video, index))
          .join('')}
			</tbody>
      ${
        moreVideos > 0
          ? `
      <tfoot>
        <td colspan="6" style="margin-top: 12px; font-size: 0.9rem; opacity: 0.7>and ${moreVideos} more</td>
      </tfoot>`
          : ''
      }
		</table>
	</div>
  `;
};

const composeVideoLine = (video: Video, index: number) => {
  const { channel, likes, crawlerResults, title, views, id } = video;

  return `
  <tr>
    <td style="text-align: center">${index + 1}</td>
    <td  style="text-align: right; padding-right: 25px">${crawlerResults?.recommended}</td>
    <td>
      <a href="https://www.youtube.com/watch?v=${id}">${title}</a>
    </td>
    <td>${views ? numberFormat.format(views) : ''}</td>
    <td>${likes ? numberFormat.format(likes) : ''}</td>
    <td>${channel?.name}</td>
  </tr>
  `;
};
