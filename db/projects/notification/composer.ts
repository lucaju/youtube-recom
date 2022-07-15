import { DateTime } from 'luxon';
import type { ICrawlerResult } from '../../../crawler';
import { IVideo } from '../../../crawler';

interface IComposeContent {
  title: string;
  date: DateTime;
  results: ICrawlerResult[];
}

const TOP_VIDEOS = 5;

const nf = new Intl.NumberFormat('en-CA', { notation: 'compact' });

export const composer = (content: IComposeContent) => {
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
  <head>
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

const composeBody = ({ title, date, results }: IComposeContent) => {
  const body = `
  <div>
    <div>
      <h1>YouTube Recommendation Algorithm Project</h1>
      <h2>${title}</h2>
      <p>${date.toFormat('dd LLL yyyy - HH:mm')}</p>
    </div>
    <div>
      ${results.map((result: any) => composeKeywordTable(result)).join('')}
    </div>
  </div>
`;

  return body;
};

const composeKeywordTable = ({ keyword, videos }: ICrawlerResult) => {
  const moreVideos = videos.length - TOP_VIDEOS;
  return `
  <div>
		<h3>${keyword}</h3>
		<table>
		  <thead>
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
      ${moreVideos > 0 ? `<tfoot><td>and ${moreVideos} more</td></tfoot>` : ''}
		</table>
	</div>
  `;
};

const composeVideoLine = (video: IVideo, index: number) => {
  const { channel, likes, recommended, title, views, ytId } = video;
  return `
  <tr>
    <td>${index + 1}</td>
    <td>${recommended}</td>
    <td>
      <a href="https://www.youtube.com/watch?v=${ytId}">${title}</a>
    </td>
    <td>${views ? nf.format(views) : ''}</td>
    <td>${likes ? nf.format(likes) : ''}</td>
    <td>${channel?.name}</td>
  </tr>
  `;
};
