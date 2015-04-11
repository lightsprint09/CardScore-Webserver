/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");

var GameView = React.createClass({displayName: "GameView",
	getInitialState: function() {
		console.log(this.props.game.name);
/*
		var socket = SocketClient.connect("///" + this.props.game.name);
		console.log(socket);
*/
		//socket.on("update", this.updateGame);
    	return {socket: socket};
  	},
  	updateGame: function(game) {
	  	console.log(game);
	  	this.props.game = game;	
  	},
	render: function() {
		var players = []
		for(var key in this.props.game.players) {
		    var player = this.props.game.players[key];
		    players.push(React.createElement(PlayerRow, {player: player, gameID: this.props.game.name, reload: this.props.reload}))
		}
		return (
			React.createElement("div", {className: "game-view"}, 
				React.createElement("h2", null, "Spiel: " + this.props.game.name), 
				players
			)
		)
		
	}
});


module.exports = GameView;
