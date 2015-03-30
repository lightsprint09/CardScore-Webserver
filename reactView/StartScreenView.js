/** @jsx React.DOM */
var React = require('react');
var GamerService = require("../client/GameService.js");

var StartScreen = React.createClass({
	getInitialState: function() {
    	return {userName: "", gameName:""};
  	},
	startNewGame: function(){
		GamerService.createGame(this.state.userName);
	},
	onChangeName: function(event) {
		this.state.userName = event.target.value;
	},
	onChangeGameName: function(event) {
		this.state.gameName = event.target.value;
	},
	enterGame: function() {
		GamerService.joinGame(this.state.userName, this.state.gameName)
	},
	render: function() {
    return (
      <div className="start-screen">
      	<div className="new-game-container">
      		<input type="text" placeholder="Name" onChange={this.onChangeName}/>
      		<input type="button" value="Spiel starten" onClick={this.startNewGame}/>
      	</div>
      	<div className="join-game-container">
      		<input type="text" placeholder="Name" onChange={this.onChangeName}/>
      		<input type="text" placeholder="Spielname" onChange={this.onChangeGameName}/>
      		<input type="button" value="Spiel beitreten" onClick={this.enterGame}/>
      	</div>
      </div>
    );
  }
})

module.exports = StartScreen;