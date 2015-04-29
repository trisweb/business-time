var crapp = angular.module("crapp", ["ngRoute", "ngAnimate"]);

crapp.config(
  function($routeProvider) {
    $routeProvider
      .when('/', {
        controller:'MainController',
        templateUrl:'js/templates/main.html'
      })
      .when('/:gender', {
        controller: 'CommodeController',
        templateUrl: 'js/templates/commode.html'
      })
      .otherwise({
        redirectTo:'/'
      });
  })

// Service for polling the API endpoint
// TODO
.service('doorService',
  function() {
    return {
    }
  })

// View Main
.controller('MainController',
  function($scope, doorService) {

  })

// View Settings
.controller('SettingsController',
  function($scope, doorService) {
  })

;


