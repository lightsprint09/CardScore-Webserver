var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require("path");
var url = require("url");
var GameManager = require("./model/GameModel.js")();
var GameNotifier = require("./model/GameNotifier.js");
var RESTControler = require("./RESTController.js");
var ViewController = require("./ViewController.js");

var app = express();
app.use("/", express.static(path.dirname(require.main.filename) + '',
			{ maxAge: 0 }));
app.set('views', path.join(path.dirname(require.main.filename), 'templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());

var server = http.Server(app);
var gameNotifier = GameNotifier(server);
var restController = RESTControler(app, gameNotifier, GameManager);
var viewController = ViewController(app, gameNotifier, GameManager);

var port = process.env.PORT || 8888;
server.listen(port, function() {
  
}, '0.0.0.0');

