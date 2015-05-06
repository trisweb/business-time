var crapp = angular.module("crapp", ["ngRoute", "ngAnimate"]);
var POLLING_PERIOD = 2000;

if (URL === undefined) {
  alert("A URL must be specified in js/config.js as a string (var URL = 'https://...') - this is so we don't check in the API endpoint to github.")
}

function refreshIcon(color) {
  var canvas = document.createElement('canvas'),
      ctx,
      img = document.createElement('img'),
      link = document.getElementById('favicon').cloneNode(true)

  if (canvas.getContext) {
    canvas.height = canvas.width = 16; // set the size
    ctx = canvas.getContext('2d');

    img.onload = function () { // once the image has loaded
      ctx = canvas.getContext('2d');
      width = ctx.canvas.width;
      height = ctx.canvas.height;

      buffer = document.createElement('canvas');
      buffer.width = img.width;
      buffer.height = img.height;
      bx = buffer.getContext('2d');

      bx.fillStyle = color;
      bx.fillRect(0,0,buffer.width,buffer.height);

      bx.globalCompositeOperation = "destination-atop";
      bx.drawImage(img,0,0);

      ctx.drawImage(img,0,0);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(buffer,0,0);

      var linkImg = document.createElement('img');
      linkImg.src = canvas.toDataURL('image/png');

      var favicon = new Favico();
      favicon.image(linkImg);
    };

    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAB3RJTUUH3QkcDDoJIMSwvgAAAAlwSFlzAAAbLAAAGywB1pA84gAAAARnQU1BAACxjwv8YQUAAAFSSURBVHjaY3z06NE9Dg4ORQYo+P///7dbt27p2tra3mMgAjD9/fv3MVATAwx//fr12+fPn38RoxkEWNjZ2T9xcnLCBb5///6Un5+fmVgDmNAFWFlZb1pbWz8k2wBSAcUGsOAQZ16wYIEELk1fvnz5m5OT8wLEZrx3794Wbm5ub5jku3fvNl65cuWLrKysAS4DgLHF+Pz588lBQUEzGF+9evUHmA6IDnUYAMbWb3FxcTaWCxcu6Kqrq58GGsJNigHHjh1zAHsBRDx9+vQALy+vPQm2PwLargDyDRNUYD6xmv/8+fPtzZs3SSDNID7YgJMnT276/fv3Z3wa//379x8Y+kcfPnxora2tvRcmzghjvHjxYh8XF5cjLgPev38/T15ePhldHOyCTZs2cf38+VMQ6BUGXBjoQqGjR4+KYTVAUVHRFpipdPF5ARjI/qKiotHo4gA0+aG2O/zr9wAAAABJRU5ErkJggg==';
  }
}

function setIcon(stallsFree) {
  console.log("Setting icon - " + stallsFree);
  if (stallsFree == 0) {
    refreshIcon("red");
  } else if (stallsFree == 1) {
    refreshIcon("yellow");
  } else {
    refreshIcon("green");
  }
}

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
.factory('DoorService',
  function($http, $timeout) {
    var data = { response: {}, calls: 0 };
    var poller = function() {
      $http.jsonp(URL+"&callback=JSON_CALLBACK").success(function(r) {
        data.response = r;
        data.calls++;

        data.men = 0;
        data.women = 0;

        // Not gonna calculate these lol
        data.menTotal = 2;
        data.womenTotal = 3;

        if (typeof(r) != 'object') {
          console.log("Error getting a result from the API! Go yell at Randy.")
        } else {
          // Process the response
          for (var i=0; i < r.length; i++) {
            var item = r[i];
            if (item.value == "open") {
              if (item.name.substring(0,1) == "M") {
                data.men++;
              } else {
                data.women++;
              }
            }
          }
        }

        $timeout(poller, POLLING_PERIOD);
      });
    };
    poller();

    return {
      data: data
    };
  })

// View Main
.controller('MainController',
  function($scope, DoorService) {
  })

// View Settings
.controller('CommodeController',
  function($scope, DoorService, $routeParams) {
    $scope.gender = $routeParams.gender;
    $scope.data = DoorService.data;

    $scope.numberOpen = function() {
      return $scope.data[$scope.gender];
    };

    $scope.total = function() {
      return $scope.data[$scope.gender+"Total"];
    };

    $scope.$watch("data."+$scope.gender, function(oldVal, newVal) {
      console.log("Updated", $scope.numberOpen());
      setIcon($scope.numberOpen());
    });
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

.run(function(DoorService) {})

;


