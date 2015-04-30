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
      stallsAvailable: function(gender) {
        return 1;
      },
      totalStalls: function(gender) {
        return 3;
      }
    }
  })

// View Main
.controller('MainController',
  function($scope, doorService) {
  })

// View Settings
.controller('CommodeController',
  function($scope, doorService, $routeParams) {
    $scope.gender = $routeParams.gender;
    $scope.numberOpen = doorService.stallsAvailable($scope.gender);
    $scope.total = doorService.totalStalls($scope.gender);


  })

.filter('humanize', 
  function() {
    return function(text) {
      if (text) {
        text = text.split("_");
        for (var i in text) {
            var word = text[i];
            word = word.toLowerCase();
            word = word.charAt(0).toUpperCase() + word.slice(1);
            text[i] = word;
        }
        return text.join(" ");
      }
    };
  })

;


