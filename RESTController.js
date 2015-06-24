var url = require("url");

module.exports = function() {
	
	function Controller(app, gameNotifier, GameManager) {
		registerPath(app);
		function registerPath(app) {
			app.post("/startGame", startGame);
			app.post("/enterGame", enterGame);
			app.get("/gameObject", getGameObject);
			app.post("/addPoints", addPoints);
		}
		
		function startGame(req, res) {
			var username = url.parse(req.url, true).query.username;
			if(!username) {
				//Error handling;
				res.send({})
			}
			
			var game = GameManager.createGame();
			var player = game.addPlayer(username);
			gameNotifier.addGameNotification(game.name);
			res.send(game);
		}
		
		function enterGame(req, res) {
			var username = url.parse(req.url, true).query.username;
			var gameID = url.parse(req.url, true).query.gameID;
			
			var game = GameManager.getGame(gameID);
			var player = game.addPlayer(username);
			res.send(game);
			gameNotifier.notifyGame(game);
		}
		
		function addPoints(req, res) {
			var gameID = req.body.id;
			var playerID = req.body.playerID;
			var points = req.body.points * 1;
			var game = gameManager.getGame(gameID);
			var player = game.addPoints(playerID, points);
			res.send(player);
			gameNotifier.notifyGame(game);
		}
		
		function getGameObject(req, res) {
			var gameID = url.parse(req.url, true).query.id;
			var game = gameManager.getGame(gameID);
			
			res.send(game);
		}
	}
	
	return Controller;
}()