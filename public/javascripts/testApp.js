var app = angular.module('testSite', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider){
	$stateProvider.state('high_score', {
	  url: '/high_score',
	  templateUrl: '/partials/high_score.html',
	  controller: function($scope, scores){ $scope.scores = scores.scores; },
	  resolve: {
	    scorePromise: function(scores){ return scores.getHighScore(); }
		}
	});
	$stateProvider.state('users', {
	  url: '/users',
	  templateUrl: '/partials/users.html',
	  controller: 'UsersCtrl',
	  resolve: {
	    userPromise: function(users){ return users.getAll(); }
		}
	});
	$stateProvider.state('user', {
	  url: '/user/{userName}',
	  templateUrl: '/partials/user.html',
	  controller: 'UserCtrl'
	});
	$stateProvider.state('game', {
	  url: '/game',
		templateUrl: '/partials/game.html',
	  controller: 'GameCtrl'
	});
	$stateProvider.state('login', {
	  url: '/login',
	  templateUrl: 'partials/login.html',
	  controller: 'AuthCtrl',
	  onEnter: function($state, auth){ if(auth.isLoggedIn()) $state.go('high_score'); }
	});
	$urlRouterProvider.otherwise('login');
});

app.controller('UserCtrl', function($scope, $stateParams, users){
	$scope.user = users.currentPageUser;

	$scope.getUser = function(){
		if (!$stateParams.userName || $stateParams.userName =='')
			return;
		users.getUser($stateParams.userName).success(function(){$scope.user = users.currentPageUser});
	}
});

app.controller('UsersCtrl', function($scope, users){
  $scope.users = users.users;

	$scope.getUser = function() {
		if(!$scope.userName || $scope.userName === '')
			return;
		$scope.userFound = false;
		$scope.searchedUserName = $scope.userName;
		users.getUser($scope.userName).success(function(){
			$scope.searchedUserName = users.currentPageUser.userName;
			$scope.userFound = true;
		});
		$scope.userName = '';
	}
});


app.controller('GameCtrl', function($scope, users, auth){
  $scope.users = users.users;
  $scope.currentUser = auth.currentUser;
  $scope.isLoggedIn = auth.isLoggedIn;
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var game = {
		ship:{
			width:'30',
			height:'10',
			x: canvas.width/2-15,
			y: canvas.height-20,
		},
		shots: [],
		enemies: []
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
				game.enemies.push({x:canvas.width*i/columns, y:canvas.height*j/rows});
			}
		}
	}

	$scope.shipMove = function(event) {
		game.ship.x = event.offsetX-game.ship.width;
	};
	$scope.shipShoot = function() {
		game.shots.push({x:game.ship.x+game.ship.width/2, y:game.ship.y-5, direction:'up'});
	};

	draw = function(x, y, width, height, fill, stroke) {
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		if (fill!=null) {
			ctx.fillStyle = fill;
			ctx.fill();
		}
		if (stroke!=null) {
	    ctx.lineWidth = 1;
	    ctx.strokeStyle = stroke;
			ctx.stroke();
		}
	}

	moveShots = function(shots){
		for (i=0; i<shots.length; i++){
			if (shots[i].direction == 'up')
				shots[i].y-=4;
			else
				shots[i].y+=4;

			if (shots[i].y < 0 || shots[i].y > canvas.height)
				shots.splice(i, 1);
		}
	}
	setInterval(onTimerTick, 33); // 33 milliseconds = ~ 30 frames per sec
	function onTimerTick() {
		moveShots(game.shots);

		// Draw
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		draw(game.ship.x, game.ship.y, game.ship.width, game.ship.height, '#aaddff', '#666666');
		for (i=0; i<game.shots.length; i++)
			draw(game.shots[i].x, game.shots[i].y, 2, 5, '#aaddff', '#666666');
		for (i=0; i<game.enemies.length; i++)
			draw(game.enemies[i].x, game.enemies[i].y, 10, 7, '#aaddff', '#666666');
	};

	$scope.$on("$destroy", function() {game = '';}); // removes all data when entering another page
});

app.controller('AuthCtrl', function($scope, $state, auth){
	$scope.registerUser = {};
  $scope.loginUser = {};

  $scope.register = function(){
    auth.register($scope.registerUser).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('high_score');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.loginUser).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('high_score');
    });
  };
});

app.controller('NavCtrl', function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
});



app.factory('scores', function($http) {
	var obj = {
		scores: []
	};

	obj.getHighScore = function() {
		return $http.get('/scores').success(function(data){
			angular.copy(data, obj.scores);
			for (var i = 0; i < obj.scores.length; i++){
				obj.scores[i].place = i+1;
			}
		});
	};
	return obj;
});

app.factory('users', function($http){
	var obj = {
		users: [],
		currentUserPage: null
	};

	obj.getAll = function() {
		return $http.get('/users').success(function(data){
			angular.copy(data, obj.users);
		});
	};

	obj.getUser = function(userName, user) {
	  return $http.get('/users/' + userName).success(function(data){
			obj.currentPageUser = data;
			for (var i = 0; i < obj.currentPageUser.scores.length; i++)
				obj.currentPageUser.scores[i].place = i+1;
	  });
	};

	obj.create = function(user) {
		return $http.post('/users', user).success(function(data){
	    obj.users.push(data);
	  });
	};

	obj.createScore = function(score) {
		return $http.post('/users/' + score.userName + '/score', score);
	};

	return obj;
});


app.factory('auth', function($http, $window){
  var auth = {};

	auth.saveToken = function (token){
	  $window.localStorage['epic-game-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['epic-game-token'];
	};

	auth.isLoggedIn = function(){
	  var token = auth.getToken();
	  if(token){
	    var payload = JSON.parse($window.atob(token.split('.')[1])); // The payload is the middle part of the token between the two '.'

	    return payload.exp > Date.now() / 1000;
	  } else {
	    return false;
	  }
	};

	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
	    var token = auth.getToken();
	    var payload = JSON.parse($window.atob(token.split('.')[1]));
	    return payload.userName;
	  }
	};

	auth.register = function(user){
	  return $http.post('/register', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logIn = function(user){
	  return $http.post('/login', user).success(function(data){
	    auth.saveToken(data.token);
	  });
	};

	auth.logOut = function(){
	  $window.localStorage.removeItem('epic-game-token');
	};

	return auth;
});
