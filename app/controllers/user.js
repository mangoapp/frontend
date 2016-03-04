module.exports = function($scope,$http,API,auth,$window) {
	if (auth.getToken()) {
		$scope.loggedin = true;
	} else {
		$scope.loggedin = false;
	}
	$scope.handleRequest = function(res) {
		var token = res.data ? res.data.token : null;
		if (token) { auth.saveToken(token); $scope.loggedin = true; $scope.edata = false;} else {
			$scope.errors = res.data;
			$scope.edata = true;
		}
		self.message = res.data.message;
	};
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
		$http(req).then($scope.handleRequest, $scope.handleRequest);
		setTimeout(function(){ 
			if ($scope.loggedin) {
				$window.location.href = './#!/courses';
			}
		}, 500);
	};
	$scope.signup = function() {
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
		$http(req).then($scope.handleRequest,$scope.handleRequest);
		setTimeout(function(){ 
			if ($scope.loggedin) {
				$window.location.href = './#!/courses';
			}
		}, 500);
	};
	$scope.getname = function() {
		var tok = auth.getToken();
		var ptok = auth.parseJwt(tok);
		return ptok.firstname;
	};
	$scope.getemail = function() {
		var tok = auth.getToken();
		var ptok = auth.parseJwt(tok);
		return ptok.email;
	};
	$scope.getpassword = function() {
		var tok = auth.getToken();
		var ptok = auth.parseJwt(tok);
		return ptok.password;
	};
	$scope.signout = function() {
		auth.logout();
		$scope.loggedin = false;
	};
	$scope.retrievePassword = function() {
		var formData = {
			email: $scope.email
		};
		var req = {
			method: 'POST',
			url: API + '/passwordResetRequest',
			data: formData
		};
		$http(req).then($scope.handleRequest,$scope.handleRequest);
		if ($scope.email) {
			$scope.retrieving = true;
		}
	};
	$scope.resetPassword = function() {
		var formData = {
			email: $scope.email,
			token: $scope.token,
			password: $scope.password
		};

		$http(req).then($scope.handleRequest,$scope.handleRequest);

	};
};
