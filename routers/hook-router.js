const router = require('express').Router();

const crypto = require('crypto');

router.post('/', async (req, res) => {
	// Console log git hook requests
	console.log(`git-hook request sent at: ${new Date()}`);
	const pushBranch = req.body.ref.split('/')[2];
	console.log(`\tRef branch: ${pushBranch}\n\tHead commit: ${req.body.head_commit?.message}`);
	// Validate secret
	const secret = process.env.WEBHOOK_SECRET;
	if (!secret) return res.send('Disabled due to no webhook secret being configured');
	const sigHeader = 'X-Hub-Signature-256';
	const signature = Buffer.from(req.get(sigHeader) || '', 'utf8');
	const payload = JSON.stringify(req.body);
	const hmac = crypto.createHmac('sha256', secret);
	const digest = Buffer.from('sha256=' + hmac.update(payload).digest('hex'), 'utf8');
	if (signature.length !== digest.length || !crypto.timingSafeEqual(digest, signature)) {
		return res.error(new Error(`Request body digest (${digest}) did not match ${sigHeader} (${signature})`));
	}
	// Hook time
	const branch = process.env.WEBHOOK_BRANCH ?? 'main';
	if (branch !== pushBranch) {
		console.log('Not for this server.');
		return res.send('This hook is not for this server.');
	}
	res.send('Hook received. Starting code update.');
	try {
		await new Promise(async (resolve, reject) => {
			const updateTimeout = setTimeout(() => reject('Time out'), 75_000);
			await Tools.updateCode();
			clearTimeout(updateTimeout);
			return resolve('Successfully updated');
		});
		console.log('Code updated. Restarting.');
		return process.exit(0);
	} catch (err) {
		console.log(`updateCode failed\n\tReason: ${err.message}`);
	}
});

module.exports = {
	route: '/git-hook',
	router
};
