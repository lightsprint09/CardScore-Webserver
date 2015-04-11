var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var React = require('react/addons');
var path = require("path");
var url = require("url");
var StartScreen = React.createFactory(require("./view/StartScreenView.js"));
var GameView = React.createFactory(require("./view/GameView.js"));
var GameManager = require("./model/GameModel.js")();
var GameNotifier = require("./model/GameNotifier.js");

var app = express();
app.use("/", express.static(path.dirname(require.main.filename) + '',
			{ maxAge: 0 }));
app.set('views', path.join(path.dirname(require.main.filename), 'templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.json()); 
			
app.get('/', start);
app.get('/startGame', startGame);
app.get('/addPlayer', addPlayer);
app.get('/game', game);
app.get("/gameObject", getGameObject);
app.post("/addPoints", addPoints)
var server = http.Server(app);
var gameNotifier = GameNotifier(server);

var port = process.env.PORT || 8888;
server.listen(port, function() {
  
}, '0.0.0.0');

function start(req, res) {
	var reactHtml = React.renderToString(StartScreen());
	res.render('StartScreen.ejs', {reactOutput: reactHtml});
}

function startGame(req, res) {
	var username = url.parse(req.url, true).query.username;
	if(!username) {
		res.redirect("/");
	}
	
	var game = GameManager.createGame();
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
	
	var game = GameManager.getGame(gameID);
	var player = game.addPlayer(username);
	res.redirect("/game?id=" + game.name + "&playerID=" + player.id);
	gameNotifier.notifyGame(game);
}

function addPoints(req, res) {
	var gameID = req.body.id;
	var playerID = req.body.playerID;
	var points = req.body.points;
	var game = GameManager.getGame(gameID);
	game.players[playerID].points.push(points);
	res.send(game.players[playerID]);
	gameNotifier.notifyGame(game);
}

function game(req, res) {
	var gameID = url.parse(req.url, true).query.id;
	var game = GameManager.getGame(gameID);
	var reactHtml = React.renderToString(GameView({game: game, server: true}));
	res.render('Game.ejs', {reactOutput: reactHtml, title: gameID});
}

function getGameObject(req, res) {
	var gameID = url.parse(req.url, true).query.id;
	var game = GameManager.getGame(gameID);
	
	res.send(game);
}

function scorePage(req, res) {
	
}

