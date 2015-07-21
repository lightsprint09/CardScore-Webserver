var url = require("url");
var React = require('react/addons');
var StartScreen = React.createFactory(require("../view/StartScreenView.js"));
var GameView = React.createFactory(require("../view/GameView.js"));
var ScoreView = React.createFactory(require("../view/ScoreBoard.js"));
var GameMiddleware = require("../middleware/GameMiddleware.js");
var raven = require('raven');
var ravenClient = new raven.Client(process.env.sentryAPIKey);

module.exports = function() {
	function Controller(app, gameNotifier, gameManager) {
		registerPath(app);
		function registerPath(app) {
			var gameMiddleware = GameMiddleware(gameManager, gameNotifier);
			app.get('/', index);
			app.get('/startGame', gameMiddleware.startGame, startGame);
			app.get('/addPlayer', gameMiddleware.getGame, addPlayer);
			app.get('/game', gameMiddleware.getGame, game);
			app.get('/scoreboard', gameMiddleware.getGame, scorePage);
		}
		
		function index(req, res) {
			var reactHtml = React.renderToString(StartScreen());
			res.render('StartScreen.ejs', {reactOutput: reactHtml});
		}
		
		function startGame(req, res) {
			var game = req.game;
			var player = req.player;
			if(!game || !player) {
				ravenClient.captureMessage("Could not find game or player name");
				return renderErrorPage(res);
			}
			res.redirect("/game?id=" + game.name + "&playerID=" + player.id);
		}
		
		function addPlayer(req, res) {
			var game = req.game;
			var playerName = url.parse(req.url, true).query.username;
			if(!playerName) {
				res.error(400);
				return res.send({error: "Error"});
			}
			
			gameManager.addPlayer(game.name, playerName, didAddPlayer);
			function didAddPlayer(err, player) {
				res.redirect("/game?id=" + game.name + "&playerID=" + player.id);
				gameNotifier.notifyGame(game);
			}
		}
		
		function game(req, res) {
			var game = req.game;
			var reactHtml = React.renderToString(
					GameView({game: game, server: true}));
				res.render('Game.ejs', {reactOutput: reactHtml, title: game.name});
		}
		
		function scorePage(req, res) {
			var game = req.game;
			var reactHtml = React.renderToString(
					ScoreView({game: game, server: true}));
			res.render('Scoreboard.ejs', {reactOutput: reactHtml, title: game.name});
		}
		
		function renderErrorPage(res) {
			res.render('Error.ejs', {error: "Hoppla, das Spiel existiert nicht"});
		}
	}
	
	return Controller;
}()