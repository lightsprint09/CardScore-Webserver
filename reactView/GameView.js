/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");

var GameView = React.createClass({
	getInitialState: function() {
/*
		console.log("///" + this.props.game.name, SocketClient, SocketClient.connect);

		var socket = SocketClient.connect("///" + this.props.game.name);
		console.log(socket);
*/

		//socket.on("update", this.updateGame);
    	return {socket: null};
  	},
  	updateGame: function(game) {
	  	console.log(game);
	  	this.props.game = game;	
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
			</div>
		)
		
	}
});


module.exports = GameView;
