/** @jsx React.DOM */
var React = require('react');
var GamerService = require("../client/GameService.js");

var GameView = React.createClass({displayName: "GameView",
	getInitialState: function() {
    	return {points: ""};
  	},
  	onChangePoints: function(event) {
		this.state.points = event.target.value;
	},
	onSubmitPoints: function() {
		GamerService.addPoints(this.props.gameID, this.props.player.id, this.state.points, didSendPoints);
		var self = this;
		function didSendPoints(err, result) {
			console.log(arguments);
			//self.state.points = "";
			self.props.reload();	
		}
	},
	render: function() {
		var pointList = this.props.player.points.map(function(point){ return React.createElement("li", null, point)});
		return (
			React.createElement("div", {className: "player-row"}, 
			React.createElement("h3", null, this.props.player.name + " - Punkte: " + this.props.player.points.reduce(function(a, b){return a * 1 + b  * 1}, 0)), 
			React.createElement("input", {type: "text", onChange: this.onChangePoints, placeholder: "Neue Punkte"}), 
			React.createElement("input", {type: "button", onClick: this.onSubmitPoints, value: "Eintragen"}), 
			React.createElement("ul", null, pointList)
			)
		)
		
	}
});


module.exports = GameView;
