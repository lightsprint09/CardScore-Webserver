/** @jsx React.DOM */
var React = require('react');
var GamerService = require("../client/GameService.js");

var GameView = React.createClass({
	getInitialState: function() {
    	return {points: 0, emptyValue: ""};
  	},
  	onChangePoints: function(event) {
		this.state.points = event.target.value;
	},
	onSubmitPoints: function() {
		GamerService.addPoints(this.props.gameID, this.props.player.id, this.state.points, didSendPoints);
		var self = this;
		function didSendPoints(err, result) {
			self.props.reload();	
		}
	},
	render: function() {
		var pointList = this.props.player.points.map(function(point){ return <li>{point}</li>});
		return (
			<div className="player-row">
			<h3>{this.props.player.name + " - Punkte: " + this.props.player.points.reduce(function(a, b){return a * 1 + b  * 1}, 0)}</h3>
			<input type="text" value={this.state.emptyValue} onChange={this.onChangePoints} placeholder="Neue Punkte"/>
			<input type="button" onClick= {this.onSubmitPoints} value="Eintragen"/>
			<ul>{pointList}</ul>
			</div>
		)
		
	}
});


module.exports = GameView;
