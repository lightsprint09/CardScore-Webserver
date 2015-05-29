/** @jsx React.DOM */
var React = require('react');
var GamerService = require("../client/GameService.js");

var StartScreen = React.createClass({displayName: "StartScreen",
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
      React.createElement("div", {className: "start-screen"}, 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name", onChange: this.onChangeName}), 
      		React.createElement("input", {type: "button", value: "Spiel starten", onClick: this.startNewGame})
      	), 
      	React.createElement("div", {className: "join-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name", onChange: this.onChangeName}), 
      		React.createElement("input", {type: "text", placeholder: "Spielname", onChange: this.onChangeGameName}), 
      		React.createElement("input", {type: "button", value: "Spiel beitreten", onClick: this.enterGame})
      	)
      )
    );
  }
})

module.exports = StartScreen;