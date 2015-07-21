var assert = require('assert');
var gameModel = require("../server/model/GameModel.js")()


describe('GameModelServiceTest', function(){
	var testGame;
	var player1 = {name: "Lena"};
	var player2 = {name: "Lukas"};

	
	var rankAscending
	describe('#createGame()', function(){
		 it('should createGame correct', function(done){
			gameModel.createGame(true, didCreateGame);
			function didCreateGame(err, game) {
				assert(!err, "should not error");
				assert(game, "should be a valid game");
				assert(game.name, "should have a valid name");
				assert.equal(Object.keys(game.players).length, 0, "should have no player");
				testGame = game
				done()
			}
		 })
	 })
	 
	 describe('#getGame()', function(){
		 it('should getGame correct', function(done){
			gameModel.getGame(testGame.name, didGetGame);
			function didGetGame(err, game) {
				assert.equal(game, testGame, "Should be the same game");
				done()
			}
		 })
	 })
	 
	 describe('#addPlayer()', function(){
		 it('should addPlayer correct', function(done){
			gameModel.addPlayer(testGame.name, player1.name, didAddPlayer);
			function didAddPlayer(err, player, game) {
				assert.equal(Object.keys(game.players).length, 1,
					"should have one player");
				var player = game.players[Object.keys(game.players)[0]];
				assert.equal(player.name, player1.name);
				assert.equal(player.pointsAll, 0);
				player1 = player;
				done()
			}
		 })
	 })
	 
	 describe('#addPoints()', function(){
		 it('should addPoints correct', function(done){
			var points = 15;
			gameModel.addPoints(testGame.name, player1.id, points, didAddPoints);
			function didAddPoints(err, game) {
				var player = game.players[Object.keys(game.players)[0]];
				assert.equal(player.pointsAll, points);
				assert.equal(player.points.length, 1);
				assert.equal(player.points[0], points);
				done()
			}
		 })
		 
		 it('should sum up points correct', function(done){
			var points = 15;
			gameModel.addPoints(testGame.name, player1.id, points, didAddPoints);
			function didAddPoints(err, game) {
				var player = game.players[Object.keys(game.players)[0]];
				assert.equal(player.pointsAll, 2 * points);
				assert.equal(player.points.length, 2);
				assert.equal(player.points[1], points);
				done()
			}
		 })
	 })
	 
	 describe('#getGameStatistics()', function(){
		 it('should getGameStatistics correct', function(done){
			gameModel.getGameStatistics(didGetStatistics);
			function didGetStatistics(err, result) {
				assert.equal(result.gameCount, 1,
					"should have one player");
				assert.equal(result.totalPlayers, 1,
					"should have one player");
				assert.equal(result.gamePlayerRate, 1,
					"should have one player");
				
				done()
			}
		 })
	 })
	 
	 describe('#deleteGame()', function(){
		 it('should deleteGame correct', function(done){
			gameModel.deleteGame(testGame.name, didDeleteGame);
			function didDeleteGame(err, result) {
				assert(!err, "should not trow error")
				done()
			}
		 })
		 
		 it('should have deleted game', function(done){
			gameModel.getGame(testGame.name, didGetGame);
			function didGetGame(err, game) {
				assert(!game, "Should not find game")
				done()
			}
		 })
		 
		
	 })

}) 