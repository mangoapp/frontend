module.exports = function($scope,$http,API,auth,$window) {
	if (auth.getToken()) {
		$scope.loggedin = true;
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
	$scope.getCourses = function() {

	};
};
