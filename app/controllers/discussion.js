module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval) {
	var stopCourses;
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
				$scope.getCourseThreads();
			}
		}
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
					console.log($scope.threads);
					$scope.getSingleThread(res.data.threads[res.data.threads.length-1].id);
				}
			},$scope.handleRequest);
		}
	};

	$scope.makeEditable = function(index) {
		$scope.newReplyBody = $scope.currentPosts[index].body;
		$scope.editablePosts[index] = !$scope.editablePosts[index];
	};

	$scope.editPost = function(section_id, post_id, body, anonymous) {
		if (anonymous != "1") {
			anonymous = "0";
		}
		var formData = {
			section_id: section_id,
			post_id: post_id,
			body: body,
			anonymous: anonymous
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/forum/posts/update'
		};
		$http(req).then(function(res) {
			if (res.data) {
				$scope.getCourseThreads();
			}
		},$scope.handleRequest);
	};

	$scope.deletePost = function(section_id, post_id) {
		var formData = {
			section_id: section_id,
			post_id: post_id
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/forum/posts/delete'
		};
		$http(req).then(function(res) {
			if (res.data) {
				$scope.getCourseThreads();
			}
		},$scope.handleRequest);

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
				$scope.currentPosts = res.data.posts.slice().reverse();
				$scope.editablePosts = [];
				$scope.currentThread.created_at = new Date(res.data.created_at);
				for (var i = 0; i < res.data.posts.length; i++) {
					$scope.currentPosts[i].created_at = new Date(res.data.posts[i].created_at);
					$scope.editablePosts[i] = false;
				}
				console.log($scope.currentThread);
			}
		},$scope.handleRequest);
	};

	$scope.replyToThread = function(replyBody,anon) {
		if (!anon) {
			anon = 0;
		}
		var formData = {
			section_id: $scope.courseID,
			thread_id: $scope.currentThread.id,
			body: replyBody,
			anonymous: anon,
			reply_id: $scope.currentPosts.length + 1
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/forum/posts'
		};
		$http(req).then(function(res) {
			console.log("Reply sent");
			$scope.getSingleThread($scope.currentThread.id);
		},$scope.handleRequest);
	};

	$scope.upvote = function(id) {
		var formData = {
			section_id: $scope.courseID,
			post_id: id
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/forum/like'
		};
		$http(req).then(function(res) {
			$scope.getSingleThread($scope.currentThread.id);
		},$scope.handleRequest);
	};

	$scope.downvote = function(id) {
		var formData = {
			section_id: $scope.courseID,
			post_id: id
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/forum/unlike'
		};
		$http(req).then(function(res) {
			$scope.getSingleThread($scope.currentThread.id);
		},$scope.handleRequest);
	};

	$scope.getLikes = function(id) {
		var formData = {
			section_id: $scope.courseID,
			post_id: id
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/forum/numLike'
		};
		$http(req).then(function(res) {
		},$scope.handleRequest);

	};

	$scope.postToThread = function(title,body,anon, pin) {
		if (!anon) {
			anon = 0;
		}
		if (!pin) {
			pin = 0;
		}
		var formData = {
			section_id: $scope.courseID,
			title: title,
			body: body,
			anonymous: anon,
			sticky: pin
		};
		var req = {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer: ' + $scope.token
			},
			data: formData,
			url: API + '/forum/threads'
		};
		$http(req).then(function(res) {
			$scope.getCourseThreads();
			$window.location.href = './#!/discussion/' + $routeParams.courseNumber;
		},$scope.handleRequest);
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