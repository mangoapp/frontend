module.exports = function($scope,$http,API,auth) {
	if (auth.getToken()) {
		$scope.loggedin = true;
		console.log(auth.getToken());
	} else {
		$scope.loggedin = false;
	}
	$scope.handleRequest = function(res) {
		console.log(res);
		var token = res.data ? res.data.token : null;
		if (token) { auth.saveToken(token); $scope.loggedin = true; $scope.edata = false;} else {
			$scope.errors = res.data;
			$scope.edata = true;
		}
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
		$http(req).then(handleRequest,handleRequest);
	};
	$scope.signout = function() {
		auth.logout();
		$scope.loggedin = false;
	};
	$scope.retrievePassword = function() {
		handleRequest = $scope.handleRequest;
		var formData = {
			email: $scope.email
		};
		var req = {
			method: 'POST',
			url: API + '/passwordResetRequest',
			data: formData
		};
		$http(req).then(handleRequest,handleRequest);
	};
};
