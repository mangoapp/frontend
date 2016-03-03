module.exports = function($scope,$http,API,auth,$window) {
	if (auth.getToken()) {
		$scope.loggedin = true;
	} else {
		$scope.loggedin = false;
	}

};
