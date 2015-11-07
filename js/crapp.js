var crapp = angular.module("crapp", ["ngRoute", "ngAnimate"]);
var POLLING_PERIOD = 2000;

if (API_ENDPOINT === undefined) {
  alert("A URL must be specified in js/config.js as a string (var API_ENDPOINT = 'https://...') - this is so we don't check in the API endpoint to github.")
}

var c_green = "#2BB972";
var c_yellow = "#E8A631";
var c_red = "#DD0A17";

/*
 * This actually changes the favicon live based on the status of the selected bathroom stall.
 * It creates a canvas, pulls data from an image loaded from a PNG data string, and colors it dynamically.
 */
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
      ctx.globalAlpha = 1;
      ctx.drawImage(buffer,0,0);

      var linkImg = document.createElement('img');
      linkImg.src = canvas.toDataURL('image/png');

      var favicon = new Favico();
      favicon.image(linkImg);
    };

    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAB3RJTUUH3QkcDDoJIMSwvgAAAAlwSFlzAAAbLAAAGywB1pA84gAAAARnQU1BAACxjwv8YQUAAAFSSURBVHjaY3z06NE9Dg4ORQYo+P///7dbt27p2tra3mMgAjD9/fv3MVATAwx//fr12+fPn38RoxkEWNjZ2T9xcnLCBb5///6Un5+fmVgDmNAFWFlZb1pbWz8k2wBSAcUGsOAQZ16wYIEELk1fvnz5m5OT8wLEZrx3794Wbm5ub5jku3fvNl65cuWLrKysAS4DgLHF+Pz588lBQUEzGF+9evUHmA6IDnUYAMbWb3FxcTaWCxcu6Kqrq58GGsJNigHHjh1zAHsBRDx9+vQALy+vPQm2PwLargDyDRNUYD6xmv/8+fPtzZs3SSDNID7YgJMnT276/fv3Z3wa//379x8Y+kcfPnxora2tvRcmzghjvHjxYh8XF5cjLgPev38/T15ePhldHOyCTZs2cf38+VMQ6BUGXBjoQqGjR4+KYTVAUVHRFpipdPF5ARjI/qKiotHo4gA0+aG2O/zr9wAAAABJRU5ErkJggg==';
    //img.src = 'data:image/png;base64,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';

  }
}

function setIcon(stallsFree) {
  if (stallsFree == 0) {
    refreshIcon(c_red);
  } else if (stallsFree == 1) {
    refreshIcon(c_yellow);
  } else {
    refreshIcon(c_green);
  }
}

/*
 * Ask for permission to send notifications.
 */
function checkNotificationPermission() {
  if (Notification.permission !== 'denied'){
    Notification.requestPermission(function (permission) {
      console.log("Notification permission: " + permission);
    });
  }
}

/* Notify when the stall is free if requested. Window must be kept open.
 * Use HTML5 browser notifications; if not supported or if permission is
 * not available, use a standard JS alert() instead.
 */
function notify() {
  var msg = "It's Business Time!"
  // check if the browser supports notifications
  if(("Notification" in window) && (Notification.permission === "granted")){
    var image = 'img/commode.png';
    var options = {
      icon: image
    }
    var notification = new Notification(msg, options);
  }else{
    window.alert(msg);
  }
}

// Main Angular app
crapp
.config(function($routeProvider) {
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

// Allow us to selectively disable ng-animate
.config(function($animateProvider) {
  $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
})

// Service for polling the API endpoint
.factory('DoorService',
  function($http, $timeout) {
    var data = { response: {}, calls: 0 };

    var poller = function() {
      $http.jsonp(API_ENDPOINT+"&callback=JSON_CALLBACK").success(function(r) {
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
      }).
      error(function(data, status, headers, config, statusText) {
        console.log("Error when polling API: "+status);
        // Retry indefinitely
        $timeout(poller, POLLING_PERIOD);
      });
    };
    poller();

    return {
      data: data,
      reset: function() {
        this.data.response = {};
        this.data.calls = 0;
      }
    };
  })

// Main controller (select gender)
.controller('MainController',
  function($scope, DoorService) {
    refreshIcon("gray");
  })

// Commode controller (show status for a gender)
.controller('CommodeController',
  function($scope, DoorService, $routeParams, $window, $timeout) {
    DoorService.reset();
    $scope.gender = $routeParams.gender;
    $scope.data = DoorService.data;
    $scope.openStalls = 0;
    $scope.alertMe = false;

    $scope.numberOpen = function() {
      return $scope.data[$scope.gender];
    };

    $scope.total = function() {
      return $scope.data[$scope.gender+"Total"];
    };

    $scope.alertMeUpdated = function(){
      if($scope.alertMe){
        checkNotificationPermission();
      }
    };

    $scope.$watch("data", function(oldVal, newVal) {
      setIcon($scope.numberOpen());
      $scope.openStalls = $scope.data[$scope.gender];

      // Alert a user that has been waiting for a stall to open.
      if($scope.alertMe && ($scope.openStalls > 0)){
        $scope.alertMe = false;
        // wrap in a timeout so that the display can update with the new numbers.
        $timeout(function(){
          notify();
        });
      }

      // Wait until the first call, then tag the room viewed event with the number open
      if ($scope.data.calls == 1 && !isNaN($scope.data[$scope.gender])) {
        ll('tagEvent', 'Room Viewed',
          {
            'gender': $scope.gender,
            'stallsFree': $scope.data[$scope.gender]
          }
        );
      }
    }, true);
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

// Run the poller
.run(function(DoorService) {})

;
