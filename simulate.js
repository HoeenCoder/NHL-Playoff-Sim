'use strict';

const fs = require('fs');

// teamA, teamB are team ID's. round is r1, r2, r3, or r4
function playSeries(teamA, teamB, round) {
	if (!Results[teamA] || !Results[teamB]) throw new Error(`Missing team in ${teamA} VS ${teamB}!`);

	let scoreA = 0, scoreB = 0;
	let cap = Math.ceil(Config.bestOf / 2);
	let skew = 0;
	if (!Config.evenOdds) {
		let aRate = Results[teamA].w / 82;
		let bRate = Results[teamB].w / 82;
		if (aRate >= 1) aRate = 0.99999;
		if (bRate >= 1) bRate = 0.99999;
		skew = aRate - bRate;
	}

	while (scoreA < cap && scoreB < cap) {
		if (Math.random() < (0.5 + skew)) {
			scoreA++;
		} else {
			scoreB++;
		}
	}
	if (scoreA > scoreB) {
		Results[teamB].overallLosses++;
		Results[teamB][round].overall++;
		if (!Results[teamB][round][teamA]) Results[teamB][round][teamA] = 0;
		Results[teamB][round][teamA]++;
		if (round === 'r4') Results[teamA].wins++;
		return teamA;
	} else {
		Results[teamA].overallLosses++;
		Results[teamA][round].overall++;
		if (!Results[teamA][round][teamB]) Results[teamA][round][teamB] = 0;
		Results[teamA][round][teamB]++;
		if (round === 'r4') Results[teamB].wins++;
		return teamB;
	}
}

// Simulate
console.log('Starting Simulation...');
let nextCheck = Config.updates;
for (let i = 1; i <= Config.simulations; i++) {
	// TODO skew based on w/l/ot
	const r2 = {
		A1: '', // A1 VS EWC
		A2: '', // A2 VS A3
		M1: '', // M1 VS EWC
		M2: '', // M2 VS M3

		C1: '', // C1 VS WWC
		C2: '', // C2 VS C3
		P1: '', // P1 VS WWC
		P2: '', // P2 VS P3
	};
	
	// Determine Wild Card Matchups
	if (Results[Bracket['A1']].points > Results[Bracket['M1']].points) {
		r2['A1'] = playSeries(Bracket['A1'], Bracket['EWC2'], 'r1');
		r2['M1'] = playSeries(Bracket['M1'], Bracket['EWC1'], 'r1');
	} else if (Results[Bracket['M1']].points > Results[Bracket['A1']].points) {
		r2['A1'] = playSeries(Bracket['A1'], Bracket['EWC1'], 'r1');
		r2['M1'] = playSeries(Bracket['M1'], Bracket['EWC2'], 'r1');
	} else {
		// Tiebreaker - Higher ROW faces EWC2
		if (Results[Bracket['A1']].row > Results[Bracket['M1']].row) {
			r2['A1'] = playSeries(Bracket['A1'], Bracket['EWC2'], 'r1');
			r2['M1'] = playSeries(Bracket['M1'], Bracket['EWC1'], 'r1');
		} else {
			r2['A1'] = playSeries(Bracket['A1'], Bracket['EWC1'], 'r1');
			r2['M1'] = playSeries(Bracket['M1'], Bracket['EWC2'], 'r1');
		}
	}

	if (Results[Bracket['C1']].points > Results[Bracket['P1']].points) {
		r2['C1'] = playSeries(Bracket['C1'], Bracket['WWC2'], 'r1');
		r2['P1'] = playSeries(Bracket['P1'], Bracket['WWC1'], 'r1');
	} else if (Results[Bracket['P1']].points > Results[Bracket['C1']].points) {
		r2['C1'] = playSeries(Bracket['C1'], Bracket['WWC1'], 'r1');
		r2['P1'] = playSeries(Bracket['P1'], Bracket['WWC2'], 'r1');
	} else {
		// Tiebreaker - Higher ROW faces WWC2
		if (Results[Bracket['C1']].row > Results[Bracket['P1']].row) {
			r2['C1'] = playSeries(Bracket['C1'], Bracket['WWC2'], 'r1');
			r2['P1'] = playSeries(Bracket['P1'], Bracket['WWC1'], 'r1');
		} else {
			r2['C1'] = playSeries(Bracket['C1'], Bracket['WWC1'], 'r1');
			r2['P1'] = playSeries(Bracket['P1'], Bracket['WWC2'], 'r1');
		}
	}

	// In-Division Matchups
	r2['A2'] = playSeries(Bracket['A2'], Bracket['A3'], 'r1');
	r2['M2'] = playSeries(Bracket['M2'], Bracket['M3'], 'r1');
	r2['C2'] = playSeries(Bracket['C2'], Bracket['C3'], 'r1');
	r2['P2'] = playSeries(Bracket['P2'], Bracket['P3'], 'r1');

	// Round 2
	const r3 = {
		A1: '', // A1 VS A2
		M1: '', // M1 VS M2

		C1: '', // C1 VS C2
		P1: '', // P1 VS P2
	};

	r3['A1'] = playSeries(r2['A1'], r2['A2'], 'r2');
	r3['M1'] = playSeries(r2['M1'], r2['M2'], 'r2');
	r3['C1'] = playSeries(r2['C1'], r2['C2'], 'r2');
	r3['P1'] = playSeries(r2['P1'], r2['P2'], 'r2');

	// Conference Finals
	const r4 = {
		E: '', // A1 VS M1
		W: '', // C1 VS P1
	};

	r4['E'] = playSeries(r3['A1'], r3['M1'], 'r3');
	r4['W'] = playSeries(r3['C1'], r3['P1'], 'r3');

	// Stanley Cup Final
	playSeries(r4['E'], r4['W'], 'r4');

	if (Config.simulations * (nextCheck / 100) === i) {
		console.log(`${nextCheck}% complete...`);
		nextCheck += Config.updates;
	}
}

// Write output
let keys = Object.keys(Results).sort((a, b) => {
	a = Results[a];
	b = Results[b];
	// Aliasses - to bottom
	if (typeof a === 'string' && typeof b !== 'string') return 1;
	if (typeof a !== 'string' && typeof b === 'string') return -1;
	if (typeof a === 'string' && typeof b === 'string') return 0;
	if (!a.in && b.in) return 1;
	if (a.in && !b.in) return -1;
	if (!a.in && !b.in) return 0;
	// More wins = higher
	return b.wins - a.wins;
});

let output = `--Stanley Cup Playoffs Simulation--\nRan ${Config.simulations} times using a Best of ${Config.bestOf} format and ${Config.evenOdds ? '50/50' : 'Skewed'} odds and got these results:\n\n`;
let count = 0;
for (let t = 0; t < keys.length; t++) {
	let team = Results[keys[t]];
	if (typeof team === 'string') continue;
	output += `====================\n${team.name}\nWins: ${team.wins}\nOverall Losses: ${team.overallLosses}\n% of Winning Runs: ${parseFloat((team.wins / Config.simulations).toFixed(5) * 100)}%\n`;
	for (let i = 1; i < 5; i++) {
		let round = `r${i}`;
		let names = {
			'r1': 'Round 1',
			'r2': 'Round 2',
			'r3': 'Conference Final',
			'r4': 'Stanley Cup Final',
		};
		output += `\nLosses in ${names[round]}: ${team[round].overall}\n`;
		for (let j in team[round]) {
			if (j === 'overall') continue;
			output += `To ${Results[j].name}: ${team[round][j]}\n`;
		}
	}
	output += `\n\n`;

	count++;
	if (count >= 16) break;
}

fs.writeFileSync('results.txt', output, {encoding: 'utf-8'});
console.log('Simulation Complete! Check results.txt for the results!');
