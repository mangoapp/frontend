module.exports = function($scope,$http,API) {
  	$scope.signin = function() {
		var formData = {
			email: $scope.email,
			password: $scope.password
		};
		var req = {
			method: 'POST',
			url: API + '/auth',
			data: formData
		};
		console.log($http(req).then(function(token){
			console.log(token);
		}));
	};
	$scope.signup = function() {
		var formData = {
			email: $scope.email,
			password: $scope.password,
			first_name: $scope.first_name,
			last_name: $scope.last_name
		};
	};
	$scope.retrieve = function() {
		var formData = {
			email: $scope.email
		};
	};
};
