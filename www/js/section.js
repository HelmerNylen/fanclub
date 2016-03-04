angular.module('starter.section', ['starter.services', 'starter.apikey'])

.factory('SectionService', function ($http, $state, CalendarEndpoint, URLs, DataService, StorageService, APIkey) {
	//taget från http://stackoverflow.com/a/7244288
	var RFC3339 = function (d) {
		function pad(n){return n<10 ? '0'+n : n}
		return d.getUTCFullYear()+'-'
			+ pad(d.getUTCMonth()+1)+'-'
			+ pad(d.getUTCDate())+'T'
			+ pad(d.getUTCHours())+':'
			+ pad(d.getUTCMinutes())+':'
			+ pad(d.getUTCSeconds())+'Z';
	};
	
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
	var lastUpdated = StorageService.getOrDefault("sectionLastUpdated", 0);
	
	var onDone = function () {
		if ($state.current.name == "app.section" || (DataService.getMixEvents() && ($state.current.name == "app.feed" || $state.current.name == "app.week")))
			$state.go($state.current, {}, { reload: true });
	};
	
	var update = function () {
		console.log("Calling calendar api");
		$http.get(CalendarEndpoint.url + URLs.sectionCalendar(calendarId, apikey, options)).then(
			function successCallback(response) {
			    try {
			        sectionResponse = response.data;
			        StorageService.set("sectionResponse", sectionResponse);
			        events = sectionResponse.items;
			        if (!events) {
			            console.log("fick inga sektionshändelser trots korrekt response", response);
			            events = [];
			        }
			        else {
			            lastUpdated = new Date().getTime();
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
	
	if (new Date().getTime() - lastUpdated > 1000 * 3600 * 24)
		update();
	else {
		console.log("Reading section events from cache");
		sectionResponse = StorageService.getOrDefault("sectionResponse");
		events = sectionResponse.items;
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
				course: { name: (event.summary || "").trim(), color: "#ff642b" },
				locations: [{name: event.location || ""}],
				title: (event.summary || "").trim(),
				original: event,
				start: event.start.dateTime || event.start.date,
				end: event.end.dateTime || event.end.date
			};
		},
		duration: function (event) {
			if (event.start.date && event.end.date) {
				var days = Math.round((new Date(event.end.date).getTime() - new Date(event.start.date).getTime()) / (1000 * 3600 * 24));
				return (days == 1 ? "Hela dagen" : days + " dagar");
			} else return getTime(event.start.dateTime || event.start.date) + "-" + getTime(event.end.dateTime || event.end.date);
		}
    };
})

.factory('RssService', function ($http, $state, RssEndpoint, StorageService) {
    var section = null;
    var union = null;
    var requests = -1;
    var lastUpdate = StorageService.getOrDefault("rssLastUpdate", 0);
    var fail = false;

    var parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };

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

    var onDone = function () {
        if (requests == 0) {
            requests = -1;
            if (!fail) {
                lastUpdate = new Date().getTime();
                StorageService.set("rssLastUpdate", lastUpdate);
                StorageService.set("rssF", section);
                StorageService.set("rssTHS", union);
            }
            if ($state.current.name == "app.section")
                $state.go($state.current, {}, { reload: true });
        }
    };

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

    if (new Date().getTime() - lastUpdate > 1000 * 3600 * 24)
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
