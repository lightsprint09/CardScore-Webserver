var url = require("url");

module.exports = function() {
	
	function startGame(gameManager, gameNotifier) {
		return function(req, res, next) {
			var query = url.parse(req.url, true).query;
			var username = query.username;
			var orderAscending = query.orderAscending;
			console.log(orderAscending);
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
	
	
	return {
		startGame: startGame
	}
}()