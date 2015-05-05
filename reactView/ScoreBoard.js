/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");
var ChartistGraph = require('react-chartist');


var Chart = React.createClass({
	render: function() {
		console.log(this.props.game)
		var simpleLineChartData = {
			  labels: ['Monday', 'Tuesday'],
			  series: [
			    [12, 9]]
			}
     return(
    	<div>
        <ChartistGraph data={simpleLineChartData} type={'.ct-chart'} />
		</div>)
		
	}
});

var ScoreBoard = React.createClass({
	getInitialState: function() {
		if(!this.props.server) {
			var socket = SocketClient.connect("///" + this.props.game.name);
			socket.on("update", this.updateGame);
		}
				
    	return {socket: null};
  	},
  	updateGame: function(game) {
	  	this.props.game = game;
	  	this.forceUpdate();
  	},
  	players: function() {
	  	var players = [];
	  	for(var key in this.props.game.players) {
		    var player = this.props.game.players[key];
		    players.push(player);
		}
		
		return players;
  	},
	render: function() {
		var playersDOM = []
		var players = this.players();
		var length = players.length;
		var i;
		for(i = 0; i < length; i++) {
			var player = players[i];
			playersDOM.push(<li><div>{player.name}</div><div>{player.pointsAll}</div></li>)
		}
		
		return (
			<div className="game-view">
				<h2>{"Spiel: " + this.props.game.name}</h2>
				{playersDOM}
				<Chart game={ this.props.game}/>
				<a href={"/game?id=" + this.props.game.name}>Spiel</a>
			</div>
		)
		
	}
});


module.exports = ScoreBoard;
