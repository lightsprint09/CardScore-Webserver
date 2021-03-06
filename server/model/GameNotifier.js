var SocketIO = require('socket.io');

module.exports = function(server) {
	var socketIO = SocketIO(server);
	var sockets = {};
	
	function addGameNotification(gameName) {
		var socket = socketIO.of(gameName);
		sockets[gameName] = socket;
	}
	
	function notifyGame(game) {
		sockets[game.name].emit("update", game);
	}
	
	return {
		addGameNotification: addGameNotification,
		notifyGame: notifyGame
	};
}