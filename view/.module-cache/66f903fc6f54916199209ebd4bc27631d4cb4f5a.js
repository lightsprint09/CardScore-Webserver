/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");

var GameView = React.createClass({displayName: "GameView",
	render: function() {
		var players = []
		for(var key in objects) {
		    var player = objects[key];
		    players.push(React.createElement(PlayerRow, {player: player}))
		}
		var players = this.props.game.players.map(function(player) {return });
		return (
			React.createElement("div", {className: "game-view"}, 
				React.createElement("h2", null, "Spiel: " + this.props.game.name), 
				players
			)
		)
		
	}
});


module.exports = GameView;
