var nodeuuid = require("node-uuid");
module.exports = function(name_, orderAscending) {
	var name = name_;
	var players = {};
	
	function addPlayer(name) {
		var id =  nodeuuid.v1();
		var player = {
			name: name,
			id: id,
			points: [],
			pointsAll: 0
		};
		players[id] = player;
		return player;
	}
	
	function addPoints(playerID, points) {
		var player = players[playerID];
		if(shouldDeletePoints(player, points)) {
			player.points.pop();
		}else {
			player.points.push(points);
		}
		player.pointsAll = player.points.reduce(function(a, b){return a  + b}, 0);
		
		return player;
	}
	
	function shouldDeletePoints(player, points) {
		var pointList = player.points;
		var pointListLength = pointList.length;
		var lastPoints = pointList[pointListLength - 1];
		
		return lastPoints + points == 0 && lastPoints;
	}
	
	return {
		addPlayer: addPlayer,
		name: name,
		players: players,
		addPoints: addPoints,
		orderAscending: orderAscending
	};
}