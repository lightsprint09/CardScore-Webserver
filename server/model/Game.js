var nodeuuid = require("node-uuid");
module.exports = function(name_, orderAscending) {
	var name = name_;
	var players = {};
	var playerIdSittingPosition = [];
	
	function addPlayer(name) {
		var id = nodeuuid.v1();
		var player = {
			name: name,
			id: id,
			points: [],
			pointsAll: 0,
			values: []
		};
		players[id] = player;
		
		return player;
	}
	
	function updateSittingPositions(sittingPositions) {
		playerIdSittingPosition = sittingPositions
	}
	
	function addPoints(playerID, points) {
		var player = players[playerID];
		player.points.push(points);
		player.pointsAll = player.points.reduce(function(a, b){return a  + b}, 0);
		player.values = [];
		
		return player;
	}
	
	function addValue(playerID, value) {
		var player = players[playerID];
		player.values.push(value);
		
		return player;
	}
	
	function removePointsAtIndex(playerID, index) {
		var player = players[playerID]
		player.points.splice(index, 1);
		player.pointsAll = player.points.reduce(function(a, b){return a  + b}, 0);
	}
	
	function deletePlayer(playerID) {
		//playerIdSittingPosition
		delete players[playerID]
	}
	
	return {
		addPlayer: addPlayer,
		name: name,
		players: players,
		playerIdSittingPosition: playerIdSittingPosition,
		updateSittingPositions: updateSittingPositions,
		addPoints: addPoints,
		orderAscending: orderAscending,
		deletePlayer: deletePlayer,
		removePointsAtIndex: removePointsAtIndex,
		addValue: addValue
	};
}