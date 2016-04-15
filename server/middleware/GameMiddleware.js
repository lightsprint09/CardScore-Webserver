var url = require("url");

module.exports = function(gameManager, gameNotifier) {
	
	function startGame(req, res, next) {
		var query = url.parse(req.url, true).query;
		var username = query.username;
		var orderAscending = query.orderAscending;
		if(!username) {
			next()
		}
		
		gameManager.createGame(orderAscending, didCreateGame);
		function didCreateGame(err, game) {
			req.player = game.addPlayer(username);
			game.playerIdSittingPosition.push(req.player.id);
			req.game = game;
			gameNotifier.addGameNotification(game.name);
			next();
		}
	}
	
	function getGame(req, res, next) {
		var gameID = url.parse(req.url, true).query.id ||
			req.body.id;
		gameManager.getGame(gameID, didGetGame);
		function didGetGame(err, game) {
			if(!game) {
				return renderErrorPage(res);
			}
			req.game = game;
			next()
		}
	}
	
	function renderErrorPage(res) {
		res.render('Error.ejs', {error: "Hoppla, das Spiel existiert nicht"});
		}
	
	
	return {
		startGame: startGame,
		getGame: getGame
	}
}