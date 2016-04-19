module.exports = function($scope,$http,API,auth,$window,$routeParams,$timeout,$interval,$filter,Upload) {
    var stopCourses;
    $scope.quizQuestions = [];
    $scope.placeAnswers = ["Enter Answer Choice 1","Enter Answer Choice 2","Enter Answer Choice 3","Enter Answer Choice 4"];
    $scope.currentAnswers = new Array(4);
    $scope.correctAnswer = "";
    $scope.newQuizTitle = "";
    $scope.quizDeadline = "";
    $scope.categoryType = "";
    $scope.pointValue = "";


    $scope.assignmentUpload = "";
    $scope.assignmentTitle = "";
    $scope.assignmentDescription = "";
    $scope.assignmentDeadline = "";

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
                $scope.getCategories();
                $interval.cancel(stopCourses);
            }
        }
    };

    $scope.getCurrentAssignment = function(id) {
        if ($scope.assignments) {
            for (var i = 0; i < $scope.assignments.length; i++) {
                if ($scope.assignments[i].id == id) {
                    $scope.quizTitle = $scope.assignments[i].title;
                    $scope.quizID = $scope.assignments[i].id;
                }
            }
        } else {
            $scope.getAssignmentsWithID($scope.courseID);
        }
        $scope.getIndividualQuiz(id);
    };

    $scope.getActiveAssignment = function(id) {
        if ($scope.assignments) {
            for (var i = 0; i < $scope.assignments.length; i++) {
                if ($scope.assignments[i].id == id) {
                    $scope.getUploads(id);
                    $scope.assignmentTitle = $scope.assignments[i].title;
                }
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
            for (var i = 0; i < $scope.assignments.length; i++) {
                $scope.assignments[i].deadline = new Date($scope.assignments[i].deadline);
            }
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


    $scope.getQuizzes = function() {
        $scope.quizzes = [];
        $scope.quizData = [];
        $scope.quizTitle = "";
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
            $scope.currentAnswers = new Array(res.data.length);
            for (var i = 0; i < res.data.length; i++) {
                $scope.currentAnswers[i] = "hello";
            }
            //console.log(res.data);
            
        },$scope.handleRequest);

    };

    $scope.submitQuiz = function(id) {
        console.log('[' + $scope.currentAnswers.toString() + ']');
        var formData = {
            assignment_id: id,
            answers: '[' + $scope.currentAnswers.toString() + ']'
        };
        var req = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            data: formData,
            url: API + '/sections/' + $scope.courseID + '/submitQuiz'
        };
        console.log(req);
        $http(req).then(function(res) {
            console.log(res.data);
            console.log("quiz submitted");
            $window.location.href = './#!/courses/' + $scope.courseID;
        },$scope.handleRequest);

    };

    $scope.addQuestion = function() {
        if (($scope.newQuizTitle.length !== 0)) {
            $scope.newQuestion = {
                "question": $scope.newQuizTitle,
                "answers": $scope.currentAnswers,
                "correctAnswer": $scope.correctAnswer
            };
            console.log($scope.newQuestion);
            $scope.quizQuestions.push($scope.newQuestion);
        }
        delete $scope.newQuestion;
        $scope.correctAnswer = "";
        $scope.newQuizTitle = "";
        $scope.currentAnswers = new Array(4);

    };

    $scope.checkedQuestion = function(index) {
        $scope.correctAnswer = index;
    };

    $scope.createQuiz = function() {
        $scope.quizDeadline = new Date($scope.quizDeadline);
        var formattedDeadline = $filter('date')($scope.quizDeadline, 'yyyy-MM-dd HH:mm');
        var formData = {
            title: $scope.quizTitle,
            description: "Quiz for course id: " + $scope.courseID,
            filesubmission: 0,
            quiz: 1,
            data: $scope.quizQuestions.toString(),
            category_id: $scope.categoryType,
            max_score: $scope.pointValue,
            deadline: formattedDeadline
        };
        var req = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            data: formData,
            url: API + '/sections/' + $scope.courseID + '/assignments'
        };
        $http(req).then(function(res) {
            console.log(res.data);
            $window.location.href = './#!/quizzes/' + $scope.courseID;
        },$scope.handleRequest);
    };

    $scope.createAssignment = function() {
        $scope.assignmentDeadline = new Date($scope.assignmentDeadline);
        var formattedDeadline = $filter('date')($scope.assignmentDeadline, 'yyyy-MM-dd HH:mm');
        var formData = {
            title: $scope.assignmentTitle,
            description: $scope.assignmentDescription,
            filesubmission: $scope.assignmentUpload,
            quiz: 0,
            data: 0,
            category_id: $scope.categoryType,
            max_score: $scope.pointValue,
            deadline: formattedDeadline
        };
        var req = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            data: formData,
            url: API + '/sections/' + $scope.courseID + '/assignments'
        };
        console.log(req);
        $http(req).then(function(res) {
            console.log(res.data);
            $window.location.href = './#!/assignments/' + $scope.courseID;
        },$scope.handleRequest);
    };

    $scope.deleteQuiz = function(id) {
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
            $window.location.href = './#!/courses/' + $scope.courseID;
        },$scope.handleRequest);
    };

    $scope.getCategories = function() {
        var req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            url: API + '/sections/' + $scope.courseID + '/categories'
        };
        $http(req).then(function(res) {
            $scope.categories = res.data;
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

    $scope.uploadFiles = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: 'http://mango.kedarv.com/v1/assignments/' + $routeParams.assignmentNumber + '/upload',
                method: 'POST',
                headers: {
                'Authorization': 'Bearer: ' + $scope.token
                },
                data: {file: file}
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    $window.location.href = './#!/courses/' + $scope.courseID;
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * 
                   evt.loaded / evt.total));
            });
        }   
    };

    $scope.getUploads = function(id) {
        ///v1/assignments/{assignment_id}/uploads
        var req = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer: ' + $scope.token
            },
            url: API + '/assignments/' + id + '/uploads'
        };
        $http(req).then(function(res) {
            console.log(res.data);
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
            if ($routeParams.assignmentNumber) {
                $scope.getActiveAssignment($routeParams.assignmentNumber);
            }
        }, 50, 100);
    });

};