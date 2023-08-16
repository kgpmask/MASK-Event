const checker = require('../src/checker.js');
const dbh = require('../database/handler');

exports.check = async function check (responses, type, solution) {
	Object.entries(responses).map(async (userId, response) => {
		const points = checker.checkLive(response, type, solution);
		if (points) return await dbh.updateLiveResult(userId, points);
	});
};
