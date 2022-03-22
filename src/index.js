/*
Author: Luciano Frizzera
Inspired by Guillaume Chaslot
*/

/*
This scripts starts from a search query on youtube and:
	1) gets the N first search results
	2) follows the first M recommendations
	3) repeats step (2) P times
	4) stores the results in a json file
*/


//Imports
require('dotenv').config();
const chalk = require('chalk');

// const mongoose = require('./src/db/mongoose');
const pupeteer = require('./puppeteer/puppeteer');
const {searchResults} = require('./scraper/search-page');
const {getReccommendations} = require('./scraper/recommendations');

const config = require('./config/config.json');

// const RECOMMENDATIONS_PER_VIDEO = 1;
// const RESULTS_PER_SEARCH = 1;

// NUMBER OF MIN LIKES ON A VIDEO TO COMPUTE A LIKE RATIO
// const MIN_LIKES_FOR_LIKE_RATIO = 5;


const run = async () => {

	const date = new Date();
	console.log(chalk.blue(`Scraping Youtube Recommendations: ${date}\n`));

	await pupeteer.launch();

	console.log(chalk.white('Queries:'));
	console.log(chalk.keyword('royalblue')(config.query));

	// if (await mongoose.connect()) await scrape();
	
   
	for (const query of config.query) {

		const searchCollection = await searchResults(query);
		const reccommendations = await getReccommendations(searchCollection);
		console.log(reccommendations);
		// if (collection) await addRanking(target,collection);
	}


	//send log email
	// await sendEmail();

	//done
	// await pupeteer.close();
	// mongoose.close();
	console.log(chalk.blue('\nDone'));

};


run();