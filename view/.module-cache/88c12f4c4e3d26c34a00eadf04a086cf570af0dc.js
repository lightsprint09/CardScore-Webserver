/** @jsx React.DOM */
var React = require('react');

var GameView = React.createClass({displayName: "GameView",
	render: function() {
		return (
			React.createElement("div", {className: "player-row"}, 
			React.createElement("h3", null)
			)
		)
		
	}
});


module.exports = GameView;
