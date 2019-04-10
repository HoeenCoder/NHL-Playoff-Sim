'use strict';

const fs = require('fs');
let lines = fs.readFileSync('./config/bracket.txt', {encoding: 'utf-8'}).split('\n');

const bracket = {
	A1: '',
	A2: '',
	A3: '',
	M1: '',
	M2: '',
	M3: '',
	EWC1: '',
	EWC2: '',

	C1: '',
	C2: '',
	C3: '',
	P1: '',
	P2: '',
	P3: '',
	WWC1: '',
	WWC2: '',
};

for (let i = 0; i < lines.length; i++) {
	let line = lines[i];

	if (line.substring(0, 1) === '#') continue;
	if (!toId(line)) continue;

	let [seed, rest] = line.split(':');
	seed = seed.trim().toUpperCase();
	if (!['A1', 'A2', 'A3', 'M1', 'M2', 'M3', 'C1', 'C2', 'C3', 'P1', 'P2', 'P3', 'EWC1', 'EWC2', 'WWC1', 'WWC2'].includes(seed)) {
		throw new Error(`Invalid seed: ${seed}, line: ${line}`);
	}
	let [id, points, wins, row] = rest.split(',').map((x, idx) => {
		if (idx === 0) {
			return toId(x);
		} else {
			return Number(x.trim());
		}
	});

	if (!Results[id]) throw new Error(`Unable to find team "${id}" on line ${line}`);
	if (isNaN(points)) throw new Error(`Invalid points on line: ${line}`);
	Results[id].points = points;
	if (isNaN(wins)) throw new Error(`Invalid wins on line: ${line}`);
	Results[id].w = wins;
	if (isNaN(row)) throw new Error(`Invalid ROW on line: ${line}`);
	Results[id].row = row;
	Results[id].in = true;
	
	bracket[seed] = id;
}

for (let key in bracket) {
	if (!bracket[key]) throw new Error(`Incomplete bracket provided! Missing a team in slot: ${key}!`);
}

module.exports = bracket;
