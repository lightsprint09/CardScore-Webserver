var React = require('react');
var PlayerRow = require("./PlayerRow.js");
var gameService = require("../model/GameService.js");
var url = require("url");

var GameView = React.createClass({
	getInitialState() {
		if(!this.props.server) {
			var name = this.props.game.name;
			gameService.registerForGameUpdate(name, 
				this.updateGame);
		}
		
    	return {};
  	},
  	updateGame(game) {
	  	this.props.game = game;
	  	this.forceUpdate();
  	},
  	addPlayer(event) {
	  	var gameID = url.parse(document.location.href + "", true).query.id;
	  	let name = this.refs.playername.getDOMNode().value;
	  	gameService.addPlayer(name, gameID);
	  	this.refs.playername.getDOMNode().value = "";
  	},
	render() {
		var players = []
		for(var key in this.props.game.players) {
		    var player = this.props.game.players[key];
		    players.push(<PlayerRow player={player} gameID={this.props.game.name} reload={this.props.reload}/>)
		}
		return (
			<div className="game-view">
				<h2>{"Spiel: " + this.props.game.name}<a className="scoreboard-link" href={"/scoreboard?id=" + this.props.game.name}></a></h2>
				{players}
				<div className="add-player-container">
					<input type="button" value="+" onClick={this.addPlayer}/>
					<input placeholder="Spieler hinzufügen" type="text" ref="playername"/>
					
				</div>
			</div>
		)
		
	}
});


module.exports = GameView;
