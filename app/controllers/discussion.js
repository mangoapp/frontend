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
						if ($scope.userRole == 'course_admin') {
							$scope.isInstructor = true;
						}
						$scope.$apply();
						$scope.getCourseThreads();
					}
				}
			}
		}, 400);
	};

	$scope.getCourseThreads = function() {
		$scope.threads=[];
		$scope.pinnedThreads=[];
		if ($scope.courseID) {
			var req = {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer: ' + $scope.token
				},
				url: API + '/forum/' + $scope.courseID + '/threads'
			};
			$http(req).then(function(res) {
				if (res.data.threads) {
					$scope.threads = res.data.threads;
					$scope.getSingleThread($scope.threads.length - 1);
				}
			},$scope.handleRequest);
		}
	};

	$scope.getSingleThread = function(id) {
			var req = {
				method: 'GET',
				headers: {
					'Authorization': 'Bearer: ' + $scope.token
				},
				url: API + '/forum/' + $scope.courseID + '/threads/' + id + '/posts'
			};
			$http(req).then(function(res) {
				if (res.data) {
					$scope.currentThread = res.data;
					$scope.currentPosts = res.data.posts;
					console.log($scope.currentPosts);
					$scope.currentThread.created_at = new Date(res.data.created_at);
					for (var i = 0; i < res.data.posts.length; i++) {
						$scope.currentPosts[i].created_at = new Date(res.data.posts[i].created_at);
					}
				}
			},$scope.handleRequest);
	};

	$scope.$on('$viewContentLoaded', function() {
		$scope.getCourses();
		if ($routeParams.courseNumber) {
			$scope.getCourseWithID($routeParams.courseNumber);
		}
		
	});

};