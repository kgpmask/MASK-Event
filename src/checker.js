exports.checkLive = function checkLive (answer, type, solution) {
	if (!Array.isArray(solution)) solution = [solution];
	if (!answer) return 0;
	switch (type) {
		case 'mcq':
			return answer === solution[0] ? 10 : 0;
		case 'text':
			return Math.max(...[...solution].map(sol => {
				return Tools.levenshtein(Tools.toID(answer), Tools.toID(sol)) < 5 ? 10 : 0;
			}));
		default:
			return answer === soution[0] && typeof answer === typeof solution[0] ? 10 : 0;
	}
};
