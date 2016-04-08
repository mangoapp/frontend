module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval) {
    var stopCourses;
    if (auth.getToken()) {
        $scope.token = auth.getToken();
        $scope.loggedin = true;
    } else {
        $scope.loggedin = false;
        $window.location.href = './#!/sign-in';
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
            }
        }
    };

    $scope.getAssignmentsWithID = function(id) {
        var req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            url: API + '/sections/' + $scope.courseID + '/assignments'
        };
        $http(req).then(function(res) {
            $scope.assignments = res.data;
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

    $scope.$on('$viewContentLoaded', function() {
        $scope.getCourses();
        stopCourses = $interval(function() {
            if ($routeParams.courseNumber) {
                $scope.getCourseWithID($routeParams.courseNumber);
            }
        }, 50);
    });

};