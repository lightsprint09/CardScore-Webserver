var nodeuuid = require("node-uuid");
module.exports = function(name_) {
	var name = name_
	var players = {};
	
	function addPlayer(name) {
		var id =  nodeuuid.v1();
		var player = {
			name: name,
			id: id,
			points: []
		};
		players[id] = player;
		return player;
	}
	
	function addPoints(playerID, points) {
		players[playerID].points.push(points);
	}
	
	function getScore() {
		return players;
	}
	
	function getName() {
		return name;
	}
	
	return {
		addPlayer: addPlayer,
		name: name,
		players: players
	};
}