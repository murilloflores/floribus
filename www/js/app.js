
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('floribus', ['ionic', 'floribus.controllers'])

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

.config(function($ionicConfigProvider) {
  $ionicConfigProvider.backButton.text('');
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "menu.html",
    controller: 'MenuCtrl'
  })

  .state('app.main', {
    url: "/main?reload",
    views: {
      'menuContent': {
        templateUrl: "main.html",
        controller: 'FloribusCtrl'
      }
    }
  })

  .state('app.line', {
    url: '/line/:id/:dayKind',
    views: {
      'menuContent': {
        templateUrl: 'line.html',
        controller: 'LineCtrl'
      }
    }
  })

  .state('intro', {
    url: "/intro",
    cache: false,
    templateUrl: "intro.html",
    controller: 'IntroCtrl'
  })

  // if none of the above states are matched, use this as the fallback
  var firstUsage = JSON.parse(window.localStorage['firstUsage'] || 'true');
  if (firstUsage ){
    $urlRouterProvider.otherwise('/intro');
  } else {
    $urlRouterProvider.otherwise('/app/main');
  }

});
