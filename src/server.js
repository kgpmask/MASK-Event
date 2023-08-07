require('./env').init();

const childProcess = require('child_process');
const express = require('express');
const http = require('http');
const nunjucks = require('nunjucks');
const path = require('path');

global.Tools = require('./tools');
const PORT = process.env.PORT ?? 6970;
const initMiddleware = require('./middleware');
const router = require('./router');
const DB = require('../database/database');
const socketio = require('socket.io')();

global.app = express();
const waitForDB = PARAMS.mongoless ? Promise.resolve({}) : DB.init();

const nunjEnv = nunjucks.configure(path.join(__dirname, '../templates/'), {
	express: app,
	noCache: PARAMS.dev
});

initMiddleware(app);
router(app, nunjEnv);

const sass = childProcess.exec(`npx sass ./assets/styles --no-source-map --style=compressed ${PARAMS.dev ? '--watch' : ''}`);

const server = http.createServer(app);
server.listen(PORT, () => {
	if (!PARAMS.test) console.log(`The server is up at http://localhost:${PORT}/`);
});

global.io = socketio.listen(server);
require('./socket');

exports.ready = () => waitForDB;
exports.close = () => {
	server.close();
	DB.disconnect();
	sass.kill();
};
