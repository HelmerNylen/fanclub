angular.module('starter.gitdata', ['starter.services'])

/*
	Händelser via live-content:
  
	{
		"id": "customevent_21",
		"htmlLink": false,
		"created": "2016-07-07T12:00:00.000Z",
		"subject": "Märkesförsäljning",
		"title": "Märkesförsäljning i konsulatet",
		"location": "Konsulatet",
		"description": "Vi säljer jättejättemycket märken till nollan. Gôtt!",
		"creator": {
			"email": "namn@example.com",
			"displayName": "Alfons Åberg"
		},
		"isAllDayEvent": false,
		"start": "2016/07/09 12:00:00",
		"end": "2016/07/11 13:30:00",
		"years": [16]
	},
	{
		"id": "customevent_22",
		"htmlLink": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		"created": "2016-07-07T12:00:00.000Z",
		"subject": "Fysikalen",
		"title": "Fysikalen Shelley",
		"location": "Dieselverkstaden",
		"description": "Spex!",
		"creator": {
			"email": "namn@example.com",
			"displayName": "Skalman"
		},
		"isAllDayEvent": true,
		"start": "2016/07/09",
		"end": "2016/07/11",
		"years": [-1]
	}
	Räkna upp customevent_X för varje event som läggs till
	Ta inte bort events-arrayen, även om den blir tom
	Subject visas i feedet samt som titel på modalen
	Title visas på detaljsidan ovanför beskrivningen, centrerat
	Alla fält anses obligatoriska förutom creator
	
*/

.factory('GitService', function ($http, $state, StorageService, URLs, GitEndpoint, FoodEndpoint, DebuggerService) {
    var lastUpdate = StorageService.getOrDefault("gitLastUpdate", null);
    var content = StorageService.getOrDefault("gitContent", {});
    var callbacks = [];

    var update = function () {
        DebuggerService.log("Getting live data");
        try {
            $http.get(GitEndpoint.url + URLs.gitData("live-content/live.json")
                ).then(
                function successCallback(response) {
                    content = response.data;
                    lastUpdate = new Date().toDateString();
                    StorageService.set("gitLastUpdate", lastUpdate);
                    StorageService.set("gitContent", content);
                    for (var i = 0; i < callbacks.length; i++)
                        callbacks[i]();
                },
                function errorCallback(response) {
					DebuggerService.log("Error when getting live content from GitHub: " + JSON.stringify(response), "red");
                    for (var i = 0; i < callbacks.length; i++)
                        callbacks[i]();
                });
        } catch (e) {
            console.log(e);
        }
    };

    if (new Date().toDateString() != lastUpdate)
        update();
    else
        for (var i = 0; i < callbacks.length; i++)
            callbacks[i]();

    return {
        getContent: function () {
            //return content;
			
			// *** Testdata ***
			return {
			  "lastupdated": "2016-04-29",
			  "tools": {
				"modals": {
				  "school": [
					{
					  "title": "Mekanikövningar",
					  "icon": "ion-university",
					  "template": "<ion-modal-view><ion-header-bar class=\"bar-ctfys\"><h1 class=\"title\">Mekanikövningar</h1><div class=\"buttons\"><button class=\"button button-clear\" ng-click=\"closeToolModal()\">Stäng</button></div></ion-header-bar><ion-content><div style=\"text-align: center; padding: 1em; padding-top: 2em;\">Anteckningar gjorda av <a href=\"{{ vars.backmanURL }}\" target=\"_blank\">Jonathan Backman</a>.</div><div class=\"card list\"><div class=\"item item-text-wrap\" ng-repeat=\"subject in ['Vektoralgebra och dimensionsbetraktelser', 'Kraft, kraftmoment och kraftsystem', 'Masscentrum', 'Jämvikt 2D', 'Jämvikt 3D', 'Kinematik', 'Kraftekvationen', 'Kraftekvationen fortsättning', 'Arbete och energi', 'Momentekvationen']\" ng-click=\"openURL(vars.backmanURL + vars.backmanPDF + ($index+1) + '.pdf')\">Övning {{ $index + 1 }} - {{ subject }}</div></div></ion-content></ion-modal-view>",
					  "vars": {
						"backmanURL": "http://www.jonathanbackman.com/",
						"backmanPDF": "wp-content/uploads/2016/01/Övning"
					  }
					}
				  ],
				  "other": [ ]
				}
			  },
			  "events": [ ],
			  "settings": {
				  "years": {
					  "nØllan": 2016,
					  "Fanclub": 2015,
					  "Folkvett": 2014,
					  "Frågvis": 2013,
					  "Fumla": 2012
				  }
			  }
			};
        },
        registerCallback: function (cb) {
            callbacks.push(cb);
        }
    };
})
;