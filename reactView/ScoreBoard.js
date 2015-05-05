/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");

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
		var players = this.players().sort(sortPlayers);
		var length = players.length;
		var i;
		for(i = 0; i < length; i++) {
			var player = players[i];
			var extenedIcon = i == 0 ? " 🌟" : "";
			
			playersDOM.push(<li>
			<div>{(i + 1) + ". " + player.name + extenedIcon}</div>
			<div className="score-point">{player.pointsAll}</div></li>)
		}
		
		return (
			<div className="scoreboard-view">
				<h2>{"Spiel: " + this.props.game.name}</h2>
				{playersDOM}
				<a className="game-reference" href={"/game?id=" + this.props.game.name}>zum Spiel</a>
			</div>
		)
	}
});

function sortPlayers(a, b) {
		return a.pointsAll - b.pointsAll;
	}


module.exports = ScoreBoard;
