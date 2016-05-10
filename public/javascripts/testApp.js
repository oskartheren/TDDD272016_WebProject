var app = angular.module('testSite', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider.state('high_score', {
	  url: '/high_score',
	  templateUrl: '/partials/high_score.html',
	  controller: 'HighScoreCtrl',
	  resolve: {
	    scorePromise: ['scores', function(scores){
	      return scores.getHighScore();
	    }]
		}
	});
	$stateProvider.state('users', {
	  url: '/users',
	  templateUrl: '/partials/users.html',
	  controller: 'UsersCtrl',
	  resolve: {
	    scorePromise: ['users', function(users){
	      return users.getAll();
	    }]
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
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(auth.isLoggedIn()){
	      $state.go('high_score');
	    }
	  }]
	});
	$urlRouterProvider.otherwise('login');
}]);

app.controller('HighScoreCtrl',  ['$scope', 'scores', function($scope, scores){
  $scope.scores = scores.scores;
}]);

app.controller('UserCtrl',  ['$scope', '$stateParams', 'users', function($scope, $stateParams, users){
	$scope.user = users.currentPageUser;

	$scope.getUser = function(){
		if (!$stateParams.userName || $stateParams.userName =='')
			return;
		users.getUser($stateParams.userName).success(function(){$scope.user = users.currentPageUser});
	}
}]);

app.controller('UsersCtrl',  ['$scope', 'users', function($scope, users){
  $scope.users = users.users;

	$scope.findUser = function() {
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
}]);


app.controller('GameCtrl', ['$scope', 'users', 'auth', function($scope, users, auth){
  $scope.users = users.users;
  $scope.currentUser = auth.currentUser;
  $scope.isLoggedIn = auth.isLoggedIn;

	$scope.createScoreOther = function(){
		var tmppoints = parseInt($scope.pointsOther);
		if(!tmppoints || !$scope.userName || $scope.userName === '')
			return;

		users.createScore({
			points: tmppoints,
			userName: $scope.userName
		});
		$scope.userName = '';
		$scope.pointsOther = '';
	};
	$scope.createScore = function(){
		var tmppoints = parseInt($scope.points);
		if(!tmppoints || !$scope.isLoggedIn)
			return;

		users.createScore({
			points: tmppoints,
			userName: $scope.currentUser()
		});
		$scope.points = '';
	};
}]);

app.controller('AuthCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth){
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
}]);

app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);



app.factory('scores', ['$http', function($http) {
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
}]);

app.factory('users', ['$http', function($http){
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
}]);


app.factory('auth', ['$http', '$window', function($http, $window){
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
}])
