var request = require("./RequestHandler.js");
var SocketClient = require("socket.io-client");

module.exports = {
		joinGame: joinGame,
		createGame: createGame,
		getGameObject: getGameObject,
		addPoints: addPoints,
		registerForGameUpdate: registerForGameUpdate,
		addPlayer: addPlayer
	};	
	
function joinGame(username, gameName) {
	document.location = "/addPlayer?username=" + username + "&gameID=" + gameName;
}

function addPlayer(username, gameID) {
	var url = "/enterGame?username=" + username + "&gameID=" + gameID
	request.performPostRequest(url, {}, function(){});
}

function registerForGameUpdate(name, callback) {
	var socket = SocketClient.connect("///" + name);
	socket.on("update", callback);
}

function addPoints(gameID, playerID, points, callback) {
	var data = {
		id: gameID,
		playerID: playerID,
		points: points
	};
	request.performPostRequest("/addPoints", data, didSubmitPoints);
	
	function didSubmitPoints(err, result) {
		var game = JSON.parse(result);
		callback(err, game);
	}
}

function createGame(username, orderAscending) {
	document.location = "/startGame?username=" + username + "&orderAscending=" + orderAscending;
}

function getGameObject(gameID, callback) {
	request.performGetRequest("/gameObject", {id: gameID}, callback);
}

function getName() {
	return name;
}
	 