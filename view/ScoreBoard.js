/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var SocketClient = require("socket.io-client");
var ChartistGraph = require('react-chartist');


var Chart = React.createClass({displayName: "Chart",
	render: function() {
		console.log(this.props.game)
		var simpleLineChartData = {
			  labels: ['Monday', 'Tuesday'],
			  series: [
			    [12, 9]]
			}
     return(
    	React.createElement("div", null, 
        React.createElement(ChartistGraph, {data: simpleLineChartData, type: '.ct-chart'})
		))
		
	}
});

var ScoreBoard = React.createClass({displayName: "ScoreBoard",
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
			playersDOM.push(React.createElement("li", null, React.createElement("div", null, player.name), React.createElement("div", null, player.pointsAll)))
		}
		
		return (
			React.createElement("div", {className: "game-view"}, 
				React.createElement("h2", null, "Spiel: " + this.props.game.name), 
				playersDOM, 
				React.createElement(Chart, {game:  this.props.game}), 
				React.createElement("a", {href: "/game?id=" + this.props.game.name}, "Spiel")
			)
		)
		
	}
});


module.exports = ScoreBoard;
