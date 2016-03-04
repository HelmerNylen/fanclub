angular.module('starter.services', [])

.factory('StorageService', function () {
    return {
        clear: function () {
			window.localStorage.clear();
		},
        getOrDefault: function (key, def) {
            var res = window.localStorage.getItem(key);
            if (res == null)
                return def;
            else
                return JSON.parse(res);
        },
        set: function (key, value) {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    };
})

//date and time shortcuts, among other things
.factory('ConvenientService', function () {
    var weekdays = ["S\u00f6ndag", "M\u00e5ndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "L\u00f6rdag", "S\u00f6ndag"];
    var months = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
    var today = new Date().toDateString();
    var yesterday = new Date(new Date().getTime() - 1000 * 3600 * 24).toDateString();
    var tomorrow = new Date(new Date().getTime() + 1000 * 3600 * 24).toDateString();
    var twoDaysAgo = new Date(new Date().getTime() - 2 * 1000 * 3600 * 24).toDateString();
    var inTwoDays = new Date(new Date().getTime() + 2 * 1000 * 3600 * 24).toDateString();

    return {
        dateFormat: function (date) {
            var d = new Date(date);

            return d.getFullYear() + "-" + (d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1).toString()) + "-" + (d.getDate() < 9 ? "0" + d.getDate() : d.getDate().toString());
        },
        verboseDateFormat: function (date) {
            var d = new Date(date);

            var prestring = "";
            if (d.toDateString() == today)
                prestring = "Idag, ";
            else if (d.toDateString() == yesterday)
                prestring = "Ig\u00e5r, ";
            else if (d.toDateString() == tomorrow)
                prestring = "Imorgon, ";
            else if (d.toDateString() == twoDaysAgo)
                prestring = "I f\u00f6rrg\u00e5r, ";
            else if (d.toDateString() == inTwoDays)
                prestring = "I \u00f6vermorgon, ";
            prestring += (prestring.length == 0 ? weekdays[d.getDay()] : weekdays[d.getDay()].toLowerCase());
            return prestring + " den " + d.getDate() + " " + months[d.getMonth()].toLowerCase() + (d.getFullYear() != new Date().getFullYear() ? " " + d.getFullYear() : "");
        },
        today: today, tomorrow: tomorrow, yesterday: yesterday, inTwoDays: inTwoDays, twoDaysAgo: twoDaysAgo,
        getDayName: function (day) {
            return weekdays[day];
        },
		timeFormat: function(ms, roughEstimate)
		{
			var s = [];
			var str;
			if (ms >= 1000 * 3600 * 24 * 365)
			{
				s.push(Math.floor(ms / (1000 * 3600 * 24 * 365)) + " år");
				ms %= 1000 * 3600 * 24 * 365;
			}
			if (ms >= 1000 * 3600 * 24 * 7)
			{
				s.push(Math.floor(ms / (1000 * 3600 * 24 * 7)) + (Math.floor(ms / (1000 * 3600 * 24 * 7)) == 1 ? " vecka" : " veckor"));
				ms %= 1000 * 3600 * 24 * 7;
			}
			if (ms >= 1000 * 3600 * 24)
			{
				s.push(Math.floor(ms / (1000 * 3600 * 24)) + (Math.floor(ms / (1000 * 3600 * 24)) == 1 ? " dag" : " dagar"));
				ms %= 1000 * 3600 * 24;
			}
			if (ms >= 1000 * 3600)
			{
				s.push(Math.floor(ms / (1000 * 3600)) + (Math.floor(ms / (1000 * 3600)) == 1 ? " timme" : " timmar"));
				ms %= 1000 * 3600;
			}
			if (ms >= 1000 * 60)
			{
				s.push(Math.floor(ms / (1000 * 60)) + (Math.floor(ms / (1000 * 60)) == 1 ? " minut" : " minuter"));
				ms %= 1000 * 60;
			}
			if (ms >= 1000)
			{
				s.push(Math.floor(ms / 1000) + (Math.floor(ms / 1000) == 1 ? " sekund" : " sekunder"));
				//ms %= 1000;
			}
			if (roughEstimate)
				return s.length != 0 ? s[0] : "0 sekunder";
			else
			{
				if (s.length == 0)
					str = "0 sekunder";
				else if (s.length == 1)
					str = s[0];
				else if (s.length == 2)
					str = s[0] + " och " + s[1];
				else
				{
					str = "";
					for (var i = 0; i < s.length - 2; i++)
						str += s[i] + ", ";
					str += s[s.length - 2] + " och " + s[s.length - 1];
				}
				return str;
			}
		},
		weekNumber: function (d) {
		    // Source: http://weeknumber.net/how-to/javascript
		    var date = new Date(d.getTime());
		    date.setHours(0, 0, 0, 0);
		    // Thursday in current week decides the year.
		    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
		    // January 4 is always in week 1.
		    var week1 = new Date(date.getFullYear(), 0, 4);
		    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
		    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                                  - 3 + (week1.getDay() + 6) % 7) / 7);
		},
		contrastingColor: function(color, brighter, darker) {
			var c = color.substring(1);
			if (color.length == 4) {
				c = color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
			}
			var red = parseInt(c.substring(0, 2), 16);
			var green = parseInt(c.substring(2, 4), 16);
			var blue = parseInt(c.substring(4, 6), 16);
			
			if (red * 0.2126 + green * 0.7152 + blue * 0.0722 <= 127)
				return brighter || "#fff";
			else
				return darker || "#000";
		},
		openURL: function (url) {
			try {
				cordova.InAppBrowser.open(url, "_system");
			} catch (e1) {
				console.log(e1);
				window.open(url, "_blank");
			}
		},
		randomColor: function (multiplier) {
			if (multiplier == undefined)
				multiplier = 1;
			var str = Math.floor(Math.random() * 16777215 * multiplier).toString(16);
			while (str.length < 6)
				str = "0" + str;
			return "#" + str;
		},
		RGBtohex: function (RGB) {
			var r = Math.floor(RGB[0]).toString(16);
			var g = Math.floor(RGB[1]).toString(16);
			var b = Math.floor(RGB[2]).toString(16);
			r = (r.length == 1) ? "0" + r : r;
			g = (g.length == 1) ? "0" + g : g;
			b = (b.length == 1) ? "0" + b : b;
			return "#" + r + g + b;
		},
		hextoRGB: function (hex) {
			var c = hex.substring(1);
			if (hex.length == 4) {
				c = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
			}
			return [
				parseInt(c.substring(0, 2), 16),
				parseInt(c.substring(2, 4), 16),
				parseInt(c.substring(4, 6), 16)
			];
		},
		RGBtoHSV: function (RGB) {
			var r = RGB[0] / 255;
			var g = RGB[1] / 255;
			var b = RGB[2] / 255;
			
			var cmax = Math.max(r, g, b);
			var cmin = Math.min(r, g, b);
			var d = cmax - cmin;
			
			var h;
			if (d == 0)
				h = 0;
			else if (cmax == r)
				h = 60 * ((((g - b) / d) + 6) % 6);
			else if (cmax == g)
				h = 60 * (((b - r) / d) + 2);
			else //(cmax == b)
				h = 60 * (((r - g) / d) + 4);
			
			var s = (cmax == 0) ? 0 : d / cmax;
			var v = cmax;
			return [h, s * 100, v * 100];
		},
		HSVtoRGB: function (HSV) {
			var h = (parseFloat(HSV[0]) + 360) % 360;
			var s = HSV[1] / 100;
			var v = HSV[2] / 100;
			
			var c = v * s;
			var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
			var m = v - c;
			var rgb;
			if (0 <= h && h < 60)
				rgb = [c, x, 0];
			else if (60 <= h && h < 120)
				rgb = [x, c, 0];
			else if (120 <= h && h < 180)
				rgb = [0, c, x];
			else if (180 <= h && h < 240)
				rgb = [0, x, c];
			else if (240 <= h && h < 300)
				rgb = [x, 0, c];
			else //(300 <= h && h < 360)
				rgb = [c, 0, x];
			
			return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255]
		},
		earliestTimeOfDay: function (events) {
		    var earliest = 1000 * 3600 * 24;
		    for (var i = 0; i < events.length; i++)
		        if (events[i].isSectionEvent && !events[i].original.start.date) {
		            var d = new Date(events[i].original.start.dateTime);
		            earliest = Math.min(earliest, (d.getHours() * 60 + d.getMinutes()) * 60 * 1000);
		        }
		        else if (!events[i].isSectionEvent) {
		            var d = new Date(events[i].start);
		            earliest = Math.min(earliest, (d.getHours() * 60 + d.getMinutes()) * 60 * 1000);
		        }

		    return earliest;
		},
		latestTimeOfDay: function (events) {
		    var latest = 0;
		    for (var i = 0; i < events.length; i++)
		        if (events[i].isSectionEvent && !events[i].original.end.date) {
		            var d = new Date(events[i].original.end.dateTime);
		            latest = Math.max(latest, (d.getHours() * 60 + d.getMinutes()) * 60 * 1000);
		        }
		        else if (!events[i].isSectionEvent) {
		            var d = new Date(events[i].end);
		            latest = Math.max(latest, (d.getHours() * 60 + d.getMinutes()) * 60 * 1000);
		        }

		    return latest;
		},
		collisions: function (event, eventBoxes) {
		    var res = [], eventStart = new Date(event.start), eventEnd = new Date(event.end);
		    var start, end;
		    for (var i = 0; i < eventBoxes.length; i++) {
		        start = new Date(eventBoxes[i].event.start);
		        end = new Date(eventBoxes[i].event.end);
		        if (!(end <= eventStart || start >= eventEnd) && !eventBoxes[i].allDay)
		            res.push(eventBoxes[i]);
		    }

		    return res;
		}
    };
})

.factory('DataService', function ($http, $state, $rootScope, StorageService, ConvenientService, ApiEndpoint, URLs) {
    //try {
	var now = new Date();
    var courses = null;
    var sorted = null;
	var hidden = null;
	var extra = null;
    var updatesLeft = -1;
    var courseColors = {};
	var errors = [];
	var extendedDiscard = StorageService.getOrDefault("extendedDiscard", true);
	var menusEnabled = StorageService.getOrDefault("menusEnabled", true);
	var delimiterEnabled = StorageService.getOrDefault("delimiterEnabled", false);
	var mixEvents = StorageService.getOrDefault("mixEvents", true);

    var studyYear = Math.ceil((now - new Date("2015-07-01")) / (1000 * 3600 * 24 * 365));
    if (studyYear > 5) studyYear = 5;

    var startDate = now.getMonth() >= 6 ? new Date(now.getFullYear(), 6) : new Date(now.getFullYear() - 1, 6);
    var endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth());


    var parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };

    var extractCourseCode = function (url) {
        var cut = url.substring(url.indexOf("course") + 7);
        return cut.substring(0, cut.indexOf("/"));
    };

    /*var findByCode = function (courseCode) {
        if (!courses)
            return null;
        for (var i = 0; i < courses.length; i++)
            if (courses[i].courseCode == courseCode)
                return courses[i];
    };*/

    var onDone = function (noUpdate) {
        if (updatesLeft == 0) {
			if (!noUpdate)
				StorageService.set("lastUpdate", new Date().getTime());
            StorageService.set("courses", courses);
			StorageService.set("extra", extra);
            sorted = sortByDate(courses, extra);
            $state.go($state.current, {}, { reload: true });
            updatesLeft = -1;
        }
    };
	
	//get events from the KTH schema api
    var getCourseSchemas = function (_courses, _extra) {
		var getCourseSchema = function (cr) {
			$http.get(ApiEndpoint.url + URLs.schema(cr.courseCode, cr.startTerm, cr.roundId, startDate, endDate)).then(
				function successCallback(response) {
					cr.entries = response.data.entries;
					for (var i = 0; i < cr.entries.length; i++)
						cr.entries[i].course = {
							courseCode: cr.courseCode,
							color: cr.color,
							name: cr.name,
							startTerm: cr.startTerm,
							roundId: cr.roundId
						};

					updatesLeft--;
					onDone();
				},
				function errorCallback(response) {
					console.log("Error when getting schema " + response.status + ": " + response.statusText + ", " + response.data);
					updatesLeft--;
					var res = StorageService.getOrDefault("courses", null);
					if (res)
					{
						var ex = StorageService.getOrDefault("extra", []);
						for (var i = 0; i < ex.length; i++)
							res.push(ex[i]);
						
						console.log("Using stored events.");
						for (var i = 0; i < res.length; i++)
							if (res[i].courseCode == cr.courseCode && res[i].roundId == cr.roundId && res[i].startTerm == cr.startTerm)
								cr.entries = res[i].entries;
						
						/*for (var i = 0; i < res.length; i++)
						{
							var c = findByCode(res[i].courseCode);
							if (c && !c.entries)
								c.entries = res[i].entries;
						}*/
					}
					else
					{
						errors.push({
							code: "Aprikos",
							message: "Kunde inte hämta schemahändelser från Schema. Kontrollera att du är ansluten till internet.\n" + 
							"Kontakta utvecklaren om problemet kvarstår.",
							information: [
								response.status ? { label: "Status", data: response.status } : null,
								response.statusText ? { label: "Statustext", data: response.statusText } : null,
								response.data ? { label: "Data", data: response.data } : null
							]
						});
						$state.go($state.current, {}, { reload: true });
					}
					onDone(true);
				});
		};
		try {
			for (var i = 0; i < _courses.length; i++)
				getCourseSchema(_courses[i]);
			if (_extra)
				for (var i = 0; i < _extra.length; i++)
					getCourseSchema(_extra[i]);
		} catch (e) {
			console.log(e);
			errors.push({
				code: "Äpple",
				message: "Fel vid serveranrop.",
				information: [
					{ label: "Fel", data: e.name },
					{ label: "Meddelande", data: e.message }
				]
			});
			$state.go($state.current, {}, { reload: true });
		}
    };

	//get the course name from the KTH kopps api
    var getCourseInfo = function (course) {
		try {
			$http.get(ApiEndpoint.url + URLs.courseInfo(course.courseCode)).then(
				function successCallback(response) {
					var node = parseXml(response.data).documentElement.getElementsByTagName("title")[0];
					course.name = node.textContent;
					if (!courseColors[course.courseCode]) {
						courseColors[course.courseCode] = ConvenientService.randomColor();
						StorageService.set("courseColors", courseColors);
					}
					course.color = courseColors[course.courseCode];
					
					if (course.entries) {
						for (var i = 0; i < course.entries.length; i++) {
							course.entries[i].course.name = (course.entries[i].course.name || course.name);
							course.entries[i].course.color = (course.entries[i].course.color || course.color);
						}
					} else console.log("entries saknas:", course);

					updatesLeft--;
					onDone();
				},
				function errorCallback(response) {
					console.log("Error when getting course info " + response.status + ": " + response.statusText + ", " + response.data);
					updatesLeft--;
					var res = StorageService.getOrDefault("courses", null);
					var throwError = false;
					if (res)
					{
						console.log("Using stored course info for " + course.courseCode + ".");
						course.name = null;
						course.color = null;
						for (var i = 0; i < res.length; i++)
							if (res[i].courseCode == course.courseCode)
							{
								course.name = res[i].name;
								if (!courseColors[course.courseCode]) {
									courseColors[course.courseCode] = ConvenientService.randomColor();
									StorageService.set("courseColors", courseColors);
								}
								course.color = courseColors[course.courseCode];
								break;
							}
						if (course.name == null || course.color == null)
							throwError = true;
						else
							for (var i = 0; i < course.entries.length; i++) {
								course.entries[i].course.name = (course.entries[i].course.name || course.name);
								course.entries[i].course.color = (course.entries[i].course.color || course.color);
							}
					}
					else
						throwError = true;
					if (throwError)
					{
						errors.push({
							code: "Ananas",
							message: "Kunde inte hämta kursnamn från Kopps. Kontrollera att du är ansluten till internet.\n" + 
							"Kontakta utvecklaren om problemet kvarstår.",
							information: [
								response.status ? { label: "Status", data: response.status } : null,
								response.statusText ? { label: "Statustext", data: response.statusText } : null,
								response.data ? { label: "Data", data: response.data } : null
							]
						});
						$state.go($state.current, {}, { reload: true });
					}
					onDone(true);
				});
		} catch (e) {
			console.log(e);
			errors.push({
				code: "Äpple",
				message: "Fel vid serveranrop.",
				information: [
					{ label: "Fel", data: e.name },
					{ label: "Meddelande", data: e.message }
				]
			});
			$state.go($state.current, {}, { reload: true });
		}
    };

	//get a list of courses from the KTH kopps api
    var updateSchemas = function () {
		try {
			$http.get(ApiEndpoint.url + URLs.plan(studyYear)).then(
				function successCallback(response) {
					try {
						var nodes = parseXml(response.data).getElementsByTagName("courseRound");
						console.log("found " + nodes.length + " courses");
						var res = [];
						for (var i = 0; i < nodes.length; i++)
							res.push({
								courseCode: nodes[i].attributes.getNamedItem("courseCode").value,
								startTerm: nodes[i].attributes.getNamedItem("startTerm").value,
								roundId: nodes[i].attributes.getNamedItem("roundId").value
							});
						courses = res;
						updatesLeft = courses.length * 2 + extra.length;
						getCourseSchemas(courses, extra);
						for (var i = 0; i < courses.length; i++)
							getCourseInfo(courses[i]);

						//StorageService.set("lastUpdate", new Date().getTime());
						//StorageService.set("courses", courses);
					}
					catch (e) {
						console.log("Error when parsing xml: " + e.message);
					}
				},
				function errorCallback(response) {
					console.log("Error when getting plan " + response.status + ": " + response.statusText + ", " + response.data);
					var res = StorageService.getOrDefault("courses", null);
					if (res)
					{
						console.log("Using stored courses.");
						courses = res;
						updatesLeft = courses.length * 2 + extra.length;
						getCourseSchemas(courses, extra);
						for (var i = 0; i < courses.length; i++)
							getCourseInfo(courses[i]);
					}
					else
					{
						errors.push({
							code: "Apelsin",
							message: "Kunde inte hämta kurslista från Kopps. Kontrollera att du är ansluten till internet.\n" + 
							"Kontakta utvecklaren om problemet kvarstår.",
							information: [
								response.status ? { label: "Status", data: response.status } : null,
								response.statusText ? { label: "Statustext", data: response.statusText } : null,
								response.data ? {
										label: "Data",
										data: response.status == 503 ? "Termporarily unavailible. We apologize for the inconvenience." : response.data
									} : null
							]
						});
						$state.go($state.current, {}, { reload: true });
					}
				});
		} catch (e) {
			console.log(e);
			errors.push({
				code: "Äpple",
				message: "Fel vid serveranrop.",
				information: [
					{ label: "Fel", data: e.name },
					{ label: "Meddelande", data: e.message }
				]
			});
			$state.go($state.current, {}, { reload: true });
		}
    };
	
    var insertInto = function(schemaArray, event) {
        if (schemaArray.length == 0) {
			schemaArray.push(event);
		}
        else {
			var put = false;
			var eventDate = new Date(event.start);
			for (var i = 0; i < schemaArray.length; i++) {
				if (new Date(schemaArray[i].start) >= eventDate) {
					schemaArray.splice(i, 0, event);
					put = true;
					break;
				}
			}
			if (!put)
				schemaArray.push(event);
        }
    };

    var sortByDate = function (_courses, _extra) {
        var discard = function (event) {
			var course = event.course;
			
			for (var i = 0; i < hidden.length; i++)
				if (hidden[i].courseCode == course.courseCode && hidden[i].roundId == course.roundId && hidden[i].startTerm == course.startTerm)
					return true;
					
			if (extendedDiscard) { //Specialkod för att ta bort lektioner vi inte går på, kan slås av i inställningarna
				if (course.courseCode.toLowerCase() == "sg1130") {
					return event.url.toLowerCase().indexOf("ctfys") == -1;
				}
			}
			return false;
		};
		
		var all = [];
		for (var i = 0; i < _courses.length; i++)
			all.push(_courses[i]);
		if (_extra)
			for (var i = 0; i < _extra.length; i++)
				all.push(_extra[i]);
		
		//console.log(_extra);
		
		var res = [];
        var total = 0;
		var discarded = 0;
        for (var i = 0; i < all.length; i++)
			for (var j = 0; j < all[i].entries.length; j++) {
				if (discard(all[i].entries[j]))
					discarded++;
				else
					insertInto(res, all[i].entries[j]);
				total++;
			}
        console.log("sorted " + total + " events\nres length: " + res.length + "\ndiscarded: " + discarded);

        return res;
    };


    courseColors = StorageService.getOrDefault("courseColors", null);
    if (courseColors == null) {
        courseColors = {};
        StorageService.set("courseColors", courseColors);
    }
    var eventTypeColors = StorageService.getOrDefault("eventTypeColors", null);
    if (eventTypeColors == null) {
        eventTypeColors = {
            "frl": "#ac0000",
            "ovn": "#0081ac",
            "ovr": "#00994d",
            "ks": "#641f7a",
            "ten": "#59b300",
            "sem": "#cc6600"
        };
        StorageService.set("eventTypeColors", eventTypeColors);
    }

    var lastUpdate = StorageService.getOrDefault("lastUpdate", 0);
    var courses_temp = StorageService.getOrDefault("courses", null);
	
	var hidden = StorageService.getOrDefault("hidden", []);
	var extra = StorageService.getOrDefault("extra", []);

    if (courses_temp == null || now.getTime() - lastUpdate > 1000 * 3600 * 24) {
        updateSchemas();
    }
    else {
        console.log("updated " + new Date(lastUpdate).toLocaleDateString() + ", skipping this one");
        courses = courses_temp;
		//console.log("Extra:", extra);
        sorted = sortByDate(courses, extra);
        $state.go($state.current, {}, { reload: true });
    }

    return {
        //findByCode: findByCode,
        getCourses: function () {
            return courses;
        },
		saveCourses: function() {
			StorageService.set("courses", courses);
		},
		getHidden: function () {
			return hidden;
		},
		setHidden: function (h) {
			hidden = h;
			StorageService.set("hidden", h);
		},
		getExtra: function () {
			return extra;
		},
		addExtra: function (e, success, error) {
			$http.get(ApiEndpoint.url + URLs.courseInfo(e.courseCode, e.startTerm, e.roundId)).then(
				function successCallback(response) {
					var node = parseXml(response.data).documentElement.getElementsByTagName("title")[0];
					e.name = node.textContent;
					if (!courseColors[e.courseCode]) {
						courseColors[e.courseCode] = ConvenientService.randomColor();
						StorageService.set("courseColors", courseColors);
					}
					e.color = courseColors[e.courseCode];
					e.entries = [];
					
					extra.push(e);
					StorageService.set("extra", extra);
					if (success)
						success(e);
				},
				function errorCallback(response) {
					if (error)
						error(response);
			});
		},
		removeExtra: function (c) {
			for (var i = 0; i < extra.length; i++)
				if (c.courseCode == extra[i].courseCode && c.startTerm == extra[i].startTerm && c.roundId == extra[i].roundId) {
					extra.splice(i, 1);
					StorageService.set("extra", extra);
					break;
				}
		},
        getSortedEvents: function () {
            return sorted;
        },
        startDate: startDate,
        endDate: endDate,
        extractCourseCode: extractCourseCode,
        getCourseColors: function () {
            return courseColors;
        },
		saveCourseColors: function () {
			StorageService.set("courseColors", courseColors);
		},
        getEventTypeColors: function () {
            return eventTypeColors;
        },
		getErrors: function () {
			return errors;
		},
		getLastUpdate: function () {
			var lu = StorageService.getOrDefault("lastUpdate", 0);
			if (lastUpdate > lu)
				lu = lastUpdate;
			return lu ? lu : null;
		},
		getExtendedDiscard: function () {
			return extendedDiscard;
		},
		setExtendedDiscard: function (extD) {
			extendedDiscard = extD;
			StorageService.set("extendedDiscard", extD);
		},
		getMenusEnabled: function () {
			return menusEnabled;
		},
		setMenusEnabled: function (me) {
			menusEnabled = me;
			StorageService.set("menusEnabled", me);
		},
		getDelimiterEnabled: function () {
			return delimiterEnabled;
		},
		setDelimiterEnabled: function (de) {
			delimiterEnabled = de;
			StorageService.set("delimiterEnabled", de);
		},
		getMixEvents: function () {
			return mixEvents;
		},
		setMixEvents: function (me) {
			mixEvents = me;
			StorageService.set("mixEvents", me);
		},
		resort: function () {
		    sorted = sortByDate(courses, extra);
		},
		updateEventColors: function () {
		    for (var i = 0; i < courses.length; i++)
		        for (var j = 0; j < courses[i].entries.length; j++)
		            courses[i].entries[j].course.color = courses[i].color;
		    for (var i = 0; i < extra.length; i++)
		        for (var j = 0; j < extra[i].entries.length; j++)
		            extra[i].entries[j].course.color = extra[i].color;
		}
    };
	//} catch (e) {alert(e);}
})
;
