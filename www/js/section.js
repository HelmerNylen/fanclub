angular.module('starter.section', ['starter.services', 'starter.apikey'])

//service som hämtar sektionshändelser från googlekalendern
.factory('SectionService', function ($http, $state, CalendarEndpoint, URLs, DataService, StorageService, APIkey) {
	//taget från http://stackoverflow.com/a/7244288
	//gör en giltig timestamp av ett Date
	var RFC3339 = function (d) {
		function pad(n){return n<10 ? '0'+n : n}
		return d.getUTCFullYear()+'-'
			+ pad(d.getUTCMonth()+1)+'-'
			+ pad(d.getUTCDate())+'T'
			+ pad(d.getUTCHours())+':'
			+ pad(d.getUTCMinutes())+':'
			+ pad(d.getUTCSeconds())+'Z';
	};
	
	//data för api-anropet
	var calendarId = "e17rpovh5v7j79fpp74d1gker8@group.calendar.google.com";
	var apikey = APIkey.key;
	var options = {
		orderBy: "startTime",
		singleEvents: "True",
		timeMin: RFC3339(DataService.startDate),
		timeMax: RFC3339(new Date(DataService.startDate.getTime() + 1000 * 3600 * 24 * 365))
	};
	
	var events = null;
	var sectionResponse = null;
	var lastUpdated = StorageService.getOrDefault("sectionLastUpdated", null);
	
	var eventServiceCallback = null;
	
	//körs när alla utgående api-anrop är klara (i detta fall är det bara 1)
	//refreshar vyn (dvs visar händelserna) om man är på en rimlig sida
	var onDone = function () {
		if (eventServiceCallback)
			eventServiceCallback();
		if ($state.current.name == "app.section" || (DataService.getMixEvents() && ($state.current.name == "app.feed" || $state.current.name == "app.week")))
			$state.go($state.current, {}, { reload: true });
	};
	
	//anropar apit
	var update = function () {
		console.log("Calling calendar api");
		$http.get(CalendarEndpoint.url + URLs.sectionCalendar(calendarId, apikey, options)).then(
			function successCallback(response) {
			    try {
			        //spara svaret från apit
					sectionResponse = response.data;
			        StorageService.set("sectionResponse", sectionResponse);
			        events = sectionResponse.items;
			        if (!events) {
			            console.log("fick inga sektionshändelser trots korrekt response", response);
			            events = [];
			        }
			        else {
			            lastUpdated = new Date().toDateString();
			            StorageService.set("sectionLastUpdated", lastUpdated);
			        }
			    } catch (e) {
			        console.log(e);
			    }
				
				onDone();
			},
			function errorCallback(response) {
				console.log("Error when getting section calendar " + response.status + ": " + response.statusText + ", " + response.data);
				sectionResponse = response.data;
				onDone();
			});
	};
	
	//uppdatera om det har gått >1 dygn sen senaste gången
	if (new Date().toDateString() != lastUpdated)
		update();
	else {
		console.log("Reading section events from cache");
		sectionResponse = StorageService.getOrDefault("sectionResponse");
		events = sectionResponse.items;
		if (eventServiceCallback)
			eventServiceCallback();
	}
	
	var getTime = function (date) {
		var d = date;
		if (!d.getFullYear)
			d = new Date(date);
        return d.getHours() + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
    };
	
    return {
		getEvents: function () {
			return events;
		},
		getResponse: function () {
			return sectionResponse;
		},
		//ugly hack to display section events (from the google calendar api) as regular events (from the kth schema api)
		convert: function (event) {
			return {
				isSectionEvent: true,
				//googleeventsen har ingen flagga om de är heldagshändelser eller inte,
				//men om de är de definierar de en start.date i stället för start.dateTime
				isAllDayEvent: !!event.start.date,
				original: event,
				course: { name: (event.summary || "").trim(), color: "#ff642b" },
				locations: [{name: event.location || ""}],
				title: (event.summary || "").trim(),
				start: event.start.dateTime || event.start.date,
				end: event.end.dateTime || event.end.date
			};
		},
		//ger en snygg sträng som beskriver hur länge en händelse pågår
		duration: function (event) {
			if (event.start.date && event.end.date) {
				var days = Math.round((new Date(event.end.date).getTime() - new Date(event.start.date).getTime()) / (1000 * 3600 * 24));
				return (days == 1 ? "Hela dagen" : days + " dagar");
			} else return getTime(event.start.dateTime || event.start.date) + "-" + getTime(event.end.dateTime || event.end.date);
		},
		setEventServiceCallback: function (cb) {
			eventServiceCallback = cb;
		}
    };
})

//service som hämtar rss-flöden för fysiksektionen och ths
//egentligen finns inte så mycket intressant där men ska det vara en komplett app så ska det
.factory('RssService', function ($http, $state, RssEndpoint, StorageService) {
    var section = null;
    var union = null;
    var requests = -1;
    var lastUpdate = StorageService.getOrDefault("rssLastUpdate", "");
    var fail = false;

	//ger ett xmlträd från en sträng
    var parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };

	//läser in händelser från ett xmlträd med rss
	//händelser = anonyma objekt med title, skapare, beskrivning etc
    var parseRss = function (xml) {
        var res = [];

        var items = xml.getElementsByTagName("item");
        for (var i = 0; i < items.length; i++)
            res.push({
                title: items[i].getElementsByTagName("title")[0].textContent,
                link: items[i].getElementsByTagName("link")[0].textContent,
                date: new Date(items[i].getElementsByTagName("pubDate")[0].textContent),
                creator: items[i].getElementsByTagName("creator")[0].textContent,
                category: items[i].getElementsByTagName("category")[0].textContent,
                description: items[i].getElementsByTagName("description")[0].textContent,
                content: items[i].getElementsByTagName("encoded")[0].textContent
            });

        return res;
    };

	//körs när alla utgående anrop är klara
    var onDone = function () {
        if (requests == 0) {
            requests = -1;
            if (!fail) {
                lastUpdate = new Date().toDateString();
                StorageService.set("rssLastUpdate", lastUpdate);
                StorageService.set("rssF", section);
                StorageService.set("rssTHS", union);
            }
            if ($state.current.name == "app.section")
                $state.go($state.current, {}, { reload: true });
        }
    };

	//hämta båda rss-flödena
    var update = function () {
        requests = 2;
        console.log("getting rss feeds");

        $http.get(RssEndpoint.f + "feed/").then(
			function successCallback(response) {
			    try {
			        var xml = parseXml(response.data);

			        section = parseRss(xml);
			        console.log(section);

			    } catch (e) {
			        console.log(e);
			        fail = true;
			    }

			    requests--;
			    onDone();
			},
			function errorCallback(response) {
			    console.log("Error when getting section rss feed " + response.status + ": " + response.statusText + ", " + response.data);
			    fail = true;

			    requests--;
			    onDone();
			});

        $http.get(RssEndpoint.ths + "feed/").then(
			function successCallback(response) {
			    try {
			        var xml = parseXml(response.data);

			        union = parseRss(xml);
			        console.log(union);
			    } catch (e) {
			        console.log(e);
			        fail = true;
			    }

			    requests--;
			    onDone();
			},
			function errorCallback(response) {
			    console.log("Error when getting union rss feed " + response.status + ": " + response.statusText + ", " + response.data);
			    fail = true;

			    requests--;
			    onDone();
			});
    };

	//uppdaterar rss-flödena om det gått ett dygn sen senaste
    if (new Date().toDateString() != lastUpdate)
        update();
    else {
        console.log("getting rss feeds from cache");
        section = StorageService.getOrDefault("rssF", []);
        union = StorageService.getOrDefault("rssTHS", []);
    }


    return {
        getSection: function () {
            return section;
        },
        getUnion: function () {
            return union;
        }
    };
})
;
