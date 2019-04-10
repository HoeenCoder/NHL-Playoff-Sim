'use strict';

/**
 * General Configuration File
 * 
 * This file contains general configuration for the playoff simulator
 * If you want to edit the bracket, please check bracket.txt
 */

// How many times should the playoffs be simulated?
// WARNING - MORE SIMULATIONS REQUIRES MORE TIME AND COMPUTER RESOURCES
exports.simulations = 1000;

// Number of games per round, must be an odd number
exports.bestOf = 7;

// How often to display X% complete messages
exports.updates = 10;

// Enabled 50/50 mode (default uses win regular season win rates to skew the simulation)
exports.evenMatch = false;
