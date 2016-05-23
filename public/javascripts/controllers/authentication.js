app.controller('AuthCtrl', function($scope, $state, auth){
	$scope.registerUser = {};
  $scope.loginUser = {};

  $scope.register = function(){
		if ($scope.registerUser.password != $scope.registerUser.passwordRepeat){
			$scope.error = {message:"Passwords does not match"};
		} else if ($scope.registerUser.password.length < 7) {
			$scope.error = {message:"Password must be atleast 6 characters long"};
		}
		else {
	    auth.register($scope.registerUser).error(function(error){
	      $scope.error = error;
	    }).then(function(){
	      $state.go('high_score');
	    });
		}
		console.log("$scope.error", $scope.error);
  };

  $scope.logIn = function(){
    auth.logIn($scope.loginUser).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('high_score');
    });
  };
});
