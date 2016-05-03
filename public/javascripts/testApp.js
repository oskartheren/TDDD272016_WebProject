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
	$stateProvider.state('user', {
	  url: '/user',
	  templateUrl: '/partials/user.html',
	  controller: 'UserCtrl',
	  resolve: {
	    scorePromise: ['users', function(users){
	      return users.getAll();
	    }]
		}
	});
	$stateProvider.state('game', {
	  url: '/game',
		templateUrl: '/partials/game.html',
	  controller: 'GameCtrl'
	});
	$urlRouterProvider.otherwise('high_score');
}]);

app.controller('HighScoreCtrl',  ['$scope', 'scores', function($scope, scores){
  $scope.scores = scores.scores;
	// $scope.users = users.users[$stateParams.id];
	//
	// $scope.createScore = function(){
	// 	var tmppoints = parseInt($scope.points);
	//   if(!tmppoints || !$scope.userName || $scope.userName === '')
	// 		return;
	//   users.createScore(user._id, {
	//     points: tmppoints
	//   }).success(function(score) {
	// 		$scope.user.scores.push(score);
	// 	});
	//   $scope.points = '';
	//   $scope.userName = '';
	// 	scores.getHighScore();
	// };
}]);


app.controller('UserCtrl',  ['$scope', 'users', function($scope, users){
  $scope.users = users.users;

	$scope.addUser = function(){
	  if(!$scope.userName || $scope.userName === '' ||
			 !$scope.password || $scope.password === '')
			return;
	  users.create({
	    userName: $scope.userName,
			password: $scope.password
	  });
	  $scope.userName = '';
	  $scope.password = '';
		users.getAll();
	};
}]);


app.controller('GameCtrl',  ['$scope', function($scope){
	$scope.info = "Coolt Spel!"
}]);

app.factory('scores', ['$http', function($http) {
	var obj = {
		scores: []
	};

	obj.getHighScore = function() {
		return $http.get('/scores').success(function(data){
			angular.copy(data, obj.scores);
			for (var i = 0; i < obj.scores.length; i++)
			obj.scores[i].place = i+1;
		});
	};
	return obj;
}]);

app.factory('users', ['$http', function($http){
	var obj = {
		users: []
	};

	obj.getAll = function() {
		return $http.get('/users').success(function(data){
			angular.copy(data, obj.users);
		});
	};

	obj.create = function(user) {
		return $http.post('/users', user).success(function(data){
	    obj.users.push(data);
	  });
	};

	obj.getScore = function(user) {
	  return $http.get('/users/' + user._id).then(function(res){
	    return res.data;
	  });
	};


	obj.createScore = function(user, score) {
		return $http.post('/users/' + user._id + '/scores', score);
	};

	return obj;
}]);
