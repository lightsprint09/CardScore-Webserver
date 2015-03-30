/** @jsx React.DOM */
var React = require('react');

var StartScreen = React.createClass({displayName: "StartScreen",
	render: function() {
    return (
      React.createElement("div", {className: "start-screen"}, 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name"}), 
      		React.createElement("input", {type: "button"})
      	), 
      	React.createElement("div", {className: "new-game-container"}, 
      		React.createElement("input", {type: "text", placeholder: "Name"}), 
      		React.createElement("input", {type: "button"})
      	)
      )
    );
  }
})

module.exports = StartScreen;