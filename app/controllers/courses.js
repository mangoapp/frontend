module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval) {
	var stopAnnouncements;
	var stopCourses;
	$scope.newSections = [];
	$scope.courseTypes = ['Math','Computer Science','English','Biology', 'History', 'Philosophy'];

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
	};

	$scope.getNotifications = function() {
		var req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            url: API + '/notifications'
        };
        $http(req).then(function(res) {
        	$scope.notifications = res.data;
        	if (res.data.length === 0) {
        		$scope.isNotifications = false;
        	} else {
        		$scope.isNotifications = true;
        	}
        },$scope.handleRequest);
	};

	$scope.markNotification = function(id) {
		var formData = {
			id: id
		};
		var req = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            data: formData,
            url: API + '/notifications'
        };
        $http(req).then(function(res) {
        	return '';
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
				$scope.getAnnouncements();
			}
		}
	};

	$scope.handleRequest = function(res) {
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
			$scope.courseLength = res.data.length;
			$scope.courseCount = 1;
			$scope.getAssignments();
		},$scope.handleRequest);
	};

	$scope.getAnnouncements = function() {
		$scope.announcements = [];
		if ($scope.courseData) {
			$scope.getAnnouncementsReq($scope.courseID);
		}
	};

	$scope.getAnnouncementsReq = function(id) {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/announcements/' + id
		};
		$http(req).then(function(res) {
			for (var j = 0; j < res.data.length; j++){
				res.data[j].created_at = new Date(res.data[j].created_at);
			}			
			$scope.announcements = res.data;
			if ($scope.announcements) {
				$scope.announcements.reverse();
				$interval.cancel(stopAnnouncements);
			}
		},$scope.handleRequest);
	};

	$scope.createAnnouncement = function() {
		var formData = {
			title: $scope.newAnnouncementTitle,
			body: $scope.newAnnouncement,
			section_id: $scope.courseID
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/announcements'
		};
		$http(req).then(function(res) {
			$scope.getAnnouncements();
			delete $scope.newAnnouncementTitle;
			delete $scope.newAnnouncement;
		},$scope.handleRequest);
	};

	$scope.getAssignments = function() {
		$scope.assignments = [];
		for (var i = 0; i < $scope.courseLength; i++) {
			$scope.getAssignmentsReq($scope.courses[i].id);
		}

	};

	$scope.getAssignmentsReq = function(id) {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/sections/' + id + '/assignments'
		};
		$http(req).then(function(res) {
			console.log(res.data);
			for (var j = 0; j < res.data.length; j++) {
				if (res.data[j].deadline) {
					res.data[j].deadline = new Date(res.data[j].deadline);
				}
				$scope.assignments.push(res.data[j]);
			}
		},$scope.handleRequest);
	};

	$scope.getCourseNameWithID = function(id) {
		for (var i = 0; i < $scope.courses.length; i++) {
			if (id == $scope.courses[i].id) {
				return $scope.courses[i].name;
			}
		}
	};

	$scope.createCourse = function() {
		if ($scope.newSections.length === 0) {
			//In case section doesn't exist
			$scope.newSections.push('01');
		}

		var formData = {
			name: $scope.newCourseName,
			section_name: $scope.newCourseName + '-' + $scope.newSections[0],
			type: $scope.newCourseType
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/courses'
		};
		$http(req).then(function(res) {
			console.log(res.data);
			$scope.createSections(res.data,$scope.newCourseName);
		},$scope.handleRequest);



	};

	$scope.createSections = function(id,newCourseName) {
		for (var i = 1; i < $scope.newSections.length; i++) {
			$scope.createSection($scope.newSections[i], id, newCourseName);
		}
		$scope.getCourses();
		$timeout(function() {
			$window.location.href = './#!/courses';
		},100);
	};

	$scope.createSection = function(section_name, id, newCourseName) {
		var formData = {
			course_id: id,
			section_name: newCourseName + '-' + section_name
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/courses/sections'
		};
		$http(req).then(function(res) {
			console.log(res.data);
			console.log("section created");
			
		},$scope.handleRequest);

	};

	$scope.addSection = function() {
		if (!isNaN($scope.newSection)) {
			$scope.newSections.push($scope.newSection);
		}
		delete $scope.newSection;
	};

	$scope.instructorAnnounceToggle = function() {
		$scope.instructorToggle = $scope.instructorToggle === false ? true: false;
	};
	$scope.$on('$viewContentLoaded', function() {
		$scope.getCourses();
		stopCourses = $interval(function() {
			if ($routeParams.courseNumber) {
				$scope.getCourseWithID($routeParams.courseNumber);
			}
		}, 50, 50);
		$scope.getUser();
		$scope.instructorToggle = true;
	});
	$scope.getNotifications();
};
