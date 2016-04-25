var app = angular.module('testSite', []);

app.controller('MainCtrl', ['$scope', function($scope){
  $scope.test = 'Hello world!';
}]);
