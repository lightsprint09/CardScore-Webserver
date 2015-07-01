/** @jsx React.DOM */
var React = require('react');
var GamerService = require("../client/GameService.js");

var StartScreen = React.createClass({displayName: "StartScreen",
	getInitialState: function() {
    	return {userName: "", gameName:""};
  	},
	startNewGame: function(){
		var orderAscending = this.refs.isAscending.getDOMNode().checked;
		GamerService.createGame(this.state.userName, orderAscending);
	},
	onChangeName: function(event) {
		this.state.userName = event.target.value;
	},
	onChangeGameName: function(event) {
		this.state.gameName = event.target.value;
	},
	enterGame: function() {
		GamerService.joinGame(this.state.userName, this.state.gameName);
	},
	render: function() {
    return (
      React.createElement("div", {className: "start-screen"}, 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name", onChange: this.onChangeName}), 
      		React.createElement("div", {className: "radio-wrapper"}, 
      			React.createElement("input", {type: "radio", ref: "isAscending", name: "myradio", value: true, defaultChecked: true}), 
      			React.createElement("div", {className: "radio-name"}, "Weniger Punkte gewinnen"), 
      			React.createElement("input", {type: "radio", name: "myradio", value: false}), 
      			React.createElement("div", {className: "radio-name"}, "Mehr Punkte gewinnen")
	  		), 
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