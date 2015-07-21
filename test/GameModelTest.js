var assert = require('assert');
var gameModel = require("../server/model/GameModel.js")()


describe('AbstractService', function(){
	var testGame;
	var player1 = {name: "Lena"};
	var player2 = {name: "Lukas"};
		
	before(function(done){
	   
	})
	after(function(done){
    	
  	})
	
	var rankAscending
	describe('#createGame()', function(){
		 it('should createGame correct', function(done){
			gameModel.createGame(true, didCreateGame);
			function didCreareGame(err, game) {
				assert(!err, "should not error");
				assert(game, "should be a valid game");
				assert(game.name, "should have a valid name");
				assertEqual(Object.keys(game.players).length, 0, "should have no player");
				testGame = game
				done()
			}
		 })
	 })
	 
	 describe('#getGame()', function(){
		 it('should getGame correct', function(done){
			gameModel.getGame(testGame.name, didGetGame);
			function didGetGame(err, game) {
				assertEqual(game, testGame, "Should be the same game");
				done()
			}
		 })
	 })

}) 