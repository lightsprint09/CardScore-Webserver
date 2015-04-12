/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");

var ScoreBoard = React.createClass({displayName: "ScoreBoard",
	getInitialState: function() {
		if(!this.props.server) {
			var socket = SocketClient.connect("///" + this.props.game.name);
			socket.on("update", this.updateGame);
		}
				
    	return {socket: null};
  	},
  	updateGame: function(game) {
	  	this.props.game = game;
	  	this.forceUpdate();
  	},
  	players: function() {
	  	var players = [];
	  	for(var key in this.props.game.players) {
		    var player = this.props.game.players[key];
		    players.push(player);
		}
		
		return players;
  	},
	render: function() {
		var playersDOM = []
		var players = this.players();
		var length = players.length;
		var i;
		for(i = 0; i < length; i++) {
			var player = players[i];
			players.push(React.createElement("li", null, React.createElement("div", null, "player.name"), React.createElement("div", null, "player.pointsAll")))
		}
		
		return (
			React.createElement("div", {className: "game-view"}, 
				React.createElement("h2", null, "Spiel: " + this.props.game.name), 
				playersDOM
			)
		)
		
	}
});


module.exports = ScoreBoard;
