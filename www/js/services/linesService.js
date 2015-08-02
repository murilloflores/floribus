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
            line.id = line.id.toString();
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

    var getLine = function(line_id) {
        for (i = 0; i < allLines.length; i++) {
            var line  = allLines[i];
            if (line.id == line_id) {
                return line;
            }
        }
    };

    var _getTimesFor = function(line, day_kind, desired_hour) {
      var times = [];

      if (line.timetables.hasOwnProperty(day_kind)) {
        var times = line.timetables[day_kind].filter(
          function(hour){
            return hour.startsWith(desired_hour);
          }
        );
      }

      return times;
    };

    var getLineTimetableByHour = function(line_id) {
      var timetable = {};
      var line = getLine(line_id);

      for(var hour=0; hour<24; hour++){
        if(hour < 10) hour = "0"+hour;
        hour = hour.toString();

        timetable[hour] = {};
        timetable[hour][1] = _getTimesFor(line, 1, hour);
        timetable[hour][2] = _getTimesFor(line, 2, hour);
        timetable[hour][3] = _getTimesFor(line, 3, hour);
        timetable[hour]['total'] = timetable[hour][1].length + timetable[hour][2].length + timetable[hour][3].length;
      }

      return timetable;
    };

    return {
        'getFavoriteLines': getFavoriteLines,
        'getAllLines': getAllLines,
        'getLine': getLine,
        'getLineTimetableByHour': getLineTimetableByHour
    }

});
