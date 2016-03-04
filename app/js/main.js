(function () {

'use strict';

  require('angular');
  require('angular-route');
  require('angular-animate');

  var UserCtrl = require('../controllers/user.js');
  var CourseCtrl = require('../controllers/courses.js');
  var authService = require('../js/auth.js');
  var authInterceptor = require('../js/interceptor.js');


  angular.module('mango', ['ngRoute', 'ngAnimate'])
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
        .when("/courses/:courseNumber", {
            templateUrl: "./views/courses/course.html",
            controller: "CourseCtrl"
        })
        .when("/my-profile", {
          templateUrl: "./views/users/my-profile.html",
          controller: "UserCtrl"
        })
        .otherwise({
           redirectTo: '/sign-in'
        });
    }
  ])

  //Load controller
  .controller('UserCtrl', ['$scope', '$http', 'API', 'auth', '$window', UserCtrl])
  .controller('CourseCtrl', ['$scope', '$http', 'API', 'auth', '$window', '$routeParams', '$ngSanitize', CourseCtrl]);

}());