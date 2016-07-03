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
			app.post("/game/sittingPosition", gameMiddleware.getGame, updateSittingPositions);
			app.get("/getStatistics", serverInformation);
			app.post("/game/player/delete", gameMiddleware.getGame, deletePlayer);
			app.post("/game/removescore", gameMiddleware.getGame, removeScore);
			app.post("/game/addInputValue", gameMiddleware.getGame, addInputValue);
			app.post("/game/rule", gameMiddleware.getGame, setGameRule);
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
		
		function addInputValue(req, res) {
			var playerID = req.body.playerID;
			var value = req.body.inputValue * 1;
			gameManager.addInputValue(req.game.name, playerID, value, didAddPoints);
			function didAddPoints(err, game) {
				if(err) {
					res.status(500);
					return {error: "Fehler"}
				}
				res.send();
				gameNotifier.notifyGame(game);
			}
		}
		
		function setGameRule(req, res) {
			var rule = req.body.gameRule;
			gameManager.setGameRule(req.game.name, rule,  didSetGameRule);
			function didSetGameRule(err, game) {
				if(err) {
					res.status(500);
					return {error: "Fehler"}
				}
				
				res.send();
				gameNotifier.notifyGame(game);
			}
		} 
		
		
		function deletePlayer(req, res) {
			var playerID = req.body.playerID;
			gameManager.deletePlayer(req.game, playerID, didDeletePlayer);
			function didDeletePlayer(err, success) {
				res.send(success);
				gameNotifier.notifyGame(req.game);
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
		
		function removeScore(req,res) {
			var scoreIndex = req.body.scoreIndex;
			var playerID = req.body.playerID;
			gameManager.removePointsAtIndex(req.game, playerID, scoreIndex, didDeleteScore);
			function didDeleteScore(err, success) {
				res.send(success);
				gameNotifier.notifyGame(req.game);
			}
		}
		
		function updateSittingPositions(req, res) {
			var sittingPositions = req.body;
			gameManager.updateSittingPositions(req.game, sittingPositions, function(error, game) {
				res.send(game != null);
				gameNotifier.notifyGame(game);
			})
			
		}
	}
	
	return Controller;
}()