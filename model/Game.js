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
	
	function addPoints(playerID, points) {
		var player = players[playerID];
		if(player.points[player.points.length - 1] + points == 0) {
			player.points.pop();
		}else {
			player.points.push(points);
		}
		
		return player;
	}
	
	return {
		addPlayer: addPlayer,
		name: name,
		players: players,
		addPoints: addPoints
	};
}