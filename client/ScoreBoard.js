var React = require('react');
var ScoreBoard = require("../view/ScoreBoard.js");
var GameService = require("./GameService.js");
var url = require("url");

var gameID = url.parse(document.location.href + "", true).query.id;
GameService.getGameObject(gameID, gotObject);

function gotObject(err, obj) {
	obj = JSON.parse(obj);
	React.render(React.createElement(ScoreBoard, {game: obj}), document.body);
}
