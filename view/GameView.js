/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var gameService = require("../client/GameService.js");

var GameView = React.createClass({displayName: "GameView",
	getInitialState: function() {
		if(!this.props.server) {
			var name = this.props.game.name;
			gameService.registerForGameUpdate(name, 
				this.updateGame);
		}
		
    	return {};
  	},
  	updateGame: function(game) {
	  	this.props.game = game;
	  	this.forceUpdate();
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
				players, 
				React.createElement("a", {className: "game-reference", href: "/scoreboard?id=" + this.props.game.name}, "zum Scoreboard")
			)
		)
		
	}
});


module.exports = GameView;
