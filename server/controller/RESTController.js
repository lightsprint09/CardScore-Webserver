var url = require("url");
var GameMiddleware = require("../middleware/GameMiddleware.js");

module.exports = function() {
	
	function Controller(app, gameNotifier, gameManager) {
		registerPath(app);
		function registerPath(app) {
			var gameMiddleware = GameMiddleware(gameManager, gameNotifier);
			app.post("/startGame", gameMiddleware.startGame, startGame);
			app.post("/enterGame", gameMiddleware.getGame, enterGame);
			app.get("/gameObject", gameMiddleware.getGame, getGameObject);
			app.post("/addPoints", gameMiddleware.getGame, addPoints);
			app.get("/getStatistics", serverInformation);
		}
		
		function startGame(req, res) {
			var game = req.game;
			var player = req.player;
			if(!game || !player) {
				res.status(500);
				return {error: "Fehler"}
			}
			res.send(game);
		}
		
		function enterGame(req, res) {
			var playerName = url.parse(req.url, true).query.username;			
			if(!playerName) {
				res.error(400);
				return res.send({error: "Error"});
			}
			
			gameManager.addPlayer(req.game.name, playerName, didAddPlayer);
			function didAddPlayer(err, player, game) {
				res.send(game);
				gameNotifier.notifyGame(game);
			}
		}
		
		function addPoints(req, res) {
			var playerID = req.body.playerID;
			var points = req.body.points * 1;
			gameManager.addPoints(req.game.name, playerID, points, didAddPoints);
			function didAddPoints(err, game) {
				if(err) {
					res.status(500);
					return {error: "Fehler"}
				}
				res.send();
				gameNotifier.notifyGame(game);
			}
		}
		
		function getGameObject(req, res) {
			res.send(req.game);
		}
		
		function serverInformation(req, res) {
			gameManager.getGameStatistics(didGetStatistics);
			function didGetStatistics(err, result) {
				if(err) {
					res.status(500);
					return {error: "Fehler"}
				}
				res.send(result);
			}
		}
	}
	
	return Controller;
}()