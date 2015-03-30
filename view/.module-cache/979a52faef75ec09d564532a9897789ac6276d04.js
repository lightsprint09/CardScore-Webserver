/** @jsx React.DOM */
var React = require('react');

var GameView = React.createClass({displayName: "GameView",
	render: function() {
		React.createElement("div", {className: "game-view"}, 
		React.createElement("h2", null, "Spiel: " + this.props.gameName)
		)
	}
});


module.exports = GameView;
