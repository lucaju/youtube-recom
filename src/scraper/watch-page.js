const chalk = require('chalk');
const {getBrowser} = require('../puppeteer/puppeteer');

const config = require('../config/config.json');

let browser;

const watchPage = async ({id}) => {

	console.log(chalk.keyword('royalblue')(`\nGetting data from ${id}`));
	const url = `https://www.youtube.com/watch?v=${id}`;

	browser = await getBrowser();
	const page = await browser.newPage();
	
	// // navigate to the website
	await page.goto(url);

	await page.waitFor('#columns');

	// const primaryColumn= page.$('#columns > #primary')

	const title = await page.$eval('h1.title', content => content.innerText);
	const hastags = await page.$$eval('.super-title > a', content => content.map(n => n.innerText));
	let views = await page.$eval('yt-view-count-renderer > span.view-count', content => content.innerText);
	views = views.split(' ')[0];
	views = parseFloat(views.replace(/,/g, ''));

	let likes = await page.$eval('ytd-menu-renderer > div#top-level-buttons > ytd-toggle-button-renderer:nth-child(1) yt-formatted-string', content => content.getAttribute('aria-label'));
	likes = likes.split(' ')[0];
	likes = parseFloat(likes.replace(/,/g, ''));

	let dislikes = await page.$eval('ytd-menu-renderer > div#top-level-buttons > ytd-toggle-button-renderer:nth-child(2) yt-formatted-string', content => content.getAttribute('aria-label'));
	dislikes = dislikes.split(' ')[0];
	dislikes = parseFloat(dislikes.replace(/,/g, ''));

	const channel = await page.$eval('div#owner-container', content => content.innerText);

	let publishedAt = await page.$eval('div#upload-info > span.date', content => content.innerText);
	publishedAt = publishedAt.split('Published on ')[1];
	publishedAt = new Date(publishedAt);

	const description = await page.$eval('div#description:first-child', content => content.innerHTML);

	await page.waitFor('#comments ytd-comments-header-renderer');

	const comments = await page.$eval('#comments', content => content.innerHTML);

	console.log(comments);


	//via Script on the page
	// const executionContext = await page.mainFrame().executionContext();
	// const ytdata = await executionContext.evaluate(() => window['ytInitialData']);
	// const pageData = ytdata.contents.twoColumnWatchNextResults;
	// const contents = pageData.results.results.contents;
	// const primaryInfo = contents[0].videoPrimaryInfoRenderer;
	// const secondaryInfo = contents[1].videoSecondaryInfoRenderer;

	// const _title = primaryInfo.title.runs[0].text;
	// let _views = primaryInfo.viewCount.videoViewCountRenderer.viewCount.simpleText;
	// _views = _views.split(' ')[0];
	// _views = parseFloat(_views.replace(/,/g, ''));
	

	// let _subscribers = secondaryInfo.owner.videoOwnerRenderer.subscriberCountText.runs[0].text;
	// console.log(_views);




	// 	videos.push({
	// 		id,
	// 		title,
	// 		link,
	// 		channel: {
	// 			id: channelID,
	// 			name: channelName,
	// 			link: channelLink,
	// 			type: channelType
	// 		},
	// 		position,
	// 		collectionType: 'search',
	// 		collectedAt: new Date()
	// 	});

	// 	position++;
		


	// return videos;

};

module.exports = {
	watchPage,
};