const chalk = require('chalk');
const puppeteer = require('puppeteer');

//lunch puppeteer
let browser;

const launch = async () => {
	
	browser = await puppeteer.launch({
		headless: false,
		defaultViewport: {
			width: 1200,
			height: 1200
		},
	});

	console.log(chalk.gray('Puppeteer Launched'));

	return browser;
};

const getBrowser = async () => {
	if (!browser) await launch();
	return browser;
};

const getPage = async () => {
	if (!browser) await launch();
	const page = await browser.newPage();
	return page;
};

const close = async () => {
	await browser.close();
};

module.exports = {
	launch,
	getBrowser,
	getPage,
	close
};