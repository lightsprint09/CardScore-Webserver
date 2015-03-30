var haikunator = require("haikunator");
var game = require("./Game.js");

module.exports = function() {
	var games = {};
	
	function createGame() {
		var name = haikunator({tokenLength: 0});
		var newGame = game(name);
		games[name] = newGame;
		
		return newGame;
	}
	
	function deleteGame(id) {
		games[id] = null;
	}
	
	function getGame(id) {
		return games[id];
	}
	
	return {
		createGame: createGame,
		getGame: getGame
	}
}