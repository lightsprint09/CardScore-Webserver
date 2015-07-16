var React = require('react');
var GamerService = require("../model/GameService.js");
var StartScreen = React.createClass({
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
      <div className="start-screen">
      	<h2>CardScore</h2>
      	<div className="new-game-container">
      		<input type="text" placeholder="👦🏽 Name" onChange={this.onChangeName}/>
      		<div className="radio-wrapper">
      			
      			<div className="radio-name">Weniger Punkte gewinnen
      			<input type="radio" ref="isAscending" name="myradio" value={true} defaultChecked/></div>
      			
      			<div className="radio-name">Mehr Punkte gewinnen <input type="radio" name="myradio" value={false}/></div>
	  		</div>
      		<input type="button" value="Spiel starten" onClick={this.startNewGame}/>
      	</div>
      	<div className="join-game-container">
      		<h4>Spiel beitreten</h4>
      		<input type="text" placeholder="👦🏽 Name" onChange={this.onChangeName}/>
      		<input type="text" placeholder="🃏 Spielname" onChange={this.onChangeGameName}/>
      		<input type="button" value="Spiel beitreten" onClick={this.enterGame}/>
      	</div>
      </div>
    );
  }
})

module.exports = StartScreen;