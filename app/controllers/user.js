module.exports = function($scope,$http,API,auth) {
	$scope.handleRequest = function(res) {
		console.log(res);
		var token = res.data ? res.data.token : null;
		if (token) { auth.saveToken(token); }
		self.message = res.data.message;
	};
  	$scope.signin = function() {
  		if (!auth.getToken()) {
  			console.log("woo token");
  		} else {
  			console.log("Token is here! " + auth.getToken());
  		}
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
		handleRequest = $scope.handleRequest;
		var formData = {
			firstname: $scope.firstname,
			lastname: $scope.lastname,
			email: $scope.email,
			password: $scope.password
		};
		var req = {
			method: 'POST',
			url: API + '/users',
			data: formData
		};
		//console.log("here");
		$http(req).then(handleRequest,handleRequest);
	};
	$scope.retrieve = function() {
		var formData = {
			email: $scope.email
		};
	};
};
