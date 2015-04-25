angular.module('nalata.controllers', ['txx.diacritics'])

.controller('MenuCtrl', function($scope) {


})


.controller('IntroCtrl', function($scope, $state) {

  // Called to navigate to the main app
  $scope.startApp = function() {
    window.localStorage['firstUsage'] = false;
    $state.go('app.main');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;

    gifs = ['','img/intro/proximos.gif','img/intro/anteriores.gif','img/intro/favoritos.gif']
    $scope.currentGif = gifs[index];

  };

})

.controller('NalataCtrl', function($scope, $http, $ionicScrollDelegate, $timeout, $ionicModal , removeDiacritics) {
  
  $scope.allLines = [];
  $scope.mainLines = [];
  $scope.favoriteLines = [];
  $scope.searchResults = [];
  $scope.searchActive = false;

  $scope.dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  $scope.dayKinds = ['3', '1', '1', '1', '1', '1', '2'];
  $scope.dayKindNames = { '1': 'Dias úteis', '2': 'Sábados', '3': 'Domingos e feriados'};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('select_day_kind.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.selectDayModal = modal;
  });

  // Workaround
  $scope.searchForm = {};

  function init() {

    $scope.dayName = getDayName();
    $scope.dayKind = getDayKind();
    $scope.dayKindName = getDayKindName();

    $http({
      url: 'js/lines.json',
      method: 'GET',
      transformResponse: undefined
    }).then(function(response){
      var lines = response.data.split('\n');
      var tempAllLines = [];
      var favoriteLines = getFavoriteLinesFromLocalStorage();

      for (i = 0; i < lines.length; i++) { 
        
        // When the input file is splitted, the last element is empty
        if(lines[i].trim() === '') {
          continue;
        }

        var line = JSON.parse(lines[i]);
        line.isFavorite = false;
        line.renderNextHours = false;
        line.showingNextHoursOnScreen = false;

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

  function getDayName(){
    return $scope.dayNames[new Date().getDay()];
  };

  function getDayKind() {
    return $scope.dayKind  || $scope.dayKinds[new Date().getDay()];
  };

  function getDayKindName() {
    return $scope.dayKindNames[getDayKind()];
  };

  $scope.setDayKind = function(dayKind) {
    $scope.dayKind = dayKind;
    $scope.dayKindName = getDayKindName();
    refreshAllLinesHours();
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
      $scope.searchResults = doSearch();
    } else {
      debouncedSearch();
    }

  };

  var debouncedSearch = ionic.debounce(function(){
    if ($scope.searchForm.query.length < 3){ return; }
    $timeout(function(){ $scope.searchResults = doSearch(); });
  }, 500);

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

    var searchString = removeDiacritics.replace($scope.searchForm.query);
    var searchStringPieces = searchString.toLowerCase().split(" ").filter(function(el) {return el.trim().length > 0} );

    var searcheable_field_string = line['searcheable_field'].join(' ');

    for(var i=0; i< searchStringPieces.length; i++){
      var piece = searchStringPieces[i];
      if(searcheable_field_string.indexOf(piece) === -1){
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
      updatePreviousAndNextHours(line);
    }

  };

  function updatePreviousAndNextHours(line) {
    updatePreviousHours(line);
    updateNextHours(line);
    return line;
  };

  function updatePreviousHours(line) {
    line.previousHours = getLineHours(line, -1, 3, 3);
  };

  function updateNextHours(line){
    line.nextHours = getLineHours(line, 1, 10);
  };

  function getLineHours(line, direction, minimum, maximum) {
    var isPreviousHours = direction == -1;
    var lineHours = getHoursForToday(line, isPreviousHours);

    if (lineHours.length < minimum){

      var difference = minimum - lineHours.length;
      var otherDaysHours = getOtherDaysHours(line, direction, difference);

      if(isPreviousHours){
        lineHours = otherDaysHours.concat(lineHours); 
      } else {
        lineHours = lineHours.concat(otherDaysHours); 
      }

    }
    
    if (direction == -1) {
      return lineHours.slice(maximum * -1);
    }

    return lineHours.slice(0, maximum);
    
  }

  function getOtherDaysHours(line, direction, minimun) {
    var day_kinds = ['3', '1', '1', '1', '1', '1', '2'];
    
    var otherDaysHours = [];
    var otherDayCount = 1 ;

    while(otherDaysHours.length < minimun){
      
      var currentDate = new Date(new Date().getTime() + (direction * otherDayCount * 24 * 60 * 60 * 1000));
      var currentDayName = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][currentDate.getDay()];

      if(otherDayCount == 1){
        currentDayName = direction == 1 ? 'Amanhã' : 'Ontem';
      }
      
      var day_kind = day_kinds[currentDate.getDay()];
      
      if (!line.timetables.hasOwnProperty(day_kind)) {
        otherDayCount = otherDayCount + 1;
        continue;
      }

      var nextHours = angular.copy(line.timetables[day_kind]);
      
      if (direction == -1){
        nextHours = nextHours.reverse();
      }

      for(var i = 0; i < nextHours.length; i++){
        if(direction == -1 ){
          otherDaysHours.unshift({'hour': nextHours[i], 'label': currentDayName});
        } else {
          otherDaysHours.push({'hour': nextHours[i], 'label': currentDayName});
        }
      }

      otherDayCount = otherDayCount + 1;

    }

    if(direction == -1) {
      return otherDaysHours.slice((minimun * -1)); 
    }

    return otherDaysHours.slice(0, minimun);

  };

  function getHoursForToday(line, previous) {
    // If previous, return the previous hours. If not, return the next
    previous = previous || false;

    var day_kinds = ['3', '1', '1', '1', '1', '1', '2'];
    
    var now = new Date();
    var now_str = now.toTimeString().substr(0,5)
    var today_day_kind = getDayKind();

    if (!line.timetables.hasOwnProperty(today_day_kind)) {
      return [];
    } else {
      
      var nextHours = line.timetables[today_day_kind].filter(
        function(hour){
          
          if(previous){
            return hour < now_str 
          }

          return hour > now_str
        }
      );

      var nextHoursWithLabels = [];
      for(var i = 0; i< nextHours.length; i++){
        nextHoursWithLabels.push({'hour': nextHours[i], 'label': 'Hoje'});
      }

      return nextHoursWithLabels;
    }

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

  $scope.showNextHours = function(line) {
    line.renderNextHours = true;
  };

  $scope.hideNextHours = function(line) {
    line.showingNextHoursOnScreen = false;
    // Since ng-if is faster than ng-class, we have to intentionally run it later.
    // If we do not run it later, the elements 'flick' on the screen.
    $timeout(function() { line.renderNextHours = false; }, 200);
  };

  $scope.scrollScroll = function(line) {

    // Using collection-repeat (ionic specific) causes the first execution to receive a undefined element
    // See http://forum.ionicframework.com/t/v1-0-0-beta-11-collection-repeat-doesnt-work-with-directives/8267/18
    if (line === undefined){ return };

    $timeout(function() {
      var scrollId = 'nexthours-scroll-' + line.id;
      var delegate = $ionicScrollDelegate.$getByHandle(scrollId);
      var yPosition = (line.previousHours.length * 65);
      delegate.scrollTo(yPosition);
      
      $timeout(function() {
        line.showingNextHoursOnScreen = true;
      });
    });

  };

  // Triggered in the login modal to close it
  $scope.closeSelectDay = function() {
    $scope.selectDayModal.hide();
  };

  // Open the login modal
  $scope.selectDay = function() {
    $scope.selectDayModal.show();
  };


  // Calling main function 
  init();

})
