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
  
  $scope.allLines = [];
  $scope.mainLines = [];
  $scope.favoriteLines = [];
  $scope.searchResults = [];
  $scope.searchActive = false;

  // Workaround
  $scope.searchForm = {};

  function init() {
    $http.get('js/lines.json').then(function(response){

      var tempAllLines = [];
      var favoriteLines = getFavoriteLinesFromLocalStorage();

      for (i = 0; i < response.data.length; i++) { 
        var line = response.data[i];
        
        line.isFavorite = false;
        line.displayHours = false;

        if(favoriteLines.indexOf(line.id) > -1) {
          line.isFavorite = true;
        }

        tempAllLines.push(line);
      }

      $scope.allLines = tempAllLines;

      refreshFavoriteAndMainLines();
      refreshAllLinesHours();

    });
  };

  $scope.doRefresh = function(){
    setTimeout(refreshWrapper, 500);
  };

  $scope.onSearch = function() {
    $scope.searchActive = true;
  };

  $scope.outOfSearch = function(){
    $scope.searchActive = false;
    $scope.searchResults = [];
    $scope.searchForm.query = "";
  };

  $scope.searchKeypress = function(event){
    if(event.keyCode === 13){
      console.log($scope.searchForm.query);
      $scope.searchResults = doSearch();
    }
  };

  function doSearch() {

    var results = [];

    for (var i = 0; i < $scope.allLines.length; i++) { 
      line = $scope.allLines[i];
      if (matchesSearchQuery(line)){
        results.push(line);
      }
    }    

    return results;
  };

  function matchesSearchQuery(line) {

    if(line.number === $scope.searchForm.query){
      return true;
    }

    var pieces = $scope.searchForm.query.toLowerCase().split(" ").filter(function(el) {return el.trim().length > 0} );
    for(var i=0; i< pieces.length; i++){
      var piece = pieces[i];
      if(line.name.toLowerCase().indexOf(piece) === -1){
        return false;
      }
    }

    return true;

  };

  function refreshWrapper() {
    refreshAllLinesHours();
    $scope.$broadcast('scroll.refreshComplete');
  };

  function refreshAllLinesHours(){
    
    for (var i = 0; i < $scope.allLines.length; i++) { 
      line = $scope.allLines[i];
      updateHours(line);
    }

  };

  function updateHours(line) {
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

  $scope.addFavorite = function(line) {
    line.isFavorite = true;
    
    var favoriteLines = getFavoriteLinesFromLocalStorage();
    favoriteLines.push(line.id);
    setFavoriteLinesInLocalStorage(favoriteLines);
    
    refreshFavoriteAndMainLines();
  };

  $scope.removeFavorite = function(line) {
    line.isFavorite = false;
    
    var favoriteLines = getFavoriteLinesFromLocalStorage();
    favoriteLines = favoriteLines.filter(function(line_id) { return !(line_id === line.id ); } );
    setFavoriteLinesInLocalStorage(favoriteLines);

    refreshFavoriteAndMainLines();
  };

  function getFavoriteLinesFromLocalStorage() {
    return JSON.parse(window.localStorage['favoriteLines'] || '[]');
  };

  function setFavoriteLinesInLocalStorage(favoriteLines) {
    window.localStorage['favoriteLines'] = JSON.stringify(favoriteLines);
  };

  function refreshFavoriteAndMainLines() {

    tempFavoriteLines = [];
    tempMainLines = [];

    for (var i = 0; i < $scope.allLines.length; i++) { 
      line = $scope.allLines[i];
      
      if(line.isFavorite){
        tempFavoriteLines.push(line);
      } else {
        tempMainLines.push(line);
      }

    }

    $scope.favoriteLines = tempFavoriteLines;
    $scope.mainLines = tempMainLines;

  };


  $scope.expandHour = function(line) {
    line.display = !line.display;
  };

  // Calling main function 
  init();

})
