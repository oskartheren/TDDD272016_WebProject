var app = angular.module('spaceInvaders', ['ui.router']);

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

app.factory('scores', function($http) {
	var obj = {
		scores: []
	};

	obj.getHighScore = function() {
		return $http.get('/scores').success(function(data){
			angular.copy(data, obj.scores);
			for (var i = 0; i < obj.scores.length; i++)
				if (obj.scores[i].user) obj.scores[i].place = i+1; // only give it a place if it has a user
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
