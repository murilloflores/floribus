// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.controller('MyCtrl', function($scope, $http) {
  
  $scope.lines = null;
  $scope.favorites = [];

  init();

  function init() {

    if ($scope.lines == null) {
      $http.get('js/lines.json').then(function(res){
        var lines = [];
        
        for (i = 0; i < res.data.length; i++) { 
          
          line = res.data[i];
          line.isFavorite = false;
          line.display = false;

          lines.push(updateHours(line));

        }

        $scope.lines = lines;

      });
    } else {

      for (i = 0; i < $scope.lines.length; i++) { 
        line = $scope.lines[i];
        updateHours(line);
      }

    }

    $scope.$broadcast('scroll.refreshComplete');

  };


  updateHours = function(line) {
    var day_kinds = ['3', '1', '1', '1', '1', '1', '2'];
    
    var now = new Date();
    var now_str = now.toTimeString().substr(0,5)
    var today_day_kind = day_kinds[now.getDay()];

    if (!line.timetables.hasOwnProperty(today_day_kind)) {
      line.nexthours = null;
    } else {
      line.nexthours = line.timetables[today_day_kind].filter(function(hour){ return hour > now_str });
    }

    return line;
  };

  refreshFavorites = function() {
    var favorites = [];

    for (i = 0; i < $scope.lines.length; i++) { 
        line = $scope.lines[i];
        if (line.isFavorite) {
          favorites.push(line);
        }
    }

    $scope.favorites = favorites;
    console.log($scope.favorites);
  };

  $scope.doRefresh = function(){
    setTimeout(init, 500);
  };

  $scope.expandHour = function(line) {
    line.display = !line.display;
  };

  $scope.addFavorite = function(line) {
    line.isFavorite = true;
    refreshFavorites();
  };

  $scope.removeFavorite = function(line) {
    line.isFavorite = false;
    refreshFavorites();
  };

})
