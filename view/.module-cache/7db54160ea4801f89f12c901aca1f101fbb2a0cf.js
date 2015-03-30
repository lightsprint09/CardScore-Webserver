/** @jsx React.DOM */
var React = require('react');
var GamerService = require("../client/GameService.js");

var GameView = React.createClass({displayName: "GameView",
	getInitialState: function() {
    	return {points: 0};
  	},
  	onChangePoints: function(event) {
		this.state.points = event.target.value;
	},
	render: function() {
		var pointList = this.props.player.points.map(function(point){ return React.createElement("li", null, "point")});
		return (
			React.createElement("div", {className: "player-row"}, 
			React.createElement("h3", null, this.props.player.name + " - Punkte: " + this.props.player.points.reduce(function(a, b){return a + b}, 0)), 
			React.createElement("input", {type: "text", onChange: this.onChangePoints}), 
			React.createElement("input", {type: "button", onClikc: this.onChangePoints}), 
			React.createElement("ul", null, pointList)
			)
		)
		
	}
});


module.exports = GameView;
