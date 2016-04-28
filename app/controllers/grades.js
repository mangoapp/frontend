module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval) {
	var stopCourses;
	var stopGrades;
	var gradesComplete = 0;
	
	$scope.masterGrades = [];	
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

	$scope.createGradeObject = function() {

		stopGrades = $interval(function() {
			if ($scope.assignments && $scope.grades && $scope.students) {
				gradesComplete = 1;
				var studentInfo, i, j, k, student, tempStudents;

			//Fill masterGrades with assignments
			for (i = 0; i < $scope.assignments.length; i++) {
				var singleGrade = {
					title: $scope.assignments[i].title,
					description: $scope.assignments[i].description,
					id: $scope.assignments[i].id,
					score: $scope.assignments[i].maxScore,
					editing: 0,
					students: []
				};
				tempStudents = [];
				for (j = 0; j < $scope.students.length; j++) {
					student = {
						id: $scope.students[j].id,
						firstName: $scope.students[j].firstname,
						lastName: $scope.students[j].lastname,
						score: 0
					};
					tempStudents.push(student);
				}
				singleGrade.students = tempStudents;
				$scope.masterGrades.push(singleGrade);
			}

			//Go through grades
			for (i = 0; i < $scope.grades.length; i++) {
				for (j = 0; j < $scope.masterGrades.length; j++) {
					if ($scope.grades[i].assignment_id == $scope.masterGrades[j].id) {
						for (k = 0; k < $scope.masterGrades[j].students.length; k++) {
							if ($scope.masterGrades[j].students[k].id == $scope.grades[i].user_id) {
								$scope.masterGrades[j].students[k].score = $scope.grades[i].score;
								break;
							}
						}
						break;
					}
				}
			}
		}

		if (gradesComplete == 1) { $interval.cancel(stopGrades); }

	}, 50);


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
			$scope.createGradeObject();
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

	$scope.getGrade = function(user_id, assignment_id) {
		if (user_id == -1) user_id = $scope.id;
		if ($scope.grades) {
			for (var i = 0; i < $scope.grades.length; i++) {
				if ($scope.grades[i].user_id == user_id && $scope.grades[i].assignment_id == assignment_id) {
					return $scope.grades[i].score;
				}
			}
		}
		return 0;
	};

	$scope.toggleEdit = function(index) {
		$scope.masterGrades[index].editing = 1;
	};

	$scope.saveGrades = function(index) {
		$scope.masterGrades[index].editing = 0;
		for (var i = 0; i < $scope.masterGrades[index].students.length; i++) {
			$scope.editGrade($scope.masterGrades[index].students[i].score,$scope.masterGrades[index].students[i].id,$scope.masterGrades[index].id);
		}

	};

	$scope.editGrade = function(score,user_id,assignment_id) {
		if (!score) {score = 0;}
		var formData = {
			score: score,
			user_id: user_id
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/assignments/' + assignment_id + '/updateGrade'
		};
		$http(req).then(function(res) {
		},$scope.handleRequest);


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