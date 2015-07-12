var React = require('react');
var GameScreen = require("../server/view/GameView.js");
var GameService = require("../server/model/GameService.js");
var url = require("url");

var gameID = url.parse(document.location.href + "", true).query.id;
GameService.getGameObject(gameID, gotObject);

function gotObject(err, obj) {
	obj = JSON.parse(obj);
	React.render(React.createElement(GameScreen, {game: obj}), document.body);
}

