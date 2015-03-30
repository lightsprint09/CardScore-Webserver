var React = require('react');
var GameScreen = require("../view/GameView.js");
var GameService = require("./GameService.js");
var url = require("url");

GameService.getGameObject(url.parse(document.location.href + "", true).query.id, gotObject);
function gotObject(err, obj) {
	obj = JSON.parse(obj);
	React.render(React.createElement(GameScreen, {game: obj, reload: reload}), document.body);
}

function reload() {
	GameService.getGameObject(url.parse(document.location.href + "", true).query.id, gotObject);
}
