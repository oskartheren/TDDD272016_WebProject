var app = angular.module('testSite', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider.state('high_score', {
	  url: '/high_score',
	  templateUrl: '/high_score.html',
	  controller: 'HighScoreCtrl',
	  resolve: {
	    scorePromise: ['scores', function(scores){
	      return scores.getAll();
	    }]
		}
	});
	$stateProvider.state('game', {
	  url: '/game',
	  templateUrl: '/game.html',
	  controller: 'GameCtrl'
	});

  // $stateProvider.state('posts', {
	//   url: '/posts/{id}',
	//   templateUrl: '/posts.html',
	//   controller: 'PostsCtrl',
	//   resolve: {
	//     post: ['$stateParams', 'posts', function($stateParams, posts) {
	//       return posts.get($stateParams.id);
	//     }]
	//   }
	// });
	$urlRouterProvider.otherwise('high_score');
}]);

app.controller('HighScoreCtrl',  ['$scope', 'scores', function($scope, scores){
  $scope.scores = scores.scores;

	$scope.scores.push({
		points: 20,
		userName: 'Oskar'
	});
	$scope.scores.push({
		points: 30,
		userName: 'Hanna'
	});

	$scope.addScore = function(){
	  if(!$scope.points || $scope.points === '' || !$scope.userName || $scope.userName === '') { return; }
	  scores.create({
	    points: $scope.points,
	    userName: $scope.userName,
	  });
	  $scope.points = '';
	  $scope.userName = '';
	};

	// $scope.incrementUpvotes = function(post) {
	//   posts.upvote(post);
	// };
}]);


app.controller('GameCtrl',  ['$scope', function($scope){
	$scope.info = "Coolt Spel!"
}]);


// app.controller('PostsCtrl', ['$scope', 'posts', 'post', function($scope, posts, post){
//   $scope.post = post;
//
// 	$scope.addComment = function(){
// 	  if($scope.body === '') { return; }
// 	  posts.addComment(post._id, {
// 	    body: $scope.body,
// 	    author: 'user',
// 	  }).success(function(comment) {
// 	    $scope.post.comments.push(comment);
// 	  });
// 	  $scope.body = '';
// 	};
//
// 	$scope.incrementUpvotes = function(comment){
// 		posts.upvoteComment(post, comment);
// 	};
// }]);

app.factory('scores', ['$http', function($http){
	var obj = {
		scores: []
	};

	obj.getAll = function() {
		return $http.get('/scores').success(function(data){
			angular.copy(data, obj.scores);
		});
	};

	obj.create = function(score) {
		return $http.post('/scores', score).success(function(data){
	    obj.scores.push(data);
	  });
	};

	return obj;
}])

// app.factory('posts', ['$http', function($http){
// 	var o = {
// 		posts: []
// 	};
//
// 	o.getAll = function() {
// 		return $http.get('/posts').success(function(data){
// 			angular.copy(data, o.posts);
// 		});
// 	};
//
// 	o.create = function(post) {
// 	  return $http.post('/posts', post).success(function(data){
// 	    o.posts.push(data);
// 	  });
// 	};
//
// 	o.upvote = function(post) {
// 	  return $http.put('/posts/' + post._id + '/upvote')
// 	    .success(function(data){
// 	      post.upvotes += 1;
// 	    });
// 	};
//
// 	o.get = function(id) {
// 	  return $http.get('/posts/' + id).then(function(res){
// 	    return res.data;
// 	  });
// 	};
//
// 	o.addComment = function(id, comment) {
// 	  return $http.post('/posts/' + id + '/comments', comment);
// 	};
//
// 	o.upvoteComment = function(post, comment) {
// 	  return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
// 	    .success(function(data){
// 	      comment.upvotes += 1;
// 	    });
// 	};
//
// 	return o;
// }]);
