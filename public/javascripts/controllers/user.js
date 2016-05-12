app.controller('UserCtrl', function($scope, $stateParams, users){
	$scope.user = users.currentPageUser;

	$scope.getUser = function(){
		if (!$stateParams.userName || $stateParams.userName =='')
			return;
		users.getUser($stateParams.userName).success(function(){$scope.user = users.currentPageUser});
	}
});
