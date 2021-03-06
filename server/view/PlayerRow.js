var React = require('react');
var GamerService = require("../model/GameService.js");

var GameView = React.createClass({
	getInitialState: function() {
    	return {points: ""};
  	},
  	onChangePoints: function(event) {
		this.setState({points: event.target.value});
	},
	onSubmitPoints: function() {
		if(!this.state.points) {
			return
		}
		GamerService.addPoints(this.props.gameID, this.props.player.id, this.state.points, didSendPoints);
		var self = this;
		function didSendPoints(err, player) {
			self.state.points = "";
			self.forceUpdate();
		}
	},
	render: function() {
		var pointList = this.props.player.points.map(function(point){ return <li>{point}</li>});
		return (
			<div className="player-row">
			<h3>{this.props.player.name + " " + this.props.player.pointsAll}</h3>
			<input type="button" onClick= {this.onSubmitPoints} value="Eintragen"/>
			<input type="number" value={this.state.points}  onChange={this.onChangePoints} placeholder="Neue Punkte"/>
			
			<ul>{pointList}</ul>
			</div>
		)
		
	}
});


module.exports = GameView;
