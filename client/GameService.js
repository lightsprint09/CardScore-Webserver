var request = require("./RequestHandler.js");

module.exports = {
		joinGame: joinGame,
		createGame: createGame,
		getGameObject: getGameObject,
		addPoints: addPoints
	};	
	
function joinGame(username, gameName) {
	document.location = "/addPlayer?username=" + username + "&gameID=" + gameName;
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

function createGame(username) {
	document.location = "/startGame?username=" + username;
}

function getGameObject(gameID, callback) {
	request.performGetRequest("/gameObject", {id: gameID}, callback);
}

function getName() {
	return name;
}
	 