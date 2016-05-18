app.controller('GameCtrl', function($scope, users, auth){
  $scope.users = users.users;
  $scope.currentUser = auth.currentUser;
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.points = 0;
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
  var keyDown = [];
  var shotCooldown = 0;

	var game = {
		ship: {
			pos: {x: canvas.width/2-15, y: canvas.height-20},
			size: {width: canvas.width/15,	height: canvas.height/35}
		},
		shots: {
			shot: [], // contains: pos, dir, speed
			size: {width: canvas.width/500, height: canvas.height/60}
		},
		enemies: {
			pos: [], // contains: pos of all enemies
			size: {width: canvas.width/22, height: canvas.height/19},
			speed: 0.4,
			dir: 'right'
		}
	};

  $scope.submitScore = function() {
    if(!$scope.isLoggedIn || !points) return;
		var points = parseInt(points);
    console.log('Score', $scope.points);
    console.log('User', $auth.currentUser);
		// users.createScore({points, auth.currentUser});
    $scope.points = '';
    $scope.$apply();
    createEnemies();
    onTimerTickId = setInterval(onTimerTick, 33);
  };

	$scope.createScore = function(points, userName){
    if(!$scope.isLoggedIn || !points) return;
		var points = parseInt(points);
		users.createScore({points, userName});
    $scope.points = '';
	};

	$scope.createEnemies = function() {
    $scope.gameOver = false;
    game.enemies.dir = 'right';
    game.enemies.speed = 0.4;
		var columns = 11;
		var rows = 5;
		for (i=0; i<columns; i++){
			for (j=0; j<rows; j++){
				game.enemies.pos.push({x: canvas.width*(i+3)/(1.5*columns),
															 y: canvas.height*j/(3*rows)+rows});
			}
		}
	};

	shipShoot = function() {
		game.shots.shot.push({
			pos: {
				x:game.ship.pos.x+game.ship.size.width/2,
				y:game.ship.pos.y-game.ship.size.height/2
			},
			dir:'up',
			speed: 10
		});
	};
  enemyShoot = function(enemyPos) {
		game.shots.shot.push({
			pos: {
				x:enemyPos.x+game.enemies.size.width/2,
				y:enemyPos.y-game.enemies.size.height/2
			},
			dir:'down',
			speed: 10
		});
	};

  $scope.keydownHandler = function(event) {
    if (!keyDown.includes(event.code))
      keyDown.push(event.code);
  };
  $scope.keyupHandler = function(event) {
    var index = keyDown.indexOf(event.code);
    keyDown.splice(index, 1);
  };
  handleKeyDown = function() {
    shotCooldown--;
    for (i=0;i<keyDown.length;i++) {
    switch(keyDown[i]) {
      case 'KeyA':
        if (game.ship.pos.x>0)
          game.ship.pos.x -= 5;
        break;
      case 'KeyD':
      if (game.ship.pos.x<canvas.width-game.ship.size.width)
        game.ship.pos.x += 5;
        break;
      case 'Space':
        if (shotCooldown < 0) {
          shotCooldown = 30;
          shipShoot();
        }
      default:
          break;
      }
    }
  };
	draw = function(pos, size, fill, stroke) {
		ctx.beginPath();
		ctx.rect(pos.x, pos.y, size.width, size.height);
		if (fill!=null) {
			ctx.fillStyle = fill;
			ctx.fill();
		}
		if (stroke!=null) {
	    ctx.lineWidth = 2;
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

		  for (i=0; i<game.enemies.pos.length; i++){
        game.enemies.pos[i].y+=game.enemies.size.height;
        if (game.enemies.pos[i].y > canvas.height-game.ship.size.height*3) gameOver();
      }
		}

		for (i=0; i<game.enemies.pos.length; i++){
			if (game.enemies.dir == 'right') {
				game.enemies.pos[i].x+=game.enemies.speed;
				if (game.enemies.pos[i].x > canvas.width-game.enemies.size.width)	edgeEnemy = true;
			}
			else {
				game.enemies.pos[i].x-=game.enemies.speed;
				if (game.enemies.pos[i].x < 0) edgeEnemy = true;
			}
		}
	};

  enemiesShoot = function() {
    if(Math.random()<0.03)
      enemyShoot(game.enemies.pos[Math.floor(Math.random()*game.enemies.pos.length)]);
  };

  enemiesCollision = function() {
    for (i=0; i<game.shots.shot.length; i++){
      for (j=0; j<game.enemies.pos.length; j++){
        if (
          (
            game.shots.shot[i].dir == 'up'
          ) && (
            game.enemies.pos[j].x < game.shots.shot[i].pos.x + game.shots.size.width/2 &&
            game.shots.shot[i].pos.x  + game.shots.size.width/2 < game.enemies.pos[j].x + game.enemies.size.width
          ) && (
            game.enemies.pos[j].y < game.shots.shot[i].pos.y &&
            game.shots.shot[i].pos.y < game.enemies.pos[j].y + game.enemies.size.height
          )
        ){
          $scope.points += 10
          $scope.$apply();
          game.shots.shot.splice(i, 1);
          game.enemies.pos.splice(j, 1);
          enemiesHandleAmount();
          break;
        }
      }
    }
  };

  shipCollision = function() {
    for (i=0; i<game.shots.shot.length; i++){
      if (
        (
          game.shots.shot[i].dir == 'down'
        ) && (
          game.ship.pos.x < game.shots.shot[i].pos.x + game.shots.size.width/2 &&
          game.shots.shot[i].pos.x  + game.shots.size.width/2 < game.ship.pos.x + game.ship.size.width
        ) && (
          game.ship.pos.y < game.shots.shot[i].pos.y + game.shots.size.height &&
          game.shots.shot[i].pos.y < game.ship.pos.y + game.shots.size.height + game.ship.size.height
        )
      ){
        game.shots.shot.splice(i, 1);
        gameOver();
      }
    }
  };

  enemiesHandleAmount = function() {
    if (game.enemies.pos.length == 0) $scope.createEnemies();
    else if (game.enemies.pos.length < 2) game.enemies.speed = 6;
    else if (game.enemies.pos.length < 4) game.enemies.speed = 4;
    else if (game.enemies.pos.length < 15) game.enemies.speed = 1.5;
    else if (game.enemies.pos.length < 25) game.enemies.speed = 1;
    else if (game.enemies.pos.length < 40) game.enemies.speed = 0.7;
  };

  gameOver = function() {
    clearInterval(onTimerTickId);
    $scope.gameOver = true;
    $scope.$apply();
  }

	var onTimerTickId = setInterval(onTimerTick, 33); // 33 milliseconds = ~ 30 frames per sec
	function onTimerTick() {
    handleKeyDown();
		enemiesMove();
    enemiesShoot();
    moveShots();
    shipCollision();
    enemiesCollision();


		// Draw
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		draw(game.ship.pos, game.ship.size, '#33FF00', '#999999');
		for (i=0; i<game.shots.shot.length; i++)
			draw(game.shots.shot[i].pos, game.shots.size, '#FFFFFF', '#FFFFFF');
		for (i=0; i<game.enemies.pos.length; i++)
			draw(game.enemies.pos[i], game.enemies.size, '#FFFFFF', '#999999');
	};

	$scope.$on("$destroy", function() {clearInterval(onTimerTickId);});
});
