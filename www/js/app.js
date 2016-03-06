// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

/*
	Felkoder:
		Apelsin - Kopps faila med kurslista
		Ananas - Kopps faila med kursinfo
		Aprikos - Schema faila
		Äpple - try/catch runt $http.get
*/
angular.module('starter', ['ionic', 'starter.apikey', 'starter.controllers', 'starter.services', 'starter.getfood', 'starter.section'])
//Konstanter som används i services som hämtar data, ex. DataService och SectionService
/*/
.constant('ApiEndpoint', {
    url: 'http://192.168.0.10:8100/api/'
})
.constant('FoodEndpoint', {
    q: 'http://192.168.0.10:8100/food/q/',
    nymble: 'http://192.168.0.10:8100/food/nymble/',
    brazilia: 'http://192.168.0.10:8100/food/brazilia/',
    syster: 'http://192.168.0.10:8100/food/syster/'
})
.constant('CalendarEndpoint', {
    url: 'http://192.168.0.10:8100/calendar/'
})
.constant('RssEndpoint', {
    f: 'http://192.168.0.10:8100/rss/f/',
    ths: 'http://192.168.0.10:8100/rss/ths/'
})

/*/

.constant('ApiEndpoint', {
    url: 'http://kth.se/'
})
.constant('FoodEndpoint', {
    q: 'http://www.hors.se/',
    nymble: 'http://ths.kth.se/',
    brazilia: 'https://gastrogate.com/',
    syster: 'http://www.systerobror.se/'
})
.constant('CalendarEndpoint', {
    url: 'https://www.googleapis.com/calendar/v3/'
})
.constant('RssEndpoint', {
    f: 'http://f.kth.se/',
    ths: 'http://ths.kth.se/'
})
    
//*/

//funktioner som bygger urler, används i kombination med endpointsen ovan.
//ex. FoodEndpoint.q + weekMenuQ() för restaurang Q:s anrop
.constant('URLs', {
    plan: function (year) {
        return 'api/kopps/v1/programme/CTFYS/academic-year-plan/2015:2/' + year;
    },
    schema: function (courseCode, startTerm, roundId, start, end) {
        var s = new Date(start);
        var e = new Date(end);
        var pad = function (s) {
            if (s.toString().length < 2)
                return "0" + s.toString();
            return s.toString();
        };

        return "api/schema/v2/course/" + courseCode.toUpperCase() + "/" + startTerm + "/" + roundId + "?startTime=" + s.getFullYear() + "-" + pad(s.getMonth() + 1) + "-" + pad(s.getDate()) + "&endTime=" + e.getFullYear() + "-" + pad(e.getMonth() + 1) + "-" + pad(e.getDate());
    },
    courseInfo: function (courseCode, startTerm, roundId) {
        return "api/kopps/v1/course/" + courseCode;// + "/round/" + startTerm.substring(0, 4) + ":" + startTerm.substring(4, 5) + "/" + roundId;
    },
	weekMenuQ: function() {
		var pad = function (s) {
            if (s.toString().length < 2)
                return "0" + s.toString();
            return s.toString();
        };
		return "veckans-meny/?week-for=" + new Date().getFullYear() + "-" + pad(new Date().getMonth() + 1) + "-" + pad(new Date().getDate());
	},
	weekMenuNymble: function () {
		return "om-ths/restaurang-cafe/restaurang-nymble-meny/";
	},
	weekMenuBrazilia: function () {
		return "restaurang/brazilia/page/3/";
	},
	weekMenuSyster: function () {
	    return "lunch/";
	},
	sectionCalendar: function (id, key, options) {
		var extra = "";
		for (var option in options)
			extra += "&" + option + "=" + options[option];
		return "calendars/" + id + "/events?key=" + key + extra;
	}
})

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

//definierar olika states i appen. Vill man lägga till en ny sida, med en ny controller, görs det här.
//kolon framför ett ord i urlen betyder argument till sidan, och kan hämtas genom $stateParams.
//ex. statet app.week betyder att veckovyn visas, och tar som argument måndagen som veckan börjar på
//states ändras främst via menyknapparna, kolla menu.html
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
          url: '/app',
          abstract: true,
          templateUrl: 'templates/menu.html',
          controller: 'AppCtrl'
      })

    .state('app.week', {
        url: '/week/:startTime',
        views: {
            'menuContent': {
                templateUrl: 'templates/week.html',
                controller: 'WeekViewCtrl'
            }
        }
    })

    .state('app.feed', {
        url: '/feed/:startTime/:endTime',
        views: {
            'menuContent': {
                templateUrl: 'templates/feed.html',
                controller: 'FeedViewCtrl'
            }
        }
    })
	
	.state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            }
        }
    })
	
	.state('app.food', {
        url: '/food',
        views: {
            'menuContent': {
                templateUrl: 'templates/food.html',
                controller: 'FoodCtrl'
            }
        }
    })
	
	.state('app.section', {
        url: '/section',
        views: {
            'menuContent': {
                templateUrl: 'templates/section.html',
                controller: 'SectionCtrl'
            }
        }
    });
    
	//vi tar ett span från läsårets början (räknar juli som start) och ett år framåt
    var format = function (date) {
        var d = new Date(date);

        return d.getFullYear() + "-" + (d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1).toString()) + "-" + (d.getDate() < 9 ? "0" + d.getDate() : d.getDate().toString());
    };
    var start = new Date().getMonth() >= 6 ? new Date(new Date().getFullYear(), 6) : new Date(new Date().getFullYear() - 1, 6);
    var end = new Date(start.getFullYear() + 1, start.getMonth());
    
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/feed/' + format(new Date().toDateString()) + '/' + format(end));
});
