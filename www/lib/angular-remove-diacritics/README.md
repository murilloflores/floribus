angular-remove-diacritics
=========================

Overview
--------

Angular service to remove accents/diacritics in strings


__All the best and enjoy using.__

Getting started
---------------

### Download

- [Download](https://github.com/Kepro/angular-remove-diacritics/archive/master.zip) from github.

### Install from bower
```
bower install angular-remove-diacritics
```


### Load Script
Load the script file: `remove-diacritics.js` in your application:

```html
<script type="text/javascript" src="remove-diacritics.js"></script>
```

### Code
Add the txx.diacritics module as a dependency to your application module:

```js
var myAppModule = angular.module('MyApp', ['txx.diacritics'])
.controller('myController', function($scope, removeDiacritics) {
		var myValue = 'my +ľščťžťžáí!@#$#$^&*';
		var replaceWith = '-';
		
		// this will return my +lsctztzai!@#$#$^&*
        $scope.replace = function(){
            return removeDiacritics.replace(myValue);
        };

		// this will return my-lsctztzai-
		$scope.createSEOname = function(){
			return removeDiacritics.seo(myValue, replaceWith);
		};
```
