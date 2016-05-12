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
