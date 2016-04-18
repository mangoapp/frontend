module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval) {
	var stopCourses;
	var stopPolls;
	$scope.isOpen = false;
	$scope.pollAnswers = [
	{ answer: "A", checked: false },
	{ answer: "B", checked: false },
	{ answer: "C", checked: false },
	{ answer: "D", checked: false }
	];
	$scope.newAnswer = "";
	$scope.newDescription = "";
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
		$scope.userID = ptok.sub;
		for (var i = 0; i < ptok.roles.length; i++) {
			if (ptok.roles[i] == "course_admin") {
				$scope.isAdmin = true;
			}
		}
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
				}
			}
			if ($scope.courseData) {
				$interval.cancel(stopCourses);
				$scope.getPolls();
				stopPolls = $interval(function() {
					if ($routeParams.pollNumber) {
						$scope.getPollWithID($routeParams.pollNumber);
					}
				}, 50);
			}
		}
	};

	$scope.getPolls = function() {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/sections/' + $scope.courseID + '/polls'
		};
		$http(req).then(function(res) {
			$scope.polls = res.data;
		},$scope.handleRequest);
		req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/sections/' + $scope.courseID + '/activePolls'
		};
		$http(req).then(function(res) {
			$scope.activePolls = res.data;
		},$scope.handleRequest);
	};

	$scope.getPollWithID = function(id) {
		if ($scope.polls) {
			for (var i = 0; i < $scope.polls.length; i++) {
				if ($scope.polls[i].id == id) {
					$scope.currentPoll = $scope.polls[i];
					
				}
			}
			if ($scope.activePolls) {
				for (var j = 0; j < $scope.activePolls.length; j++) {
					if ($scope.activePolls[j].id == id) {
						$scope.isOpen = true;
						$scope.openDiscover = true;
					}
				}
			}
			if ($scope.currentPoll && $scope.openDiscover) {
				$interval.cancel(stopPolls);
			}
		}
	};

	$scope.answerPoll = function(id, index) {
		var formData = {
			answer: index
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/sections/polls/' + id + '/submitResponse'
		};
		$http(req).then(function(res) {
			for (var i = 0; i < $scope.pollAnswers.length; i++) {
				if (i == index) {
					$scope.pollAnswers[i].checked = true;
				} else {
					$scope.pollAnswers[i].checked = false;
				}
			}
			console.log(res.data);
		},$scope.handleRequest);
	};

	$scope.closePoll = function(id) {
		if ($scope.isAdmin) {
			var req = {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer: ' + $scope.token
				},
				url: API + '/sections/polls/' + id + '/closePoll'
			};
			$http(req).then(function(res) {
				console.log(res.data);
				$scope.isOpen = false;
			},$scope.handleRequest);
		}
	};

	$scope.openPoll = function(id) {
		if ($scope.isAdmin) {
			var req = {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer: ' + $scope.token
				},
				url: API + '/sections/polls/' + id + '/openPoll'
			};
			$http(req).then(function(res) {
				console.log(res.data);
				$scope.isOpen = true;
			},$scope.handleRequest);
		}
	};

	$scope.createPoll = function(description) {
		var formData = {
			answer: $scope.newAnswer,
			section_id: $scope.courseID,
			description: description
		};
		var req = {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer: ' + $scope.token
				},
				data: formData,
				url: API + '/sections/polls'
		};
		$http(req).then(function(res) {
			console.log(res.data);
			$window.location.href = './#!/polls/' + $routeParams.courseNumber;
		},$scope.handleRequest);
	};

	$scope.checkPoll = function(index) {
        $scope.newAnswer = index;
    };

	$scope.$on('$viewContentLoaded', function() {
		$scope.getCourses();
		
		stopCourses = $interval(function() {
			if ($routeParams.courseNumber) {
				$scope.getCourseWithID($routeParams.courseNumber);
			}
		}, 50);
		
		$scope.getUser();
		
	});

};