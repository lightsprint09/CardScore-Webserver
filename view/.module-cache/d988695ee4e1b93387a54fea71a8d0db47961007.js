/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");

var GameView = React.createClass({displayName: "GameView",
	render: function() {
		return (
			React.createElement("div", {className: "game-view"}, 
				React.createElement("h2", null, "Spiel: " + this.props.game.name)
			)
		)
		
	}
});


module.exports = GameView;
