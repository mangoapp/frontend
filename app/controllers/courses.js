module.exports = function($scope,$http,API,auth,$window,$routeParams,$ngSanitize) {
	//$scope.courseData = false;
	if (auth.getToken()) {
		$scope.token = auth.getToken();
		$scope.loggedin = true;
	} else {
		$scope.loggedin = false;
	}
	$scope.getCourseWithID = function(id) {
		setTimeout(function(){ 
			if ($scope.courses) {
			for (var i = 0; i < $scope.courses.length; i++) {
				if ($scope.courses[i].id == id) {
					$scope.noCourses = false;
					$scope.courseID = $scope.courses[i].id;
					$scope.courseName = $scope.courses[i].name;
					$scope.userRole = $scope.courses[i].role_name;
					$scope.userDisplayRole = $scope.courses[i].role_display_name;
					$scope.courseData = true;
					$scope.$apply();
				}
			}
		}
		}, 300);
		
	};
	$scope.handleRequest = function(res) {
		console.log(res);
		$scope.noCourses = true;
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
	$scope.$on('$viewContentLoaded', function() {
    	$scope.getCourses();
    	if ($routeParams.courseNumber) {
			$scope.getCourseWithID($routeParams.courseNumber);
		}
	});
};
