/** @jsx React.DOM */
var React = require('react');

var StartScreen = React.createClass({displayName: "StartScreen",
	startNewGame: function(){alert(2)},
	render: function() {
    return (
      React.createElement("div", {className: "start-screen"}, 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name"}), 
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