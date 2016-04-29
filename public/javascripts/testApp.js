var app = angular.module('testSite', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider.state('high_score', {
	  url: '/high_score',
	  templateUrl: '/partials/high_score.html',
	  controller: 'HighScoreCtrl',
	  resolve: {
	    scorePromise: ['scores', function(scores){
	      return scores.getAll();
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

	$scope.addScore = function(){
	  if(!$scope.points || $scope.points === '' || !$scope.userName || $scope.userName === '') { return; }
	  scores.create({
	    points: $scope.points,
	    userName: $scope.userName,
	  });
	  $scope.points = '';
	  $scope.userName = '';
	};
}]);


app.controller('GameCtrl',  ['$scope', function($scope){
	$scope.info = "Coolt Spel!"
}]);

app.factory('scores', ['$http', function($http){
	var obj = {
		scores: []
	};

	obj.getAll = function() {
		return $http.get('/scores').success(function(data){
			angular.copy(data, obj.scores);
			for (var i = 0; i < obj.scores.length; i++)
				obj.scores[i].place = i+1;
		});
	};

	obj.create = function(score) {
		return $http.post('/scores', score).success(function(data){
	    obj.scores.push(data);
	  });
	};

	return obj;
}])
