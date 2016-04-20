(function () {

'use strict';

  require('angular');
  require('angular-route');
  require('angular-animate');
  require('angular-sanitize');
  require('ng-file-upload');
  require('angular-ui-calendar');

  var UserCtrl = require('../controllers/user.js');
  var CourseCtrl = require('../controllers/courses.js');
  var GradesCtrl = require('../controllers/grades.js');
  var DiscussionCtrl = require('../controllers/discussion.js');
  var PollCtrl = require('../controllers/polls.js');
  var AssignmentCtrl = require('../controllers/assignments.js');
  var CalendarCtrl = require('../controllers/calendar.js');
  var authService = require('../js/auth.js');
  var authInterceptor = require('../js/interceptor.js');


  angular.module('mango', ['ngRoute', 'ngAnimate', 'ngSanitize', 'ngFileUpload', 'ui.calendar'])
  .constant('API', 'http://mango.kedarv.com/v1')
  .service('auth', ['$window', authService])
  .factory('authInterceptor', ['API', 'auth', authInterceptor])

  .config([
    '$locationProvider',
    '$routeProvider',
    '$httpProvider',
    function($locationProvider, $routeProvider, $httpProvider) {
      $locationProvider.hashPrefix('!');
      // routes
      $routeProvider
        .when("/sign-in", {
          templateUrl: "./views/users/signin.html",
          controller: "UserCtrl"
        })
        .when("/sign-up", {
          templateUrl: "./views/users/signup.html",
          controller: "UserCtrl"
        })
        .when("/forgot-password", {
          templateUrl: "./views/users/forgot-password.html",
          controller: "UserCtrl"
        })
        .when("/courses", {
          templateUrl: "./views/courses/courses.html",
          controller: "CourseCtrl"
        })
        .when("/courses/new", {
            templateUrl: "./views/courses/create-course.html",
            controller: "CourseCtrl"
        })
        .when("/courses/:courseNumber", {
            templateUrl: "./views/courses/course.html",
            controller: "CourseCtrl"
        })
        .when("/courses/:courseid/users", {
          templateUrl: "./views/courses/users.html",
          controller: "CourseCtrl"
        })
        .when("/quizzes/:courseNumber", {
          templateUrl: "./views/quizzes/quizzes.html",
          controller: "AssignmentCtrl"
        })
        .when("/quizzes/:courseNumber/new", {
          templateUrl: "./views/quizzes/new-quiz.html",
          controller: "AssignmentCtrl"
        })
        .when("/quizzes/update/:quizNumber", {
          templateUrl: "./views/quizzes/update-quiz.html",
          controller: "AssignmentCtrl"
        })
        .when("/quizzes/:courseNumber/take/:quizNumber", {
          templateUrl: "./views/quizzes/take-quiz.html",
          controller: "AssignmentCtrl"
        })
        .when("/grades", {
          templateUrl: "./views/grades/grades.html",
          controller: "GradesCtrl"
        })
        .when("/grades/:courseNumber", {
            templateUrl: "./views/grades/grade.html",
            controller: "GradesCtrl"
        })
        .when("/course", {
          templateUrl: "./views/courses/student-course.html",
          controller: "CourseCtrl"
        })
        .when("/notifications", {
          templateUrl: "./views/users/notifications.html",
          controller: "CourseCtrl"
        })
        .when("/discussion/:courseNumber", {
          templateUrl: "./views/discussion/main.html",
          controller: "DiscussionCtrl"
        })
        .when("/discussion/:courseNumber/new", {
          templateUrl: "./views/discussion/new.html",
          controller: "DiscussionCtrl"
        })
        .when("/polls/:courseNumber", {
          templateUrl: "./views/polls/main.html",
          controller: "PollCtrl"
        })
        .when("/polls/:courseNumber/new", {
          templateUrl: "./views/polls/new.html",
          controller: "PollCtrl"
        })
        .when("/polls/:courseNumber/:pollNumber", {
          templateUrl: "./views/polls/take-poll.html",
          controller: "PollCtrl"
        })
        .when("/profile", {
          templateUrl: "./views/users/my-profile.html",
          controller: "UserCtrl"
        })
        .when("/announcements", {
          templateUrl: "./views/courses/announcements.html",
          controller: "CourseCtrl"
        })
        .when("/courses/:courseNumber/content", {
          templateUrl: "./views/courses/content.html",
          controller: "CourseCtrl"
        })
        .when("/assignments/:courseNumber", {
          templateUrl: "./views/assignments/assignments.html",
          controller: "AssignmentCtrl"
        })
        .when("/assignments/:courseNumber/new", {
          templateUrl: "./views/assignments/new.html",
          controller: "AssignmentCtrl"
        })
        .when("/assignments/:courseNumber/:assignmentNumber", {
          templateUrl: "./views/assignments/assignment.html",
          controller: "AssignmentCtrl"
        })
        .when("/calendar", {
          templateUrl: "./views/calendar/calendar.html",
          controller: "CalendarCtrl"
        })
        .when("/calendar/:courseNumber", {
          templateUrl: "./views/calendar/calendar.html",
          controller: "CalendarCtrl"
        })
        .otherwise({
           redirectTo: '/courses'
        });
    }
  ])

  //Load controller
  .controller('UserCtrl', ['$scope', '$http', 'API', 'auth', '$window', '$timeout', '$interval', UserCtrl])
  .controller('CourseCtrl', ['$scope', '$http', 'API', 'auth', '$window', '$routeParams', '$timeout', '$interval', CourseCtrl])
  .controller('GradesCtrl', ['$scope', '$http', 'API', 'auth', '$window', '$routeParams', '$timeout', '$interval', GradesCtrl])
  .controller('DiscussionCtrl', ['$scope', '$http', 'API', 'auth', '$window', '$routeParams', '$timeout', '$interval', DiscussionCtrl])
  .controller('PollCtrl', ['$scope', '$http', 'API', 'auth', '$window', '$routeParams', '$timeout', '$interval', PollCtrl])
  .controller('AssignmentCtrl', ['$scope', '$http', 'API', 'auth', '$window', '$routeParams', '$timeout', '$interval', '$filter', 'Upload', AssignmentCtrl])
  .controller('CalendarCtrl', ['$scope', '$http', 'API', 'auth', '$window', '$routeParams', '$timeout', '$interval', 'ui.calendar', CalendarCtrl]);

}());