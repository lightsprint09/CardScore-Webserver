/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");

var GameView = React.createClass({displayName: "GameView",
	getInitialState: function() {
		var socket = SocketClient("///" + this.props.game.name);
		console.log(socket);
    	return {socket: socket};
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
