'use strict';

const fs = require('fs');

global.toId = function (text) {
	if (text && text.id) {
		return text.id;
	}
	if (typeof text !== 'string' && typeof text !== 'number') return '';
	return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

global.Teams = require('./defaults/teams.json');

function playGame(teamA, teamB) {
	if (!Teams[teamA] || !Teams[teamB]) throw new Error(`Missing team in ${teamA} VS ${teamB}!`);

	let scoreA = Math.round(Math.random() * 7), scoreB = Math.round(Math.random() * 7), ot = false, so = false;
	scoreA += Math.round(scoreA * season[teamA].skew);
	scoreB += Math.round(scoreB * season[teamB].skew);
	if (scoreA === scoreB) {
		// Overtime
		ot = true;
		if (Math.random() < 0.25) so = true; // Goes to shootout
		if (Math.random() < 0.5) {
			scoreA++;
		} else {
			scoreB++;
		}
	}
	if (scoreA > scoreB) {
		season[teamA].w++;
		season[teamB].l++;
		if (!so) season[teamA].row++;
		season[teamA].points += 2;
		if (ot) {
			season[teamB].points++;
			season[teamB].ot++;
		}
	} else {
		season[teamB].w++;
		season[teamA].l++;
		if (!so) season[teamB].row++;
		season[teamB].points += 2;
		if (ot) {
			season[teamA].points++;
			season[teamA].ot++;
		}
	}
	season[teamA].gp++;
	season[teamB].gp++;
	if (!season[teamA].vs[teamB]) season[teamA].vs[teamB] = 0;
	if (!season[teamB].vs[teamA]) season[teamB].vs[teamA] = 0;
	season[teamA].vs[teamB]++;
	season[teamB].vs[teamA]++;
}

let season = {};

console.log('Generating random bracket...');
for (let t in Teams) {
	let team = Teams[t];
	if (typeof team === 'string') continue;

	// Setup
	season[team.id] = {
		id: team.id,
		points: 0,
		w: 0,
		l: 0,
		ot: 0,
		row: 0,
		gp: 0,
		vs: {},
		skew: (Math.random() - 0.5) / 2,
		// Pacific divison teams need to play a team in their division 1 extra time
		extraGames: (team.div === 'cen' ? 2 : team.div === 'pac' ? 1 : 0),
	};
}

// Play
// Each team plays teams in their division 4 times, in the same conference but different division 3 times, and in the other conference twice.
let completedCentrals = 0;
for (let t in Teams) {
	let team = Teams[t];
	if (typeof team === 'string') continue;

	for (let f in Teams) {
		let foe = Teams[f];
		if (typeof foe === 'string') continue;
		if (foe.id === team.id) continue;
		let toPlay = 0;
		if (foe.conf !== team.conf) {
			toPlay = 2;
		} else if (foe.div !== team.div) {
			toPlay = 3;
		} else {
			toPlay = 4;
			if (team.conf === 'west' && foe.conf === 'west' && season[team.id].extraGames > 0 && season[foe.id].extraGames > 0) {
				if (team.div === 'pac' || (team.div === 'cen' && (season[foe.id].extraGames === 2 || completedCentrals >= 5))) {
					toPlay++;
					season[team.id].extraGames--;
					season[foe.id].extraGames--;
				}
			}
		}
		if (season[team.id].vs[foe.id]) toPlay -= season[team.id].vs[foe.id];
		for (toPlay; toPlay > 0; toPlay--) {
			playGame(team.id, foe.id);
		}
	}
	if (season[team.id].gp !== 82 || (season[team.id].w + season[team.id].l) !== 82) {
		console.log(team.id);
		console.log(season[team.id]);
		throw new Error('Bad bracket generation.');
	}
	if (team.div === 'cen') completedCentrals++;
}

// Write bracket
let keys = Object.keys(season).sort((a, b) => {
	let teamA = season[a];
	let teamB = season[b];
	if (teamA.points !== teamB.points) return teamB.points - teamA.points;
	// Tiebreaker
	if (teamA.row !== teamB.row) return teamB.row - teamA.row;
	return 0;
});

let output = `# Randomly Generated Bracket\n\n# Regular Season Standings\n# #. Team Name GP Pts W L OT ROW IN/OUT\n`;
let pos = 1;
let atl = [], met = [], cen = [], pac = [], ewc = [], wwc = [];

for (let t in keys) {
	let team = season[keys[t]];
	output += `# ${pos}. ${Teams[keys[t]].name} ${team.gp} ${team.points} ${team.w} ${team.l} ${team.ot} ${team.row}`;
	pos++;
	let inPlayoffs = false;
	switch (Teams[team.id].div) {
	case 'atl':
		if (atl.length < 3) {
			atl.push(team.id);
			inPlayoffs = true;
		}
		break;
	case 'met':
		if (met.length < 3) {
			met.push(team.id);
			inPlayoffs = true;
		}
		break;
	case 'cen':
		if (cen.length < 3) {
			cen.push(team.id);
			inPlayoffs = true;
		}
		break;
	case 'pac':
		if (pac.length < 3) {
			pac.push(team.id);
			inPlayoffs = true;
		}
		break;
	}
	if (!inPlayoffs) {
		if (Teams[team.id].conf === 'east') {
			if (ewc.length < 2) {
				ewc.push(team.id);
				inPlayoffs = true;
			}
		} else {
			if (wwc.length < 2) {
				wwc.push(team.id);
				inPlayoffs = true;
			}
		}
	}
	if (inPlayoffs) {
		output += ` IN\n`;
	} else {
		output += ` OUT\n`;
	}
}

output += `\n# Playoff Bracket\n`;
for (let i = 0; i < atl.length; i++) {
	output += `A${(i + 1)}: ${Teams[atl[i]].name}, ${season[atl[i]].points}, ${season[atl[i]].w}, ${season[atl[i]].row}\n`;
}
for (let i = 0; i < met.length; i++) {
	output += `M${(i + 1)}: ${Teams[met[i]].name}, ${season[met[i]].points}, ${season[met[i]].w}, ${season[met[i]].row}\n`;
}
for (let i = 0; i < ewc.length; i++) {
	output += `EWC${(i + 1)}: ${Teams[ewc[i]].name}, ${season[ewc[i]].points}, ${season[ewc[i]].w}, ${season[ewc[i]].row}\n`;
}
output += `\n`;
for (let i = 0; i < cen.length; i++) {
	output += `C${(i + 1)}: ${Teams[cen[i]].name}, ${season[cen[i]].points}, ${season[cen[i]].w}, ${season[cen[i]].row}\n`;
}
for (let i = 0; i < pac.length; i++) {
	output += `P${(i + 1)}: ${Teams[pac[i]].name}, ${season[pac[i]].points}, ${season[pac[i]].w}, ${season[pac[i]].row}\n`;
}
for (let i = 0; i < wwc.length; i++) {
	output += `WWC${(i + 1)}: ${Teams[wwc[i]].name}, ${season[wwc[i]].points}, ${season[wwc[i]].w}, ${season[wwc[i]].row}\n`;
}

fs.writeFileSync(`config/bracket.txt`, output, {encoding: 'utf-8'});
console.log('Done! Check config/bracket.txt for the results.');
