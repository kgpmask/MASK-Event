exports.checkLive = function checkLive (answer, type, solution) {
	if (!Array.isArray(solution)) solution = [solution];
	if (!answer) return 0;
	switch (type) {
		case 'mcq':
			return answer === solution[0] ? 100 : 0;
		case 'text':
			return Math.max(...[...solution].map(sol => {
				const distance = Tools.levenshtein(Tools.toID(answer), Tools.toID(sol));
				const error = distance / sol.length;
				if (!error) return 200;
				else if (error <= 0.2) return 150;
				else if (error <= 0.4) return 100;
				else return 0;
			}));
		default:
			return answer === solution[0] && typeof answer === typeof solution[0] ? 10 : 0;
	}
};
