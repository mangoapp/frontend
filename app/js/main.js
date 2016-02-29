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
        .when("/login", {
          templateUrl: "./views/login.html",
          controller: "UserCtrl"
        })
        .when("/register", {
          templateUrl: "./views/register.html",
          controller: "UserCtrl"
        })
        .when("/forgot-password", {
          templateUrl: "./views/forgot-password.html",
          controller: "UserCtrl"
        })
        .otherwise({
           redirectTo: '/login'
        });
    }
  ])

  //Load controller
  .controller('UserCtrl', ['$scope', UserCtrl]);

}());