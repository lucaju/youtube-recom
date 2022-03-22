const chalk = require('chalk');
const {getBrowser} = require('../puppeteer/puppeteer');

const config = require('../config/config.json');

let browser;

const searchResults = async query => {

	console.log(chalk.keyword('royalblue')(`\nSearching for ${query}`));
	const url = `https://www.youtube.com/results?sp=${sortBy()}&&search_query=${query}`;

	browser = await getBrowser();
	const page = await browser.newPage();


	// enable request interception
	await page.setRequestInterception(true);
	// add header for the navigation requests
	page.on('request', request => {
		// Do nothing in case of non-navigation requests.
		if (!request.isNavigationRequest()) {
			request.continue();
			return;
		}
		// Add a new header for navigation request.
		const headers = request.headers();
		headers['Accept-Language'] = config.language;
		request.continue({
			headers
		});
	});
	

	// navigate to the website
	await page.goto(url);

	await page.waitFor('ytd-section-list-renderer');

	let items = await page.$$('ytd-video-renderer');

	const maxSearches = (config.searches <= 10) ? config.searches : 10;
	items = items.slice(0,maxSearches);

	const videos = [];
	let position = 1;

	for (const item of items) {


		const title = await item.$eval('h3 > a', content => content.innerText);
		const link = await item.$eval('h3 > a', content => content.getAttribute('href'));
		const id = link.split('=')[1];

		const channelName = await item.$eval('#byline-inner-container a', content => content.innerText);
		const channelLink = await item.$eval('#byline-inner-container a', content => content.getAttribute('href'));
		const channelType = channelLink.split('/')[1];
		const channelID = channelLink.split('/')[2];


		videos.push({
			id,
			title,
			link,
			channel: {
				id: channelID,
				name: channelName,
				link: channelLink,
				type: channelType
			},
			position,
			collectionType: 'search',
			collectedAt: new Date()
		});

		position++;
		
	}

	return videos;

};

const sortBy = value => {
	if (value == 'top_rated') {
		console.log('Sorting search results by rating');
		return 'CAMSAhAB';
	}
	if (value == 'view_count') {
		console.log('Sorting search results by number of views');
		return 'CAE%253D';
	}
	console.log('Sorting search results by relevance');
	return 'EgIQAQ%253D%253D'; //videos only && relecance
};

module.exports = {
	searchResults,
};