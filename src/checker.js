exports.checkLive = function checkLive (answer, type, solution) {
	if (!Array.isArray(solution)) solution = [solution];
	if (!answer) return 0;
	switch (type) {
		case 'number':
			if (~~answer === ~~solution[0]) return 10;
		case 'mcq':
			if (answer === solution[0]) return 10;
		case 'text':
			return Math.max([...solution].forEach(sol => {
				return Tools.levenshtein(Tools.toID(answer), Tools.toID(sol)) > 5 ? 10 : 0;
			}));
	}
};
