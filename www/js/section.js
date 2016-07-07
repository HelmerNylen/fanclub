angular.module('starter.section', ['starter.services', 'starter.apikey'])

//service som hämtar sektionshändelser från googlekalendern
.factory('SectionService', function ($http, $state, DebuggerService, CalendarEndpoint, URLs, DataService, StorageService, APIkey) {
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
		DebuggerService.log("Calling calendar api");
		$http.get(CalendarEndpoint.url + URLs.sectionCalendar(calendarId, apikey, options)).then(
			function successCallback(response) {
			    try {
			        //spara svaret från apit
					sectionResponse = response.data;
			        StorageService.set("sectionResponse", sectionResponse);
			        events = sectionResponse.items;
			        if (!events) {
			            DebuggerService.log("Recieved no section events despite valid response: " + JSON.stringify(response), 1);
			            events = [];
			        }
			        else {
			            lastUpdated = new Date().toDateString();
			            StorageService.set("sectionLastUpdated", lastUpdated);
			        }
			    } catch (e) {
			        DebuggerService.log(e, 1);
			    }
				
				onDone();
			},
			function errorCallback(response) {
				DebuggerService.log("Error when getting section calendar: " + JSON.stringify(response), 1);
				sectionResponse = response.data;
				onDone();
			});
	};
	
	//uppdatera om det har gått >1 dygn sen senaste gången
	if (new Date().toDateString() != lastUpdated)
		update();
	else {
		DebuggerService.log("Reading section events from cache", 4);
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
	
	var duration = function (start, end, allday) {
		if (allday) {
			var days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24));
			return (days == 1 ? "Hela dagen" : days + " dagar");
		} else return getTime(start) + "-" + getTime(end);
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
			return event.start.date && event.end.date ? duration(event.start.date, event.end.date, true) : duration(event.start.dateTime. event.end.dateTime, false);
		},
		_duration: duration,
		setEventServiceCallback: function (cb) {
			eventServiceCallback = cb;
		}
    };
})

//service som hämtar rss-flöden för fysiksektionen och ths
//egentligen finns inte så mycket intressant där men ska det vara en komplett app så ska det
.factory('RssService', function ($http, $state, RssEndpoint, StorageService, DebuggerService) {
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
					date: getDateString(items[i].getElementsByTagName("pubDate")[0].textContent),
					creator: "KTH",
					category: "",
					content: items[i].getElementsByTagName("description")[0].textContent //samma som description
				});
			else
				res.push({
					title: items[i].getElementsByTagName("title")[0].textContent,
					link: items[i].getElementsByTagName("link")[0].textContent,
					date: getDateString(items[i].getElementsByTagName("pubDate")[0].textContent),
					creator: items[i].getElementsByTagName("creator")[0].textContent,
					category: items[i].getElementsByTagName("category")[0].textContent,
					description: items[i].getElementsByTagName("description")[0].textContent,
					content: items[i].getElementsByTagName("encoded")[0].textContent
				});

        return res;
    };

    var getDateString = function (str) {
        var split = str.split(" ");
        var year = split[3];
        var month = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"].indexOf(split[2].toLowerCase());
        if (month == -1)
            month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(split[2].toLowerCase());
        if (month == -1)
            throw "Odefinierad månad: " + split[2];
        var date = split[1];
        var subsplit = split[4].split(":");
        var hour = subsplit[0], minute = subsplit[1];
		
        return new Date(year + "/" + (month + 1) + "/" + date + " " + hour + ":" + minute + ":00");
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
        DebuggerService.log("Getting RSS feeds");

        $http.get(RssEndpoint.f + "feed/").then(
			function successCallback(response) {
			    try {
			        var xml = parseXml(response.data);
			        section = parseRss(xml);
			    } catch (e) {
			        DebuggerService.log(e, 1);
			        fail = true;
			    }

			    requests--;
			    onDone();
			},
			function errorCallback(response) {
			    DebuggerService.log("Error when getting section rss feed: " + JSON.stringify(response), 1);
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
			        DebuggerService.log(e, 1);
			        fail = true;
			    }

			    requests--;
			    onDone();
			},
			function errorCallback(response) {
			    DebuggerService.log("Error when getting THS rss feed: " + JSON.stringify(response), 1);
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
			        DebuggerService.log(e, 1);
			        fail = true;
			    }

			    requests--;
			    onDone();
			},
			function errorCallback(response) {
			    DebuggerService.log("Error when getting KTH feed: " + JSON.stringify(response), 1);
			    fail = true;

			    requests--;
			    onDone();
			});
    };

	//uppdaterar rss-flödena om det gått ett dygn sen senaste
    if (new Date().toDateString() != lastUpdate)
        update();
    else {
        DebuggerService.log("Using cached RSS feeds", 4);
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
.factory('KthCalendarService', function ($http, $state, RssEndpoint, StorageService, DebuggerService) {
    var events = StorageService.getOrDefault("KthCalendarEvents", null);
    var lastUpdate = StorageService.getOrDefault("KthCalendarLastUpdate", null);
    var interestingMode = StorageService.getOrDefault("KthCalendarInterestingMode", 1);
    var fail = false;
    var callbacks = [];
    var serializer = new XMLSerializer();

    //avgör om en händelse är intressant nog att få sparas
    var interestingEvent = function (ev) {
        switch (interestingMode) {
            case 1:
                try {
                    return ev.subject.toLowerCase().indexOf("musik") != -1 || ev.longInfo.toLowerCase().indexOf("lunch") != -1 || ev.title.toLowerCase().indexOf("lunch") != -1;
                }
                catch (e) {
                    DebuggerService.log(e, 1);
                    return false;
                }
            case 2:
                return true;
            default: return false;
        }
    };

    //ger ett xmlträd från en sträng
    var parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };

    //för att apple tydligen inte klarar att skriva dessa själva
    var getElementByClassName = function (element, className) {
        var children = element.childNodes;
        for (var i = 0; i < children.length; i++) {
            try {
                if (children[i].getAttribute("class").indexOf(className) != -1)
                    return children[i];
            }
            catch (e) {}
        }
        for (var i = 0; i < children.length; i++) {
            try {
                var r = getElementByClassName(children[i], className);
                if (r) return r;
            } catch (e) { }
        }
        return null;
    };
    var firstChild = function (element) {
        var children = element.childNodes;
        for (var i = 0; i < children.length; i++)
            if (children[i].nodeName != "#text")
                return children[i];
        return null;
    };

    var parseRss = function (xml) {
        var items = xml.documentElement.getElementsByTagName("item");
        var res = [];
        for (var i = 0; i < items.length; i++) {
            var event = {
                title: items[i].getElementsByTagName("title")[0].textContent,
                url: items[i].getElementsByTagName("link")[0].textContent,
				id: items[i].getElementsByTagName("guid")[0].textContent,
				isOfficialEvent: true
            };

            var elementXml = parseXml(items[i].getElementsByTagName("description")[0].textContent).documentElement;
            var serialized = serializer.serializeToString(elementXml);

            //bör väl göras på bättre sätt
            //beskrivningarna innehåller ibland html som måste fixas till för att fungera som xml
            if (serialized.indexOf("parsererror") != -1) {
                elementXml = parseXml("<p>" + items[i].getElementsByTagName("description")[0].textContent.replace(/<br>/ig, "<br/>") + "</p>").documentElement;

                var short = serializer.serializeToString(firstChild(elementXml)).replace(/<div(.+)<\/div>/i, "").replace(/<\/*[a-z]+\/*>/ig, " ").trim();
                var long = "";
                var c = elementXml.children || elementXml.childNodes;
                for (var j = 1; j < c.length; j++)
                    long += serializer.serializeToString(c[j]).replace(/<div(.+)<\/div>/i, "").replace(/<\/*[a-z]+\/*>/ig, " ").trim() + (j != c.length - 1 ? " " : "");

                event.info = short;
                event.longInfo = short + " " + long;
            } else {
                var desc = serialized.replace(/<div(.+)<\/div>/i, "").replace(/<\/*[a-z]+\/*>/ig, " ").trim();

                event.info = desc;
                event.longInfo = desc;
            }

            var elementInfo = getElementByClassName(elementXml, "eventInfo");
            for (var prop in { date: 0, location: 0, subject: 0 }) {
                var tag = getElementByClassName(elementInfo, prop);
				if (tag)
					event[prop] = tag.textContent.substring(tag.textContent.indexOf(": ") + 2);
				else
					event[prop] = "";
            }
			event.locations = event.location ? [{name: event.location}] : [];
			
            try {
                if (event.date.match(/\d\d\d\d-\d\d-\d\d/g).length == 2) {
                    var match = event.date.match(/\d\d\d\d-\d\d-\d\d/g);
                    event.start = new Date(match[0].replace(/-/g, "/"));
                    event.end = new Date(match[1].replace(/-/g, "/"));
                    event.end.setDate(event.end.getDate() + 1)
                }
                else {
                    var date = event.date.match(/\d\d\d\d-\d\d-\d\d/)[0].replace(/-/g, "/");
                    event.start = new Date(date + " " + event.date.match(/kl \d\d.\d\d/)[0].substring(3).replace(/\./g, ":") + ":00");
                    if (event.date.match(/- \d\d.\d\d/))
                        event.end = new Date(date + " " + event.date.match(/- \d\d.\d\d/)[0].substring(2).replace(/\./g, ":") + ":00");
                }

				res.push(event);
			} catch (e) {
				DebuggerService.log(e, 1);
				DebuggerService.log("Error occurred while parsing event in official KTH calendar:");
				DebuggerService.log(event.date);
			}
        }

        //console.log("Händelser från KTH-kalendern", res);
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
			        DebuggerService.log(e, 1);
			        DebuggerService.log("Error when parsing XML or RSS from official KTH calendar feed");
			        fail = true;
			    }
			    onDone();
			},
			function errorCallback(response) {
			    DebuggerService.log("Error when getting official KTH calendar feed: " + JSON.stringify(response), 1);
			    fail = true;
			    onDone();
			});
    };

    if (new Date().toDateString() != lastUpdate)
        update();
    else {
        DebuggerService.log("Using cached KTH calendar events", 4);
		if (events == null)
			events = [];

        for (var i = 0; i < callbacks.length; i++)
            callbacks[i]();
    }

    return {
        getEvents: function () {
			if (!events)
				return null;
            interestingMode = StorageService.getOrDefault("KthCalendarInterestingMode", 1);
            var res = [];
            for (var i = 0; i < events.length; i++)
                if (interestingEvent(events[i]))
                    res.push(events[i]);

            return res;
        },
        getAllEvents: function () {
            return events;
        },
        registerCallback: function (cb) {
            callbacks.push(cb);
        }
    }
})
;
