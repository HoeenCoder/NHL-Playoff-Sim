# NHL Playoff Simulator

The NHL Playoff simulator lets you create and simulate the results of an NHL playoff bracket. It has support for the following options:

 - Choose how many simulations are run.
 - Fully customizable bracket, you get to choose which teams make the playoffs, what seed they are, and how many wins they had in the regular season (affects chance to win series).
 - Create your dream bracket, place eastern conference teams in the west and vice versa. 
 - Bracket Generator lets you create infinite random brackets.
 - Make playoff series as short as Best of 1, or as long as you want.
 - Team's chance to win matches in the playoffs is skewed based on their regular season win rate. Don't want this? Disable it and run your simulation with 50/50 odds.

This application was created in a day for personal enjoyment. I've published it on github because I've had multiple people express interest in using it as well. Please note that this isn't the most accurate simulator by any means - don't take the win percentages you see here to be your actual team's chance to win the cup.

# Installing and Running

You will need [NodeJS][nodejs] installed to run the NHL playoff simulator. Once ready, clone this repository with [git][git].
```sh
git clone https://github.com/HoeenCoder/NHL-Playoff-Sim.git
```
Or if you don't have git installed, and don't care about easy updates, download the project's ZIP file and extract that. Either way you can now start the simulator with:
```sh
node app
```
This will also generate your configuration and bracket files (found in the `config` folder). Editing `config.js` allows you to set how many simulations are run, how often the program reports progress, how many games to play in each series, and whether or not to use skewed odds. Editing `bracket.txt` using the format described at the start of the default file will allow you to edit information such as who made the playoffs, their seed, and their record (used for skew/tiebreaking).

If you want to generate a random bracket, use:
```sh
node bracket-generator
```
This will replace your existing bracket in `config/bracket.txt`. If you want to reset `config/config.js` or `config/bracket.txt` to their default values, simply delete them and re-run `app.js`.

Results will appear in `results.txt`, if you rerun the simulation, existing results will be overwritten. So if you want to save some results, copy them elsewhere.

# License

MIT

   [nodejs]: <https://nodejs.org/>
   [git]: <https://git-scm.com/>
