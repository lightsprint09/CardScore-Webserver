/** @jsx React.DOM */
var React = require('react');

var GameView = React.createClass({displayName: "GameView",
	
	render: function() {
		var pointList = this.props.player.points.map(function(point){ return React.createElement("li", null, "point")});
		return (
			React.createElement("div", {className: "player-row"}, 
			React.createElement("h3", null, this.props.player.name + " - Punkte:"), 
			React.createElement("ul", null, pointList)
			)
		)
		
	}
});


module.exports = GameView;
