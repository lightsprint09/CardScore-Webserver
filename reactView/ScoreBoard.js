/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");

var ScoreBoard = React.createClass({
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
			players.push(<li><div>player.name</div><div>player.pointsAll</div></li>)
		}
		
		return (
			<div className="game-view">
				<h2>{"Spiel: " + this.props.game.name}</h2>
				{playersDOM}
			</div>
		)
		
	}
});


module.exports = ScoreBoard;
