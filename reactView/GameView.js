/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");

var GameView = React.createClass({
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
		    players.push(<PlayerRow player={player} gameID={this.props.game.name} reload={this.props.reload}/>)
		}
		return (
			<div className="game-view">
				<h2>{"Spiel: " + this.props.game.name}</h2>
				{players}
				<a href={"/scoreboard?id=" + this.props.game.name}>Scoreboard</a>
			</div>
		)
		
	}
});


module.exports = GameView;
