module.exports = function($scope,$http,API,auth,$window,$routeParams) {
	
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
		},$scope.handleRequest);
	};

	$scope.getCourseWithID = function(id) {
		// console.log(id);
		setTimeout(function(){ 
			if ($scope.courses) {
			for (var i = 0; i < $scope.courses.length; i++) {
				// console.log($scope.courses[i]);
				if ($scope.courses[i].id == id) {
					$scope.noCourses = false;
					$scope.courseID = $scope.courses[i].id;
					$scope.courseName = $scope.courses[i].name;
					$scope.userRole = $scope.courses[i].role_name;
					$scope.userDisplayRole = $scope.courses[i].role_display_name;
					$scope.courseData = true;
					if ($scope.userRole == 'course_admin') {
						$scope.isInstructor = true;
					}
					$scope.$apply();
				}
			}
		}
		}, 400);
		
	};

	$scope.getGradesWithID = function(id) {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/sections/' + id + '/grades'
		};
		$http(req).then(function(res) {
			$scope.grades = res.data;
		},$scope.handleRequest);
	};

	$scope.getStudentsWithID = function(id) {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/sections/' + id + '/students'
		};
		console.log(req.url);
		$http(req).then(function(res) {
			console.log(res);
			$scope.students = res.data;
		},$scope.handleRequest);
		console.log($scope.students);
	};

	$scope.$on('$viewContentLoaded', function() {
		$scope.getCourses();
    	if ($routeParams.courseNumber) {
			$scope.getCourseWithID($routeParams.courseNumber);
			$scope.getGradesWithID($routeParams.courseNumber);
			$scope.getStudentsWithID($routeParams.courseNumber);
		}
	});

};