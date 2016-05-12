app.controller('GameCtrl', function($scope, users, auth){
  $scope.users = users.users;
  $scope.currentUser = auth.currentUser;
  $scope.isLoggedIn = auth.isLoggedIn;
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var game = {
		ship: {
			pos: {x: canvas.width/2-15, y: canvas.height-20},
			size: {width: 30,	height: 10}
		},
		shots: {
			shot: [], // contains: pos, dir, speed
			size: {width: 2, height: 5}
		},
		enemies: {
			pos: [], // contains: pos of all enemies
			size: {width: 10, height: 7},
			speed: 1,
			dir: 'right'
		}
	};

	$scope.createScoreOther = function(){ // For debugging
		createScore($scope.pointsOther, $scope.userNameOther);
		$scope.userNameOther = '';
		$scope.pointsOther = '';
	};
	$scope.createScoreSelf = function(){
		if(!$scope.isLoggedIn) return;
		createScore($scope.pointsSelf, $scope.currentUser());
		$scope.pointsSelf = '';
	};
	createScore = function(points, userName){
		var points = parseInt(points);
		if(!points || !userName || userName === '') return;
		users.createScore({points, userName});
	};

	$scope.createEnemies = function() {
		var columns = 11;
		var rows = 5;
		for (i=0; i<columns; i++){
			for (j=0; j<rows; j++){
				game.enemies.pos.push({x: canvas.width*(i+3)/(1.5*columns),
															 y: canvas.height*j/(3*rows)+rows});
			}
		}
	};

	$scope.shipMove = function(event) {
		game.ship.pos.x = event.offsetX-game.ship.size.width;
	};
	$scope.shipShoot = function() {
		game.shots.shot.push({
			pos: {
				x:game.ship.pos.x+game.ship.size.width/2,
				y:game.ship.pos.y-game.ship.size.height/2
			},
			dir:'up',
			speed: 5
		});
	};

	draw = function(pos, size, fill, stroke) {
		ctx.beginPath();
		ctx.rect(pos.x, pos.y, size.width, size.height);
		if (fill!=null) {
			ctx.fillStyle = fill;
			ctx.fill();
		}
		if (stroke!=null) {
	    ctx.lineWidth = 1;
	    ctx.strokeStyle = stroke;
			ctx.stroke();
		}
	};

	moveShots = function(){
		for (i=0; i<game.shots.shot.length; i++){
			if (game.shots.shot[i].dir == 'up')
				game.shots.shot[i].pos.y-=game.shots.shot[i].speed;
			else
				game.shots.shot[i].pos.y+=game.shots.shot[i].speed;

			if (game.shots.shot[i].pos.y < 0 || game.shots.shot[i].pos.y > canvas.height)
				game.shots.shot.splice(i, 1);
		}
	};
	var edgeEnemy;
	enemiesMove = function() {
		if (edgeEnemy){
      edgeEnemy = false;
			if (game.enemies.dir == 'right') game.enemies.dir = 'left';
			else game.enemies.dir = 'right'

		  for (i=0; i<game.enemies.pos.length; i++)
        game.enemies.pos[i].y+=game.enemies.size.height*2;
		}

		for (i=0; i<game.enemies.pos.length; i++){
			if (game.enemies.dir == 'right') {
				game.enemies.pos[i].x+=game.enemies.speed;
				if (game.enemies.pos[i].x > canvas.width)	edgeEnemy = true;
			}
			else {
				game.enemies.pos[i].x-=game.enemies.speed;
				if (game.enemies.pos[i].x < 0) edgeEnemy = true;
			}
		}
	};

  enemiesCollision = function() {
    for (i=0; i<game.shots.shot.length; i++){
      for (j=0; j<game.enemies.pos.length; j++){
        if (
          game.shots.shot[i].dir == 'up' && (
            game.shots.shot[i].pos.x < game.enemies.pos[j].x &&
            game.shots.shot[i].pos.x > game.enemies.pos[j].x - game.enemies.size.width
          ) && (
            game.shots.shot[i].pos.y < game.enemies.pos[j].y &&
            game.shots.shot[i].pos.y > game.enemies.pos[j].y - game.enemies.size.height
          )
        ){
          game.shots.shot.splice(i, 1);
          game.enemies.pos.splice(j, 1);
        }
      }
    }
  };



	setInterval(onTimerTick, 33); // 33 milliseconds = ~ 30 frames per sec
	function onTimerTick() {
		moveShots();
		enemiesMove();
    enemiesCollision();

		// Draw
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		draw(game.ship.pos, game.ship.size, '#aaddff', '#666666');
		for (i=0; i<game.shots.shot.length; i++)
			draw(game.shots.shot[i].pos, game.shots.size, '#aaddff', '#666666');
		for (i=0; i<game.enemies.pos.length; i++)
			draw(game.enemies.pos[i], game.enemies.size, '#aaddff', '#666666');
	};

	$scope.$on("$destroy", function() {game = '';}); // removes all data when entering another page
});
