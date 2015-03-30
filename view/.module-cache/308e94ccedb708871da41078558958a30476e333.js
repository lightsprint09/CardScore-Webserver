/** @jsx React.DOM */
var React = require('react');

var StartScreen = React.createClass({displayName: "StartScreen",
	startNewGame: function(){
		
	},
	onChangeName: function(name) {
		this.state.userName = name;
	},
	onChangeGameName: function(name) {
		this.state.gameName = name;
	},
	render: function() {
    return (
      React.createElement("div", {className: "start-screen"}, 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name", onChange: this.onChangeName}), 
      		React.createElement("input", {type: "button", value: "Spiel starten", onClick: this.startNewGame})
      	), 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name"}), 
      		React.createElement("input", {type: "text", placeholder: "Spielname"}), 
      		React.createElement("input", {type: "button", value: "Spiel beitreten"})
      	)
      )
    );
  }
})

module.exports = StartScreen;