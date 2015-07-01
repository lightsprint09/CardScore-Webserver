/** @jsx React.DOM */
var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var gameService = require("../client/GameService.js");

var ScoreBoard = React.createClass({displayName: "ScoreBoard",
	getInitialState: function() {
		if(!this.props.server) {
			var name = this.props.game.name;
			gameService.registerForGameUpdate(name, 
				this.updateGame);
		}
				
    	return {};
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
		var playersDOM = [];
		var players = this.players().sort(sortPlayers);
		players = this.props.game.orderAscending == "true" ? players : players.reverse();
		var length = players.length;
		var i;
		for(i = 0; i < length; i++) {
			var player = players[i];
			var extenedIcon = i == 0 ? " 🌟" : "";
			
			playersDOM.push(React.createElement("li", null, 
			React.createElement("div", null, (i + 1) + ". " + player.name + extenedIcon), 
			React.createElement("div", {className: "score-point"}, player.pointsAll)))
		}
		
		return (
			React.createElement("div", {className: "scoreboard-view"}, 
				React.createElement("h2", null, "Spiel: " + this.props.game.name), 
				playersDOM, 
				React.createElement("a", {className: "game-reference", href: "/game?id=" + this.props.game.name}, "zum Spiel")
			)
		)
	}
});

function sortPlayers(a, b) {
		return a.pointsAll - b.pointsAll;
	}


module.exports = ScoreBoard;
