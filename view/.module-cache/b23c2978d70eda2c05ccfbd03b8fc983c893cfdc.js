/** @jsx React.DOM */
var React = require('react');

var StartScreen = React.createClass({displayName: "StartScreen",
	getInitialState: function() {
    	return {userName: "", gameName:""};
  	},
	startNewGame: function(){
		console.log(this.state);
	},
	onChangeName: function(event) {
		this.state.userName = event.target.value;
	},
	onChangeGameName: function(name) {
		this.state.gameName = event.target.value;
	},
	render: function() {
    return (
      React.createElement("div", {className: "start-screen"}, 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name", onChange: this.onChangeName}), 
      		React.createElement("input", {type: "button", value: "Spiel starten", onClick: this.startNewGame})
      	), 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name", onChange: this.onChangeName}), 
      		React.createElement("input", {type: "text", placeholder: "Spielname", onChange: this.onChangeGameName}), 
      		React.createElement("input", {type: "button", value: "Spiel beitreten"})
      	)
      )
    );
  }
})

module.exports = StartScreen;