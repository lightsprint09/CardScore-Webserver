var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var path = require("path");
var url = require("url");
var GameManager = require("./model/GameModel.js")();
var GameNotifier = require("./model/GameNotifier.js");
var RESTControler = require("./controller/RESTController.js");
var ViewController = require("./controller/ViewController.js");
var raven = require('raven');
var ravenClient = new raven.Client(process.env.sentryAPIKey);

var app = express();
var rootPath = path.join(path.dirname(require.main.filename), '/../..')
app.use("/", express.static(rootPath, { maxAge: 0 }));
app.set('views', path.join(rootPath, '/templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(raven.middleware.express(process.env.sentryAPIKey));

var server = http.Server(app);
var gameNotifier = GameNotifier(server);
var restController = RESTControler(app, gameNotifier, GameManager);
var viewController = ViewController(app, gameNotifier, GameManager);

var port = process.env.PORT || 8888;
server.listen(port, function() {
  ravenClient.captureMessage("Started on port " + port)
}, '0.0.0.0');

