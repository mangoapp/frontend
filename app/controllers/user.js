module.exports = function($scope,$http,API,auth,$window,$timeout,$interval,$routeParams) {
	var stopLog;
	var stopSign;
	if (auth.getToken()) {
		$scope.token = auth.getToken();
		$scope.loggedin = true;
	} else {
		$scope.loggedin = false;
	}

	$scope.getCourses = function() {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/users/sections'
		};
		$http(req).then(function(res) {
			$scope.courses = res.data;
			$scope.courseLength = res.data.length;
			$scope.courseCount = 1;
		},$scope.handleRequest);
	};

	$scope.handleRequest = function(res) {
		var token = res.data ? res.data.token : null;
		if (token) { auth.saveToken(token); $scope.loggedin = true; $scope.edata = false;} else {
			$scope.errors = res.data;
			$scope.edata = true;
		}
		console.log(res.data);
		if (res.data.message) {
			self.message = res.data.message;
		}
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
		stopLog = $interval(function() {
			if ($scope.loggedin) {
				$interval.cancel(stopLog);
				$window.location.href = './#!/courses';
			}
		}, 50);
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

		stopSign = $interval(function() {
			if ($scope.loggedin) {
				$interval.cancel(stopSign);
				$window.location.href = './#!/courses';
			}
		}, 50);
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
		$window.location.href = './#!/sign-in';
		return;
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
			$scope.pwSent = true;
		}
	};
	$scope.resetPassword = function() {
		var formData = {
			email: $scope.email,
			token: $scope.resetToken,
			password: $scope.password
		};
		var req = {
			method: 'POST',
			url: API + '/passwordResetResponse',
			data: formData
		};
		console.log(req);
		$http(req).then(function(res) {
			$window.location.href = './#!/sign-in';
		},$scope.handleRequest);
	};
	$scope.$on('$viewContentLoaded', function() {
		if ($routeParams.resetToken) {
				console.log("here");
				$scope.resetToken = $routeParams.resetToken;
				$scope.retrieving = true;
		}
		if ($scope.loggedin) {
			$scope.email = $scope.getemail();
			$scope.getCourses();

		}
	});



};
