var url = require("url");
var gameMiddleware = require("../middleware/GameMiddleware.js");

module.exports = function() {
	
	function Controller(app, gameNotifier, gameManager) {
		registerPath(app);
		function registerPath(app) {
			app.post("/startGame", gameMiddleware.startGame(gameManager, gameNotifier), startGame);
			app.post("/enterGame", enterGame);
			app.get("/gameObject", getGameObject);
			app.post("/addPoints", addPoints);
		}
		
		function startGame(req, res) {
			var game = req.game;
			var player = req.player;
			if(!game || !player) {
				return res.send({error:true});
			}
			res.send(game);
		}
		
		function enterGame(req, res) {
			var username = url.parse(req.url, true).query.username;
			var gameID = url.parse(req.url, true).query.gameID;
			
			gameManager.getGame(gameID, didGetGame);
			function didGetGame(err, game) {
				var player = game.addPlayer(username);
				res.send(game);
				gameNotifier.notifyGame(game);
			}
		}
		
		function addPoints(req, res) {
			var gameID = req.body.id;
			var playerID = req.body.playerID;
			var points = req.body.points * 1;
			gameManager.getGame(gameID, didGetGame);
			function didGetGame(err, game) {
				var player = game.addPoints(playerID, points);
				res.send(player);
				gameNotifier.notifyGame(game);
			}
			
		}
		
		function getGameObject(req, res) {
			var gameID = url.parse(req.url, true).query.id;
			gameManager.getGame(gameID, didGetGame);
			function didGetGame(err, game) {
				res.send(game);
			}	
		}
	}
	
	return Controller;
}()