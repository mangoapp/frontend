module.exports = function($scope,$http,API,auth,$window,$routeParams) {
	$scope.courseid = $routeParams.courseNumber;
	if (auth.getToken()) {
		$scope.token = auth.getToken();
		$scope.loggedin = true;
	} else {
		$scope.loggedin = false;
	}
	$scope.currentCourse = {
		name: "hello",
		id: null
	};
	$scope.handleRequest = function(res) {
		var token = res.data ? res.data.token : null;
		if (token) { auth.saveToken(token); $scope.loggedin = true; $scope.edata = false;} else {
			$scope.errors = res.data;
			$scope.edata = true;
		}
		$scope.message = res.data.message;
	};
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
		},$scope.handleRequest);
	};
	$scope.changeCurrentCourse = function(name,id) {
		$scope.currentName = name;
		$scope.currentId = id;
	};
	$scope.$on('$viewContentLoaded', function() {
    	$scope.getCourses();
	});
};
