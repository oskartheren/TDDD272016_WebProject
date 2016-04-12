var app = angular.module('flapperNews', []);

app.controller('MainCtrl', [
'$scope',
function($scope){
  $scope.test = 'Hello world!';
  $scope.posts = [
    {title: 'post1', upvotes: 5},
    {title: 'post2', upvotes: 52},
    {title: 'post3', upvotes: 5}
  ];
}]);
