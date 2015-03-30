/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");

var GameView = React.createClass({
	
	render: function() {
		var players = []
		for(var key in this.props.game.players) {
		    var player = this.props.game.players[key];
		    players.push(<PlayerRow player={player} gameID={this.props.game.name} reload={this.props.reload}/>)
		}
		return (
			<div className="game-view">
				<h2>{"Spiel: " + this.props.game.name}</h2>
				{players}
			</div>
		)
		
	}
});


module.exports = GameView;
