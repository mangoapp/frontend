module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval) {
	var stopCourses;
	$scope.new_grades = [];
	if (auth.getToken()) {
		$scope.token = auth.getToken();
		$scope.loggedin = true;
	} else {
		$scope.loggedin = false;
		$window.location.href = './#!/sign-in';
	}

	$scope.getUser = function() {
		var tok = auth.getToken();
		var ptok = auth.parseJwt(tok);
		for (var i = 0; i < ptok.roles.length; i++) {
			if (ptok.roles[i] == "course_admin") {
				$scope.isAdmin = true;
			}
		}
		$scope.firstname = ptok.firstname;
		$scope.lastname = ptok.lastname;
		$scope.id = ptok.sub;
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

	$scope.getCourseWithID = function(id) {
		if ($scope.courses) {
			for (var i = 0; i < $scope.courses.length; i++) {
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
				}
			}
			if ($scope.courseData) {
				$interval.cancel(stopCourses);
				$scope.getStudentsWithID($routeParams.courseNumber);
				$scope.getAssignmentsWithID($routeParams.courseNumber);
				if ($scope.isInstructor) {
					$scope.getAllGradesWithID($routeParams.courseNumber);
				} else {
					$scope.getStudentGradesWithID($routeParams.courseNumber);
					$scope.getAverage($routeParams.courseNumber);
				}
			}
		}
	};

	$scope.getAssignmentsWithID = function(id) {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/sections/' + id + '/assignments'
		};
		$http(req).then(function(res) {
			$scope.assignments = res.data;
		},$scope.handleRequest);
	};

	$scope.getAllGradesWithID = function(id) {
		var req = {
		method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/sections/' + id + '/allGrades'
		};
		$http(req).then(function(res) {
			$scope.grades = res.data;
		},$scope.handleRequest);
	};

	$scope.getAverage = function(id) {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/sections/' + id + '/myAverage'
		};
		$http(req).then(function(res) {
			if (res.data) {
				$scope.average = res.data;
			} else {
				$scope.average = "-";
			}
		},$scope.handleRequest);
	};

	$scope.getStudentGradesWithID = function(id) {
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

	$scope.getGrade = function(user_id, assignment_id) {
		if (user_id == -1) user_id = $scope.id;
		if ($scope.grades) {
			for (var i = 0; i < $scope.grades.length; i++) {
				if ($scope.grades[i].user_id == user_id && $scope.grades[i].assignment_id == assignment_id) {
					if (!$scope.new_grades[user_id]) {
						$scope.new_grades[user_id] = [];
					}
					$scope.new_grades[user_id][assignment_id] = $scope.grades[i].score;
					return $scope.grades[i].score;
				}
			}
		}
		if (!$scope.new_grades[user_id]) {
			$scope.new_grades[user_id] = [];
		}
		$scope.new_grades[user_id][assignment_id] = 0;
		return 0;
	};

	$scope.checkGrade = function(user_id, assignment_id) {
		if ($scope.grades) {
			for (var i = 0; i < $scope.grades.length; i++) {
				if ($scope.grades[i].user_id == user_id && $scope.grades[i].assignment_id == assignment_id) {
					return $scope.grades[i].score;
				}
			}
		}
		return false;
	};

	$scope.setGrades = function() {
		for (var i = 0; i < $scope.new_grades.length; i++) {
			for (var j = 0; j < $scope.new_grades[i].length; j++) {
				if (checkGrade(i, j)) {
					if (checkGrade(i, j) != new_grades[i][j]) {
						$scope.setGradeReq(i, j, new_grades[i][j], true);
					}
				} else {
					if (new_grades[i][j]) {
						$scope.setGradeReq(i, j, new_grades[i][j], false);
					}
				}
			}
		}
		$scope.getAllGradesWithID($routeParams.courseNumber);
	};

	$scope.setGradeReq = function(user_id, assignment_id, score, updating) {
		var formData = {
			score: score,
			user_id: user_id,
			grade_id: user_id
		};
		var url = '/assignments/' + assignment_id + (updating ? '/updateGrade' : '/grades');
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + url
		};
		$http(req).then(function(res) {
			console.log(res.data);
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
		$http(req).then(function(res) {
			$scope.students = res.data;
		},$scope.handleRequest);
	};

	$scope.editGrades = function() {
		$scope.editingGrade = !$scope.editingGrade;
		if ($scope.editingGrade) {
			console.log($scope.newGrade);
		} else {
			console.log($scope.newGrade);
		}
	};

	$scope.$on('$viewContentLoaded', function() {
		$scope.getUser();
		$scope.getCourses();		
		stopCourses = $interval(function() {
	    	if ($routeParams.courseNumber) {
				$scope.getCourseWithID($routeParams.courseNumber);
			}
		}, 50);
	});

};