angular.module('floribus.services', []).factory('lines', function($q, $http) {

    var allLines = [];
    
    var getFavoriteLines = function() {
        return JSON.parse(window.localStorage['favoriteLines'] || '[]');
    };

    var getAllLines = function() {
        var deferred = $q.defer();
        
        if(allLines.length > 0) return deferred.resolve(allLines);

        $http({
          url: 'js/lines.json',
          method: 'GET',
          transformResponse: undefined
        }).then(function(response){
          var lines = response.data.split('\n');
          var tempAllLines = [];
          var favoriteLines = getFavoriteLines();

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

          allLines = tempAllLines;
          deferred.resolve(allLines);
        });

        return deferred.promise;
    };

    return {
        'getFavoriteLines': getFavoriteLines,
        'getAllLines': getAllLines
    }

});