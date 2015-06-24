var url = require("url");
var React = require('react/addons');
var StartScreen = React.createFactory(require("./view/StartScreenView.js"));
var GameView = React.createFactory(require("./view/GameView.js"));
var ScoreView = React.createFactory(require("./view/ScoreBoard.js"));

module.exports = function() {
	function Controller(app, gameNotifier, gameManager) {
		registerPath(app);
		function registerPath(app) {
			app.get('/', start);
			app.get('/startGame', startGame);
			app.get('/addPlayer', addPlayer);
			app.get('/game', game);
			app.get('/scoreboard', scorePage);
		}
		
		function start(req, res) {
			var reactHtml = React.renderToString(StartScreen());
			res.render('StartScreen.ejs', {reactOutput: reactHtml});
		}
		
		function startGame(req, res) {
			var username = url.parse(req.url, true).query.username;
			if(!username) {
				res.redirect("/");
			}
			
			var game = gameManager.createGame();
			var player = game.addPlayer(username);
			res.redirect("/game?id=" + game.name + "&playerID=" + player.id);
			gameNotifier.addGameNotification(game.name);
		}
		
		function addPlayer(req, res) {
			var username = url.parse(req.url, true).query.username;
			var gameID = url.parse(req.url, true).query.gameID;
			if(!username || !gameID) {
				return res.redirect("/");
			}
			
			var game = gameManager.getGame(gameID);
			if(!game) {
				return res.send("Ungültiger Spielname")
			}
			var player = game.addPlayer(username);
			res.redirect("/game?id=" + game.name + "&playerID=" + player.id);
			gameNotifier.notifyGame(game);
		}
		
		function game(req, res) {
			var gameID = url.parse(req.url, true).query.id;
			var game = gameManager.getGame(gameID);
			var reactHtml = React.renderToString(GameView({game: game, server: true}));
			res.render('Game.ejs', {reactOutput: reactHtml, title: gameID});
		}
		
		function scorePage(req, res) {
			var gameID = url.parse(req.url, true).query.id;
			var game = gameManager.getGame(gameID);
			var reactHtml = React.renderToString(ScoreView({game: game, server: true}));
			res.render('Scoreboard.ejs', {reactOutput: reactHtml, title: gameID});
		}
	}
	
	return Controller;
}()