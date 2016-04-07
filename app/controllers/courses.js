module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval) {
	var stopAnnouncements;
	var stopCourses;
	var assignments = [];

	if (auth.getToken()) {
		$scope.token = auth.getToken();
		$scope.loggedin = true;
	} else {
		$scope.loggedin = false;
	}
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
		},$scope.handleRequest);
	};

	$scope.getAssignments = function() {
		
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
			for (var j = 0; j < res.data.length; j++) {
				assignments.push(res.data[j]);
			}
		},$scope.handleRequest);
	};

	$scope.createSection = function() {
		var formData = {
			course_id: $scope.courseID,
			section_name: $scope.newSection
		};
		var req = {
			method: 'POST',
			data: formData,
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/courses/sections'
		};
		$http(req).then(function(res) {
			console.log("successfully created");
		},$scope.handleRequest);
		
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
		$scope.instructorToggle = true;
	});
};
