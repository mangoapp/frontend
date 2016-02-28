(function () {

'use strict';

  require('angular');
  require('angular-route');
  require('angular-animate');


  angular.module('mango', ['ngRoute', 'ngAnimate'])

  .config([
    '$locationProvider',
    '$routeProvider',
    function($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      // routes
      $routeProvider
        .when("/login", {
          templateUrl: "./partials/login.html",
          controller: "main"
        })
        .otherwise({
           redirectTo: '/'
        });
    }
  ]);

  //Load controller
  angular.module('mango')

  .controller('main', [
    '$scope',
    function($scope) {
      $scope.test = "Testinfdasg...";
    }
  ]);

}());