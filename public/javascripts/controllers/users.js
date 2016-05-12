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
