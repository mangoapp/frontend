module.exports = function($scope,$http,API, auth) {
	$scope.handleRequest = function(res) {
		var token = res.data ? res.data.token : null;
		if (token) { console.log('JWT:', token); }
		self.message = res.data.message;
	};
  	$scope.signin = function() {
  		handleRequest = $scope.handleRequest;
		var formData = {
			email: $scope.email,
			password: $scope.password
		};
		var req = {
			method: 'POST',
			url: API + '/auth',
			data: formData
		};
		$http(req).then(handleRequest, handleRequest);
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
