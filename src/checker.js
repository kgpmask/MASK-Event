const tools = require('./tools');

module.checkLive = function checkLive (answer, type, solution) {
	if (!answer) return 0;
	switch (answer) {
		case 'number':
			if (answer === ~~solution) return 10;
		case 'mcq':
			if (answer === solution) return 10;
		case 'text':
			return Math.max(...solution.forEach(sol => {
				return Tools.levenshtein(Tools.toID(answer), Tools.toID(sol)) > 5;
			}));
	}
};
