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
    var section = StorageService.getOrDefault("rssF", []);
    var union = StorageService.getOrDefault("rssTHS", []);
    var kth = StorageService.getOrDefault("rssKTH", []);
    var requests = -1;
    var lastUpdate = StorageService.getOrDefault("rssLastUpdate", "");
    var fail = false;

	//ger ett xmlträd från en sträng
    var parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };

	//läser in händelser från ett xmlträd med rss
	//händelser = anonyma objekt med title, skapare, beskrivning etc
    var parseRss = function (xml, isKTH) {
        var res = [];

        var items = xml.getElementsByTagName("item");
        for (var i = 0; i < items.length; i++)
			if (isKTH)
				res.push({
					title: items[i].getElementsByTagName("title")[0].textContent,
					link: items[i].getElementsByTagName("link")[0].textContent,
					description: items[i].getElementsByTagName("description")[0].textContent,
					date: new Date(items[i].getElementsByTagName("pubDate")[0].textContent),
					creator: "KTH",
					category: "",
					content: items[i].getElementsByTagName("description")[0].textContent //samma som description
				});
			else
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
                StorageService.set("rssKTH", kth);
            }
            if ($state.current.name == "app.section")
                $state.go($state.current, {}, { reload: true });
        }
    };

	//hämta alla rss-flöden
    var update = function () {
        requests = 3;
        console.log("getting rss feeds");

        $http.get(RssEndpoint.f + "feed/").then(
			function successCallback(response) {
			    try {
			        var xml = parseXml(response.data);
			        section = parseRss(xml);
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

        $http.get(RssEndpoint.kth + "aktuellt/nyheter?rss=news").then(
			function successCallback(response) {
			    try {
			        var xml = parseXml(response.data);
			        kth = parseRss(xml, true);
			    } catch (e) {
			        console.log(e);
			        fail = true;
			    }

			    requests--;
			    onDone();
			},
			function errorCallback(response) {
			    console.log("Error when getting kth rss feed " + response.status + ": " + response.statusText + ", " + response.data);
			    fail = true;

			    requests--;
			    onDone();
			});
    };

	//uppdaterar rss-flödena om det gått ett dygn sen senaste
    if (new Date().toDateString() != lastUpdate)
        update();
    else {
        console.log("using cached rss feeds");
    }


    return {
        getSection: function () {
            return section;
        },
        getUnion: function () {
            return union;
        },
		getKTH: function () {
			return kth;
		}
    };
})

//service som hämtar KTH:s officiella händelser, typ lunchkonserter
.factory('KthCalendarService', function ($http, $state, RssEndpoint, StorageService) {
    var events = StorageService.getOrDefault("KthCalendarEvents", []);
    var lastUpdate = StorageService.getOrDefault("KthCalendarLastUpdate", null);
    var fail = false;
    var callbacks = [];
    var serializer = new XMLSerializer();

    //ger ett xmlträd från en sträng
    var parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };

    var parseRss = function (xml) {
        var items = xml.documentElement.getElementsByTagName("item");
        var res = [];
        for (var i = 0; i < items.length; i++) {
            var event = {
                title: items[i].getElementsByTagName("title")[0].textContent,
                url: items[i].getElementsByTagName("link")[0].textContent
            };

            var elementXml = parseXml(items[i].getElementsByTagName("description")[0].textContent).documentElement;
            var serialized = serializer.serializeToString(elementXml);

            if (serialized.indexOf("parsererror") != -1) {
                elementXml = parseXml("<p>" + items[i].getElementsByTagName("description")[0].textContent.replace(/<br>/ig, "<br/>") + "</p>").documentElement;

                var short = serializer.serializeToString(elementXml.children[0]).replace(/<div(.+)<\/div>/i, "").replace(/<\/*[a-z]+\/*>/ig, " ").trim();
                var long = "";
                for (var j = 1; j < elementXml.children.length; j++)
                    long += serializer.serializeToString(elementXml.children[j]).replace(/<div(.+)<\/div>/i, "").replace(/<\/*[a-z]+\/*>/ig, " ").trim() + (j != elementXml.children.length - 1 ? " " : "");

                event.info = short;
                event.longInfo = short + " " + long;
            } else {
                var desc = serialized.replace(/<div(.+)<\/div>/i, "").replace(/<\/*[a-z]+\/*>/ig, " ").trim();

                event.info = desc;
                event.longInfo = desc;
            }

            var elementInfo = elementXml.getElementsByClassName("eventInfo")[0];
            for (var prop in { date: 0, location: 0, subject: 0 }) {
                var tag = elementInfo.getElementsByClassName(prop)[0];
                event[prop] = tag.textContent.substring(tag.textContent.indexOf(": ") + 2);
            }

            res.push(event);
        }

        console.log("Händelser från KTH-kalendern", res);
        return res;
    };

    var onDone = function () {
        if (!fail) {
            StorageService.set("KthCalendarEvents", events);
            StorageService.set("KthCalendarLastUpdate", new Date().toDateString());

            for (var i = 0; i < callbacks.length; i++)
                callbacks[i]();
        }
    };

    var update = function () {
        $http.get(RssEndpoint.kth + "aktuellt/kalender?rss=calendar").then(
			function successCallback(response) {
			    try {
			        var xml = parseXml(response.data);
			        events = parseRss(xml);
			    } catch (e) {
			        console.log(e);
			        fail = true;
			    }
			    onDone();
			},
			function errorCallback(response) {
			    console.log("Error when getting kth rss feed " + response.status + ": " + response.statusText + ", " + response.data);
			    fail = true;
			    onDone();
			});
    };

    if (new Date().toDateString() != lastUpdate)
        update();
    else {
        console.log("Using cached kth calendar events");

        for (var i = 0; i < callbacks.length; i++)
            callbacks[i]();
    }

    return {
        getEvents: function () {
            return events;
        },
        registerCallback: function (cb) {
            callbacks.push(cb);
        }
    }
})
;
