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
                    if ($scope.userRole == 'course_admin') {
                        $scope.isInstructor = true;
                    }
                }
            }
            if ($scope.courseData) {
                $interval.cancel(stopCourses);
            }
        }
    };

    $scope.getCurrentAssignment = function(id) {
        if ($scope.assignments) {
            for (var i = 0; i < $scope.assignments.length; i++) {
                if ($scope.assignments[i].id == id) {
                    $scope.quizTitle = $scope.assignments[i].title;
                    $scope.quizID = id;
                }
            }
        } else {
            $scope.getAssignmentsWithID($scope.courseID);
        }
        $scope.getIndividualQuiz(id);

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
            console.log(res.data);
        },$scope.handleRequest);
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
            $scope.getQuizzes();
        },$scope.handleRequest);
    };

    $scope.deleteAssignment = function(id) {
        var formData = {
            id: id
        };
        var req = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            data: formData,
            url: API + '/sections/' + $scope.courseID + '/deleteAssignment'
        };
        $http(req).then(function(res) {
            console.log("assignment deleted");
        },$scope.handleRequest);
    };

    $scope.updateAssignment = function(id) {
        //TODO
    };

    $scope.createAssignment = function() {
        //TODO
    };

    $scope.getQuizzes = function() {
        $scope.quizzes = [];
        $scope.quizData = [];
        for(var i = 0; i < $scope.assignments.length; i++) {
            if ($scope.assignments[i].quiz == 1) {
                $scope.quizzes.push($scope.assignments[i]);
                //$scope.getIndividualQuiz($scope.assignments[i].id);
            }
        }
    };

    $scope.getIndividualQuiz = function(id) {
        var formData = {
            id: id
        };
         var req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            url: API + '/sections/assignments/' + id
        };
        $http(req).then(function(res) {
            $scope.currentQuiz = res.data;
            console.log(res.data);
            // for (var i = 0; i < res.data.length; i++) {
            //     $scope.currentAnswers[i] = res.data[i];
            // }
        },$scope.handleRequest);

    };

    $scope.submitQuiz = function(id) {
        console.log($scope.currentAnswers);
        // var formData = {
        //     id: id
        // };
        // var req = {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': 'Bearer: ' + $scope.token
        //     },
        //     data: formData,
        //     url: API + '/sections/' + $scope.courseID + '/deleteAssignment'
        // };
        // $http(req).then(function(res) {
        //     console.log("assignment deleted");
        // },$scope.handleRequest);

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
        $scope.getAssignmentsWithID($routeParams.courseNumber);
        $scope.getCourses();
        $scope.getUser();
        $scope.getStudentsWithID($routeParams.courseNumber);
        stopCourses = $interval(function() {
            if ($routeParams.courseNumber) {
                $scope.getCourseWithID($routeParams.courseNumber);
            }
            if ($routeParams.quizNumber) {
                $scope.getCurrentAssignment($routeParams.quizNumber);
            }
        }, 50, 100);
    });

};