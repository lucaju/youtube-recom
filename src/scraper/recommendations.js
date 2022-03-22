const chalk = require('chalk');
const {watchPage} = require('../scraper/watch-page');

const recommendedVideos = [];

const getReccommendations = async videoCollection => {

	for (const video of videoCollection) {
		const videoInfo = await watchPage(video);
		recommendedVideos.push(videoInfo);
	}

	return;

};

module.exports = {
	getReccommendations,
};