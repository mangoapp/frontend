module.exports = function($scope,$http,API,auth,$window,$routeParams) {
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
				//console.log($scope.courses[i]);
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
	$scope.handleRequest = function(res) {
		//console.log(res);
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

	$scope.getAnnouncements = function() {
		// $scope.courses isn't defined when this gets called and idk why
		setTimeout(function(){ 
		if ($scope.courses && !$scope.announcements) {
			$scope.announcements = [];
			for (var i = 0; i < $scope.courses.length; i++) {
				// had to outsource this to another function because of closures apparently
				$scope.getAnnouncementsReq(i);
			}
			// this doesnt print
		}
		// this prints
		// undefined because $scope.courses isn't defined
		}, 400);
	};
	$scope.getAnnouncementsReq = function(i) {
		var req = {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			url: API + '/announcements/' + $scope.courses[i].id
		};
		$http(req).then(function(res) {
			//console.log(res.data);
			for (var j = 0; j < res.data.length; j++){
				res.data[j].created_at = new Date(res.data[j].created_at);
			}			
			$scope.announcements.push(res.data);
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
			console.log("Announcement added");
			location.reload();
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
    	if ($routeParams.courseNumber) {
			$scope.getCourseWithID($routeParams.courseNumber);
		}
		$scope.getAnnouncements();
		$scope.instructorToggle = true;
	});
};
