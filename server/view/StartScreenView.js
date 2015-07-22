var React = require('react');
var GamerService = require("../model/GameService.js");
var StartScreen = React.createClass({
	getInitialState: function() {
    	return {userName: "", gameName:""};
  	},
	startNewGame(){
		if(!this.state.userName) {
			return this.warnInvalidInput(this.refs.newGameUser.getDOMNode());
		}
		var orderAscending = this.refs.isAscending.getDOMNode().checked;
		GamerService.createGame(this.state.userName, orderAscending);
	},
	onChangeName(event) {
		this.state.userName = event.target.value;
	},
	onChangeGameName(event) {
		this.state.gameName = event.target.value;
	},
	warnInvalidInput(input) {
		input.classList.add("missing");
		setTimeout(function(){ input.classList.remove("missing"); }, 3000);
	},
	enterGame() {
		if(!this.state.userName) {
			this.warnInvalidInput(this.refs.joinGameUser.getDOMNode());
		}
		if(!this.state.gameName) {
			this.warnInvalidInput(this.refs.joinGameName.getDOMNode());
		}
		if(!this.state.userName || !this.state.gameName) {
			return
		}
		GamerService.joinGame(this.state.userName, this.state.gameName);
	},
	render() {
    return (
      <div className="start-screen">
      	<h2>CardScore</h2>
      	<div className="new-game-container">
      		<input type="text" placeholder="👦🏽 Name" ref="newGameUser" onChange={this.onChangeName}/>
      		<div className="radio-wrapper">
      			
      			<div className="radio-name">Weniger Punkte gewinnen
      			<input type="radio" ref="isAscending" name="myradio" value={true} defaultChecked/></div>
      			
      			<div className="radio-name">Mehr Punkte gewinnen <input type="radio" name="myradio" value={false}/></div>
	  		</div>
      		<input type="button" value="Spiel starten" onClick={this.startNewGame}/>
      	</div>
      	<div className="join-game-container">
      		<h4>Spiel beitreten</h4>
      		<input type="text" placeholder="👦🏽 Name" ref="joinGameUser" onChange={this.onChangeName}/>
      		<input type="text" placeholder="🃏 Spielname" ref="joinGameName" onChange={this.onChangeGameName}/>
      		<input type="button" value="Spiel beitreten" onClick={this.enterGame}/>
      	</div>
      </div>
    );
  }
})

module.exports = StartScreen;