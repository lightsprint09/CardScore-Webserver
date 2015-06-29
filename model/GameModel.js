var haikunator = require("haikunator");
var game = require("./Game.js");

module.exports = function() {
	var games = {};
	
	function createGame(orderAscending, callback) {
		var name = haikunator({tokenLength: 0});
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
	
	return {
		createGame: createGame,
		getGame: getGame
	}
}