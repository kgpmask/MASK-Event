const checker = require('../src/checker.js');
const dbh = require('../database/handler');

exports.check = async function check (responses, type, solution) {
	Object.entries(responses).map(async ([userId, answer] = response) => {
		const points = checker.checkLive(answer, type, solution);
		if (points) return await dbh.updateLiveResult(userId, points);
	});
};
