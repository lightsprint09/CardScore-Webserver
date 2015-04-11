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
	render: function() {
		var players = []
		for(var key in this.props.game.players) {
		    var player = this.props.game.players[key];
		    players.push(<li></li>)
		}
		return (
			<div className="game-view">
				<h2>{"Spiel: " + this.props.game.name}</h2>
				{players}
			</div>
		)
		
	}
});


module.exports = ScoreBoard;
