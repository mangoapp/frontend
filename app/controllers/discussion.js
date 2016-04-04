module.exports = function($scope,$http,API,auth,$window,$routeParams) {
	
	if (auth.getToken()) {
		$scope.token = auth.getToken();
		$scope.loggedin = true;
	} else {
		$scope.loggedin = false;
	}

};