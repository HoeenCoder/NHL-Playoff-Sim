'use strict';

const fs = require('fs');

global.toId = function (text) {
	if (text && text.id) {
		return text.id;
	}
	if (typeof text !== 'string' && typeof text !== 'number') return '';
	return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Load modules
if (!fs.existsSync('config/config.js')) {
	console.log('Configuration file not found, creating one with default settings...');
	fs.writeFileSync('config/config.js', fs.readFileSync('defaults/config.js'));
}
try {
	global.Config = require('./config/config.js');
} catch (e) {
	if (e.code !== 'ENOENT') throw e;
	// Revert to default
	global.Config = require('./defaults/config.js');
}
if (Config.updates < 1) Config.updates = 1;
if (Config.updates > 100) Config.updates = 100;
Config.updates = Math.floor(Config.updates);

global.Results = require('./defaults/teams.json');

if (!fs.existsSync('config/bracket.txt')) {
	console.log('Bracket not found, generating a new one with default settings...');
	fs.writeFileSync('config/bracket.txt', fs.readFileSync('defaults/bracket.txt'));
}
global.Bracket = require('./bracket-loader.js');

// Start simulation
require('./simulate.js');
