var haikunator = require("haikunator");
var raven = require('raven');
var ravenClient = new raven.Client(process.env.sentryAPIKey);
var game = require("./Game.js");

module.exports = function() {
	var games = {};
	
	function createGame(orderAscending, callback) {
		var name = haikunator({tokenLength: 0});
		var trys = 0
		while(games[name]) {
			ravenClient.captureMessage("Duplicated name:" + name);
			var tokenLength = trys > 10 ? 2 : 0
			name = haikunator({tokenLength: tokenLength});
		}
		var newGame = game(name, orderAscending);
		games[name] = newGame;
		
		callback(null, newGame);
	}
	
	function deleteGame(id, callback) {
		games[id] = null;
		
		callback(null, true);
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
	
	function addPlayer(gameID, playerName, callback) {
		var game = games[gameID];
		if(!game) {
			return callback(new Error("Game not found"));
		}
		var player = game.addPlayer(playerName);
		game.playerIdSittingPosition.push(player.id);
		callback(null, player, game);
	}
	
	function addPoints(gameID, playerID, points, callback) {
		var game = games[gameID];
		if(!game) {
			return callback(new Error("Could not find game"))
		}
		game.addPoints(playerID, points);
		callback(null, game);
	}
	
	function deletePlayer(game, playerID, callback) {
		if(!game) {
			return callback(true, false);
		}
		for(var i = game.playerIdSittingPosition.length - 1; i >= 0; i--) {
		    if(game.playerIdSittingPosition[i] == playerID) {
		       game.playerIdSittingPosition.splice(i, 1);
		    }
	    }
		game.deletePlayer(playerID);
		callback(false, true);
	}
	
	function removePointsAtIndex(game, playerID, index, callback) {
		game.removePointsAtIndex(playerID, index);
		callback(null, true);
	}
	
	function updateSittingPositions(game, sittingPositions, callback) {
		game.playerIdSittingPosition = sittingPositions
		callback(null, game);
	}
	
	
	return {
		createGame: createGame,
		getGame: getGame,
		getGameStatistics: getGameStatistics,
		addPlayer: addPlayer,
		addPoints: addPoints,
		deleteGame: deleteGame,
		deletePlayer: deletePlayer,
		removePointsAtIndex: removePointsAtIndex,
		updateSittingPositions: updateSittingPositions
	}
}