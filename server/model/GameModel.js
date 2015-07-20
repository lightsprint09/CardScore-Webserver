var haikunator = require("haikunator");
var raven = require('raven');
var ravenClient = new raven.Client(process.env.sentryAPIKey);
var game = require("./Game.js");

module.exports = function() {
	var games = {};
	
	function createGame(orderAscending, callback) {
		var name = haikunator({tokenLength: 0});
		while(games[name]) {
			ravenClient.captureMessage("Duplicated name:" + name);
			name = haikunator({tokenLength: 0});
		}
		var newGame = game(name, orderAscending);
		games[name] = newGame;
		
		callback(null, newGame);
	}
	
	function deleteGame(id, callback) {
		games[id] = null;
		callback(null, err);
	}
	
	function getGame(id, callback) {
		callback(null, games[id]);
	}
	
	function getGameStatistics(callback) {
		var data = {
			gameCount: Object.keys(games).length,
			totalPlayers: getPlayersCount(),
			gamePlayerRate: getPlayersCount() / Object.keys(games).length
		}
		
		callback(null, data)
	}
	
	function getPlayersCount() {
		return Object.keys(games).reduce(function(count, key){ return count + Object.keys(games[key].players).length}, 0)
	}
	
	
	return {
		createGame: createGame,
		getGame: getGame,
		getGameStatistics: getGameStatistics
	}
}