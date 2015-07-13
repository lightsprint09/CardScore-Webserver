var url = require("url");

module.exports = function() {
	
	function startGame(gameManager, gameNotifier) {
		return function(req, res, next) {
			var query = url.parse(req.url, true).query;
			var username = query.username;
			var orderAscending = query.orderAscending;
			if(!username) {
				next()
			}
			
			gameManager.createGame(orderAscending, didCreateGame);
			function didCreateGame(err, game) {
				req.player = game.addPlayer(username);
				req.game = game;
				gameNotifier.addGameNotification(game.name);
				next()
			}
			
		}
	}
	
	//TODO integrate
	function getGame(gameManager) {
		return function(req, res, next) {
			var gameID = url.parse(req.url, true).query.id || req.body.id;
			gameManager.getGame(gameID, didGetGame);
			function didGetGame(err, game) {
				req.game = game;
				next()
			}
		}
	}
	
	
	return {
		startGame: startGame
	}
}()