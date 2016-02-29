(function () {

'use strict';

  require('angular');
  require('angular-route');
  require('angular-animate');

  var UserCtrl = require('../controllers/user.js');


  angular.module('mango', ['ngRoute', 'ngAnimate'])

  .config([
    '$locationProvider',
    '$routeProvider',
    function($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      // routes
      $routeProvider
        .when("/sign-in", {
          templateUrl: "./views/signin.html",
          controller: "UserCtrl"
        })
        .when("/sign-up", {
          templateUrl: "./views/signup.html",
          controller: "UserCtrl"
        })
        .when("/forgot-password", {
          templateUrl: "./views/forgot-password.html",
          controller: "UserCtrl"
        })
        .otherwise({
           redirectTo: '/sign-in'
        });
    }
  ])

  //Load controller
  .controller('UserCtrl', ['$scope', UserCtrl]);

}());