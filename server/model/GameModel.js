var haikunator = require("haikunator");
var raven = require('raven');
var ravenClient = new raven.Client('https://8d7fdab17cf943fe8a43fbb9aa5e30e3:c7accadeafe04e8eb8c96162d16cbd0e@app.getsentry.com/47591');
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
	
	return {
		createGame: createGame,
		getGame: getGame
	}
}