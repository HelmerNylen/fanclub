angular.module('starter.services', [])

//service för att spara data mellan sessioner
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

.factory('DebuggerService', function () {
	var log = [];
	var maxLength = 200;
	var callbacks = [];
	
    return {
		log: function (e, colorCode) {
			console.log(e);
			
			if (colorCode == undefined)
				colorCode = 0;
			
			log.push({entry: e, color: typeof(colorCode) == "string" ? colorCode : ["white", "red", "yellow", "#ff642b", "green"][colorCode]});
			if (log.length > maxLength)
				log = log.splice(maxLength - 1);
			
			for (var i = 0; i < callbacks.length; i++)
				callbacks[i]();
		},
		getLog: function () {
			return log;
		},
		clear: function () {
			log = [];
			
			for (var i = 0; i < callbacks.length; i++)
				callbacks[i]();
		},
		registerCallback: function (cb) {
			callbacks.push(cb);
		}
    };
})

//date and time shortcuts, among other things
.factory('ConvenientService', function (DebuggerService) {
    var weekdays = ["S\u00f6ndag", "M\u00e5ndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "L\u00f6rdag", "S\u00f6ndag"];
    var months = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
    var today = new Date().toDateString();
    var yesterday = new Date(new Date().getTime() - 1000 * 3600 * 24).toDateString();
    var tomorrow = new Date(new Date().getTime() + 1000 * 3600 * 24).toDateString();
    var twoDaysAgo = new Date(new Date().getTime() - 2 * 1000 * 3600 * 24).toDateString();
    var inTwoDays = new Date(new Date().getTime() + 2 * 1000 * 3600 * 24).toDateString();

    return {
		//formaterar ett datum som ex. "2016-02-19"
        dateFormat: function (date) {
            var d = new Date(date);

            return d.getFullYear() + "-" + (d.getMonth() < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1).toString()) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate().toString());
        },
		//formaterar ett datum som ex. "Imorgon, fredag den 19 februari" eller "Torsdag den 5 maj 2013"
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
		//ger dagens namn. 0 är söndag, då detta är JS :)))
        getDayName: function (day) {
            return weekdays[day];
        },
		getMonthName: function (month) {
			return months[month];
		},
		//ger en tid i millisekunder som t.ex. 2 dagar, 1 timme och 30 minuter
		//ger bara första komponenten (ex. 2 dagar) om roughEstimate är true
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
		//beräknar veckonumret för ett datum
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
		//ger en kontrasterande färg beroende på den angivna färgens luma
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
		//öppnar ett webbläsarfönster med den angivna urlen
		//try/catch då detta funkar olika i testmiljön och på telefonen
		openURL: function (url) {
			DebuggerService.log("Opening " + url, 2);
			try {
				cordova.InAppBrowser.open(url, "_system");
			} catch (e1) {
				window.open(url, "_blank");
			}
		},
		//ger en slumpad färg, kan göras mörkare med multiplier från 0-1 (default 1)
		randomColor: function (multiplier) {
			if (multiplier == undefined)
				multiplier = 1;
			var str = Math.floor(Math.random() * 16777215 * multiplier).toString(16);
			while (str.length < 6)
				str = "0" + str;
			return "#" + str;
		},
		//gör om en RGB-array till en hexfärgsträng
		RGBtohex: function (RGB) {
			var r = Math.floor(RGB[0]).toString(16);
			var g = Math.floor(RGB[1]).toString(16);
			var b = Math.floor(RGB[2]).toString(16);
			r = (r.length == 1) ? "0" + r : r;
			g = (g.length == 1) ? "0" + g : g;
			b = (b.length == 1) ? "0" + b : b;
			return "#" + r + g + b;
		},
		//gör om en hexfärgsträng till en RGB-array
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
		//gör om en RGB-array till en HSV-array (koordinatbyte för färger i princip, från kartesiska till cylinder om man vill)
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
		//gör om en HSV-array till en RGB-array
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
		//beräknar den tidigaste starten för en array med events
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
		//beräknar det sista slutet för en array med events
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
		//beräknar hur många krockar som uppstår mellan en given händelse och en mängd eventboxar (se WeekViewCtrl i controllers.js)
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

//hämtar KTH-händelser och data om olika kurser, samt lite inställningar
.factory('DataService', function ($http, $state, $rootScope, StorageService, DebuggerService, ConvenientService, GitService, ApiEndpoint, URLs) {
    //try {
	var now = new Date();
    var courses = null;
    var sorted = null;
	var hidden = null;
	var extra = null;
    var updatesLeft = -1;
    var courseColors = {};
	var errors = [];
	//läs in inställningar
	var extendedDiscard = StorageService.getOrDefault("extendedDiscard", true);
	//var menusEnabled = StorageService.getOrDefault("menusEnabled", true);
	var delimiterEnabled = StorageService.getOrDefault("delimiterEnabled", false);
	var mixEvents = StorageService.getOrDefault("mixEvents", true);
	var notFanclub = StorageService.getOrDefault("notFanclub", { enabled: false, startYear: 2015 });
	
	var eventServiceCallback = null;

	//beräkna vilken årskurs fanclub går
    var studyYear = Math.ceil((now - new Date((notFanclub.enabled ? notFanclub.startYear : 2015) + "-07-01")) / (1000 * 3600 * 24 * 365));
    if (studyYear > 5) studyYear = 5;
    if (studyYear < 1) studyYear = 1;

    var startDate = now.getMonth() >= 6 ? new Date(now.getFullYear(), 6) : new Date(now.getFullYear() - 1, 6);
    var endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth());


    var parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };

    var extractCourseCode = function (url) {
        var cut = url.substring(url.indexOf("course") + 7);
        return cut.substring(0, cut.indexOf("/"));
    };

	//körs när alla api-anrop är klara
    var onDone = function (noUpdate) {
		//för att se till att onDone bara körs en gång räknar vi alla anrop
        if (updatesLeft == 0) {
			if (!noUpdate) {
				StorageService.set("lastUpdate", new Date().toDateString());
				DebuggerService.log("Successful update", 4);
			}
            StorageService.set("courses", courses);
			StorageService.set("extra", extra);
            sorted = sortByDate(courses, extra);
			
			if (eventServiceCallback)
				eventServiceCallback();
			
            $state.go($state.current, {}, { reload: true });
            updatesLeft = -1;
        }
    };
	
	//get events from the KTH schema api
    var getCourseSchemas = function (_courses, _extra) {
		//hämtar schemat för en specifik kurs
		var getCourseSchema = function (cr) {
			$http.get(ApiEndpoint.url + URLs.schema(cr.courseCode, cr.startTerm, cr.roundId, startDate, endDate)).then(
				function successCallback(response) {
					//response.data är i det här fallet ett JSON-objekt, så det kan användas direkt
					cr.entries = response.data.entries;
					
					//vi lägger till kursdata (färg, namn etc.) på alla händelser
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
					//om vi inte får något svar försöker vi hämta allt från cachen
					DebuggerService.log("Error response when getting course schema: " + JSON.stringify(response), 1);
					updatesLeft--;
					var res = StorageService.getOrDefault("courses", null);
					if (res)
					{
						var ex = StorageService.getOrDefault("extra", []);
						for (var i = 0; i < ex.length; i++)
							res.push(ex[i]);
						
						DebuggerService.log("Using stored events.");
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
						//har vi inget i cachen meddelar vi användaren
						DebuggerService.log("Adding visible error");
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
			//hämtar scheman för alla kurser
			for (var i = 0; i < _courses.length; i++)
				getCourseSchema(_courses[i]);
			if (_extra)
				for (var i = 0; i < _extra.length; i++)
					getCourseSchema(_extra[i]);
		} catch (e) {
			DebuggerService.log(e, 1);
			DebuggerService.log("Adding visible error");
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
					//vi får en del data om kursen, men det enda vi använder är kursens namn
					var node = parseXml(response.data).documentElement.getElementsByTagName("title")[0];
					course.name = node.textContent;
					
					//vi ger kursen en färg om den inte har det
					if (!courseColors[course.courseCode]) {
						courseColors[course.courseCode] = ConvenientService.randomColor();
						StorageService.set("courseColors", courseColors);
					}
					course.color = courseColors[course.courseCode];
					
					//vi ger kursens händelser färg- och namndata, om det anropet kom in först
					if (course.entries) {
						for (var i = 0; i < course.entries.length; i++) {
							course.entries[i].course.name = (course.entries[i].course.name || course.name);
							course.entries[i].course.color = (course.entries[i].course.color || course.color);
						}
					}

					updatesLeft--;
					onDone();
				},
				function errorCallback(response) {
					//fick vi ingen kursinfo försöker vi hämta den från cachen
					DebuggerService.log("Error response when getting course information: " + JSON.stringify(response), 1);
					updatesLeft--;
					var res = StorageService.getOrDefault("courses", null);
					var throwError = false;
					if (res)
					{
						DebuggerService.log("Using stored course info for " + course.courseCode);
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
						DebuggerService.log("Adding visible error");
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
			DebuggerService.log(e, 1);
			DebuggerService.log("Adding visible error");
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
			$http.get(ApiEndpoint.url + URLs.plan(studyYear, notFanclub.enabled ? notFanclub.startYear : 2015)).then(
				function successCallback(response) {
					try {
						//hämtar ett xml-dokument över vilka kurser som finns för fanclub, deras kurskod, kursomgång och starttermin
						var nodes = parseXml(response.data).getElementsByTagName("courseRound");
						var res = [];
						for (var i = 0; i < nodes.length; i++)
							res.push({
								courseCode: nodes[i].attributes.getNamedItem("courseCode").value,
								startTerm: nodes[i].attributes.getNamedItem("startTerm").value,
								roundId: nodes[i].attributes.getNamedItem("roundId").value
							});
						courses = res;
						
						//hämta kursinfo och schema för alla dessa kurser, plus schema för alla extrakurser
						//extrakursernas info hämtas när de läggs till, och vi orkar inte uppdatera dem också
						updatesLeft = courses.length * 2 + extra.length;
						getCourseSchemas(courses, extra);
						for (var i = 0; i < courses.length; i++)
							getCourseInfo(courses[i]);

						//StorageService.set("lastUpdate", new Date().getTime());
						//StorageService.set("courses", courses);
					}
					catch (e) {
						DebuggerService.log("Error when parsing xml: " + e.message, 1);
					}
				},
				function errorCallback(response) {
					//om vi inte får svar försöker vi i alla fall hämta scheman och info utifrån de kurser vi har i cachen, om vi har det
					DebuggerService.log("Error response when getting list of courses: " + JSON.stringify(response), 1);
					var res = StorageService.getOrDefault("courses", null);
					if (res)
					{
						DebuggerService.log("Using stored courses.");
						courses = res;
						updatesLeft = courses.length * 2 + extra.length;
						getCourseSchemas(courses, extra);
						for (var i = 0; i < courses.length; i++)
							getCourseInfo(courses[i]);
					}
					else
					{
						DebuggerService.log("Adding visible error");
						//har vi inget cachat meddelar vi användaren
						errors.push({
							code: "Apelsin",
							message: "Kunde inte hämta kurslista från Kopps. Kontrollera att du är ansluten till internet.\n" + 
							"Kontakta utvecklaren om problemet kvarstår.",
							information: [
								response.status ? { label: "Status", data: response.status } : null,
								response.statusText ? { label: "Statustext", data: response.statusText } : null,
								response.data ? {
										label: "Data",
										//kopps skickar vanligtvis xml-data, men är den nere får man en hel html-sida som svar, så vi skriver inte ut hela den
										data: response.status == 503 ? "Termporarily unavailible. We apologize for the inconvenience." : response.data
									} : null
							]
						});
						$state.go($state.current, {}, { reload: true });
					}
				});
		} catch (e) {
			DebuggerService.log(e, 1);
			DebuggerService.log("Adding visible error");
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
	
	//sorterar in ett event i en lista över events (mha linjärsök)
    var insertInto = function(schemaArray, event) {
        //för att inte ios ska gå sönder
        event.start = event.start.replace(/-/ig, "/");
        event.end = event.end.replace(/-/ig, "/");
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

	//sorterar ihop händelser från alla kurser till en enda array
    var sortByDate = function (_courses, _extra) {
		var discardArray;
		try {
			discardArray = GitService.getContent().discard["" + (notFanclub.enabled ? notFanclub.startYear : 2015)];
			//DebuggerService.log(discardArray);
		} catch (e) {
			DebuggerService.log("Error when reading discard object");
			DebuggerService.log(e);
			DebuggerService.log(GitService.getContent());
			discardArray = null;
		}
		
		//funktion för att välja bort händelser, exempelvis kurser användaren valt att gömma
        var discard = function (event) {
			var course = event.course;
			
			for (var i = 0; i < hidden.length; i++)
				if (hidden[i].courseCode == course.courseCode && hidden[i].roundId == course.roundId && hidden[i].startTerm == course.startTerm)
					return true;
					
			if (extendedDiscard && discardArray) {
				//Specialkod för att ta bort mekaniklektioner vi inte går på, kan slås av i inställningarna
				//hämtas numera live från github
				
				//objekt för jämförelse, regexar och liknande kanske bör byggas en gång innan, stället för separat för varje event
				for (var i = 0; i < discardArray.length; i++) {
					var rule = discardArray[i];
					var conditionsFulfilled = true;
					for (var property in rule) {
						var propertyValue;
						if (property == "code")
							propertyValue = event.course.courseCode;
						else if (property == "locations")
							propertyValue = event.locations.map((l) => l.name);
						else if (property == "locations_url")
							propertyValue = event.locations.map((l) => l.url);
						else if (property == "type_name_swe")
							propertyValue = event.type_name.sv;
						else {
							try {
								propertyValue = event[property];
							} catch (e) {
								DebuggerService.log("Discard property error")
								DebuggerService.log(e);
								return false;
							}
						}
						
						var comparison = {
							//grundläggande
							"==": (a, b) => a == b,
							"===": (a, b) => a === b,
							"!=": (a, b) => a != b,
							"!==": (a, b) => a !== b,
							">": (a, b) => a > b,
							"<": (a, b) => a < b,
							//strings
							"case insensitive equals": (a, b) => a.toLowerCase() == b.toLowerCase(),
							"case insensitive inequals": (a, b) => a.toLowerCase() != b.toLowerCase(),
							"matches": (a, b) => !!(a.match(new RegExp(b, "ig"))),
							"case sensitive matches": (a, b) => !!(a.match(new RegExp(b, "g"))),
							//datum
							"earlier than": (a, b) => new Date(a) < new Date(b),
							"later than": (a, b) => new Date(a) > new Date(b),
							"same date": (a, b) => new Date(a).toDateString() == new Date(b).toDateString(),
							"different date": (a, b) => new Date(a).toDateString() != new Date(b).toDateString(),
							//för arrayer
							"contains": (a, b) => a.indexOf(b) != -1,
							"lacks": (a, b) => a.indexOf(b) == -1,
							"no match": (a, b) => !(a.some((x) => x.match(new RegExp(b, "ig")))),
							"no case sensitive match": (a, b) => !(a.some((x) => x.match(new RegExp(b, "g")))),
							"any match": (a, b) => a.some((x) => x.match(new RegExp(b, "ig"))),
							"any case sensitive match": (a, b) => a.some((x) => x.match(new RegExp(b, "g"))),
							"all match": (a, b) => a.every((x) => x.match(new RegExp(b, "ig"))),
							"all case sensitive match": (a, b) => a.every((x) => x.match(new RegExp(b, "g")))
						}[rule[property][0]];
						
						if (comparison) {
							try {
								var checkValue = rule[property][1];
								
								//console.log(event, rule, property, propertyValue, checkValue, "Match:", comparison(propertyValue, checkValue))
								
								if (!comparison(propertyValue, checkValue)) {
									conditionsFulfilled = false;
									break;
								}
							} catch (e) {
								DebuggerService.log("Discard comparison error")
								DebuggerService.log(e);
								return false;
							}
						} else return false;
					}
					if (conditionsFulfilled)
						return true;
				}
				
				/*if (course.courseCode.toLowerCase() == "sg1130") {
					return event.url.toLowerCase().indexOf("ctfys") == -1;
				}
				if (course.courseCode.toLowerCase() == "sf1901") {
					return false;// !(event.url.toLowerCase().indexOf("ht-2016-tcomk-7") == -1
					//&& event.url.toLowerCase().indexOf("ht-2016-634") == -1
					//&& event.url.toLowerCase().indexOf("ht-2016-635") == -1
					//&& event.url.toLowerCase().indexOf("ht-2016-636") == -1
					//&& event.url.toLowerCase().indexOf("ht-2016-637") == -1);
				}*/
			}
			return false;
		};
		
		var all = [];
		for (var i = 0; i < _courses.length; i++)
			all.push(_courses[i]);
		if (_extra)
			for (var i = 0; i < _extra.length; i++)
				all.push(_extra[i]);
		
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
        DebuggerService.log("Sorted " + total + " events. " + res.length + " are used, " + discarded + " were discarded", 4);
		
        return res;
    };


	//läs in kursfärger, eller skapa en ny tom lista över dem om vi inte har några
    courseColors = StorageService.getOrDefault("courseColors", null);
    if (courseColors == null) {
        courseColors = {};
        StorageService.set("courseColors", courseColors);
    }
	
	//läs in händelsetypsfärger, eller skapa en lista med defaultfärgerna om vi inte har några
    var eventTypeColors = StorageService.getOrDefault("eventTypeColors", null);
    if (eventTypeColors == null) {
        eventTypeColors = {
            "frl": "#ac0000",
            "ovn": "#0081ac",
            "ovr": "#00994d",
            "ks":  "#641f7a",
            "ten": "#59b300",
            "sem": "#cc6600"
        };
        StorageService.set("eventTypeColors", eventTypeColors);
    }

    var lastUpdate = StorageService.getOrDefault("lastUpdate", null);
    var courses_temp = StorageService.getOrDefault("courses", null);
	
	//extra är de kurser användaren lagt till, hidden är de kurser de valt att gömma, så händelserna för kurser i hidden hänger inte med in i sorted
	var hidden = StorageService.getOrDefault("hidden", []);
	var extra = StorageService.getOrDefault("extra", []);

    if (courses_temp == null || now.toDateString() != lastUpdate) {
        updateSchemas();
    }
    else {
        DebuggerService.log("Updated " + lastUpdate + ", skipping this one");
        courses = courses_temp;
        sorted = sortByDate(courses, extra);

		if (eventServiceCallback)
			eventServiceCallback();
		
        $state.go($state.current, {}, { reload: true });
    }

    //uppdatera datan när användaren öppnar appen om det är en ny dag
    document.addEventListener("resume", onResume, false);
    function onResume() {
        if (new Date().toDateString() != lastUpdate && new Date().toDateString() != StorageService.getOrDefault("lastUpdate", null)) {
            DebuggerService.log("Reloading due to day change");
            window.location.reload(true);
        }
    }

	//själva servicen blir ett objekt med getters/setters för olika värden
    return {
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
			//hämta info om extrakursen och callbacka beroende på om det lyckades
			$http.get(ApiEndpoint.url + URLs.courseInfo(e.courseCode, e.startTerm, e.roundId)).then(
				function successCallback(response) {
					//vi lägger i princip till kursen som vanligt, fast i extra-arrayen i stället
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
			var lu = StorageService.getOrDefault("lastUpdate", null);
			if (new Date(lastUpdate) > new Date(lu))
				lu = lastUpdate;
			return lu || null;
		},
		getExtendedDiscard: function () {
			return extendedDiscard;
		},
		setExtendedDiscard: function (extD) {
			extendedDiscard = extD;
			StorageService.set("extendedDiscard", extD);
		},
		/*getMenusEnabled: function () {
			return menusEnabled;
		},
		setMenusEnabled: function (me) {
			menusEnabled = me;
			StorageService.set("menusEnabled", me);
		},*/
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
		getNotFanclub: function () {
		    return notFanclub;
		},
		setNotFanclub: function (nf) {
		    notFanclub = nf;
		    StorageService.set("notFanclub", nf);
		},
		resort: function () {
		    sorted = sortByDate(courses, extra);
		},
		//går igenom alla händelser och sätter rätt färg på dem, ifall kursfärgen ändrats
		updateEventColors: function () {
		    for (var i = 0; i < courses.length; i++)
		        for (var j = 0; j < courses[i].entries.length; j++)
		            courses[i].entries[j].course.color = courses[i].color;
		    for (var i = 0; i < extra.length; i++)
		        for (var j = 0; j < extra[i].entries.length; j++)
		            extra[i].entries[j].course.color = extra[i].color;
		},
		setEventServiceCallback: function (cb) {
			eventServiceCallback = cb;
		}
    };
	//} catch (e) {alert(e);}
})


.factory('ProgramService', function ($http, ProgramEndpoint, URLs, StorageService, DebuggerService) {
    var events = StorageService.getOrDefault("ProgramEvents", null);
    var lastUpdate = StorageService.getOrDefault("ProgramLastUpdate", null);
    var fail = false;
    var callbacks = [];

    //ger ett xmlträd från en sträng
    var parseXml = function (xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };

    //ger en array bland nodens direkta barn
    var getElementsByClassName = function (element, className) {
        var res = [];
        var children = element.childNodes;
        for (var i = 0; i < children.length; i++) {
            try {
                if (children[i].getAttribute("class").indexOf(className) != -1)
                    res.push(children[i]);
            }
            catch (e) { }
        }
        return res;
    };
    //ger första träffen bland alla descendants
    var getElementByClassName = function (element, className) {
        var children = element.childNodes;
        for (var i = 0; i < children.length; i++) {
            try {
                if (children[i].getAttribute("class") == className)
                    return children[i];
            }
            catch (e) { }
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

    var extractEvents = function (xml) {
        var res = [];
		
        var heads = getElementsByClassName(firstChild(xml.documentElement), "event_head");
        var details = getElementsByClassName(firstChild(xml.documentElement), "event_details");

        if (heads.length != details.length)
            throw "Length mismatch when getting program calendar - check the website";

        for (var i = 0; i < heads.length; i++) {
            var h = heads[i], d = details[i];
            var event = {
                url: "",
                start: "",
                end: "",
                title: "",
                type: "",
                type_name: {
                    sv: "", en: ""
                },
                locations: [],
                group: "",
                info: "",
                course: {
                    color: '#1954a6',
                    courseCode: "Programinfo",
                    name: ""
                },
                isProgramEvent: true
            };
            var title = firstChild(getElementsByClassName(h, "titlecolumn")[0]);
            var url = title.getAttribute("href");
            if (url.indexOf("http://") == -1)
                url = "http://www.kth.se" + url;
            event.url = url;
            event.title = title.textContent.trim();
            
            var time = getElementsByClassName(h, "time")[0].textContent.trim();
            try {
                event.start = getDateString(time, true);
                event.end = getDateString(time, false);
            } catch (e) {
                DebuggerService.log("Error when reading program event start and end, skipping event.");
                DebuggerService.log(e);
                continue;
            }

            event.type_name.sv = getElementByClassName(d, "type").textContent.trim();
            event.type = getAppropriateType(event.type_name.sv);
			
			var extNote = getElementByClassName(d, "external_note");
            if (extNote) {
				event.info = extNote.textContent.trim();
				if (event.info.indexOf("Anmärkning: ") == 0)
					event.info = event.info.replace("Anmärkning: ", "");
				else if (event.info.indexOf("Note: ") == 0)
					event.info = event.info.replace("Note: ", "");
				event.course.name = event.info;
			} else 
				continue; //skippa eventet om det inte har någon information - antagligen inget man vill ha i schemat ändå

            if (getElementsByClassName(getElementByClassName(d, "type_and_place"), "location-info").length != 0) {
                var locations = getElementByClassName(getElementByClassName(d, "type_and_place"), "location-info").getElementsByTagName("a");
                for (var j = 0; j < locations.length; j++) {
                    var location = {
                        name: locations[j].textContent.trim(),
                        url: locations[j].getAttribute("href")
                    };
                    if (location.url.indexOf("http://") == -1)
                        location.url = "http://www.kth.se" + location.url;
                    event.locations.push(location);
                }
				
				if (event.locations.length == 0)
					event.locations.push({
						name: getElementByClassName(getElementByClassName(d, "type_and_place"), "location-info").textContent.replace(/Plats:/ig, "").replace(/Location:/ig, "").trim(),
						url: ""
					});
            }
            
            res.push(event);
        }

        return res;
    };

    var getDateString = function (str, getStart) {
        var split = str.split(" ");
        if (split.length != 4)
            throw "Incorrectly formatted string: " + str;

        var year = new Date().getFullYear();
        var month = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"].indexOf(split[2].toLowerCase());
        if (month == -1)
            month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(split[2].toLowerCase());
        if (month == -1)
            throw "Odefinierad månad: " + split[2];
        var date = split[1];
        var subsplit = split[3].split(/(-|:)/g);
        var hour, minute;

        if (getStart) {
            hour = subsplit[0];
            minute = subsplit[2];
        } else {
            hour = subsplit[4];
            minute = subsplit[6];
        }

        month++;
        if (month < 10)
            month = "0" + month;
        if (date < 10)
            date = "0" + date;

        return year + "/" + month + "/" + date + " " + hour.trim() + ":" + minute.trim() + ":00";
    };

    var getAppropriateType = function (str) {
        return {
            "information": "Frl",
            "övrigt": "Ovr"
        }[str.toLowerCase()] || "Ovr";
    };

    var onDone = function () {
        if (!fail) {
            StorageService.set("ProgramEvents", events);
            StorageService.set("ProgramLastUpdate", new Date().toDateString());

            for (var i = 0; i < callbacks.length; i++)
                callbacks[i]();
        }
    };

    var update = function () {
        $http.get(ProgramEndpoint.url + URLs.programCalendar()).then(
			function successCallback(response) {
			    try {
			        var partial = response.data.substring(response.data.indexOf('<table class="compact-event-list">'));
			        partial = partial.substring(0, partial.indexOf('</table>') + '</table>'.length);

			        var xml = parseXml(partial);
			        events = extractEvents(xml);
			    } catch (e) {
			        DebuggerService.log(e, 1);
					DebuggerService.log("Error occurred in program event service")
			        fail = true;
			    }
			    onDone();
			},
			function errorCallback(response) {
			    DebuggerService.log("Error when getting program calendar: " + JSON.stringify(response), 1);
			    fail = true;
			    onDone();
			});
    };

    if (new Date().toDateString() != lastUpdate)
        update();
    else {
        DebuggerService.log("Using cached program calendar events", 4);
        if (events == null)
            events = [];

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


.factory('EventService', function (DataService, SectionService, StorageService, ConvenientService, KthCalendarService, ProgramService, GitService) {
	var ready = false;
	var callbacks = [];
	
	var kth = DataService.getSortedEvents();
	if (!kth)
		DataService.setEventServiceCallback(function () {
			kth = DataService.getSortedEvents();
			merge();
		});
	
	var section = SectionService.getEvents();
	if (!section)
		SectionService.setEventServiceCallback(function () {
			section = SectionService.getEvents();
			merge();
		});
	
	var official = KthCalendarService.getEvents();
	if (!official)
		KthCalendarService.registerCallback(function () {
			official = KthCalendarService.getEvents();
			merge();
		});

	var program = ProgramService.getEvents();
	if (!program)
	    ProgramService.registerCallback(function () {
	        program = ProgramService.getEvents();
	        merge();
	    });
	
	var gitcontent = (GitService.getContent() || {}).events;
	if (!gitcontent)
		GitService.registerCallback(function () {
			gitcontent = GitService.getContent().events;
			merge();
		});
	
	
	var all = [];
	var index = {};
		
	var merge = function () {
		if (!kth || !section || !official || !program) //gitcontent medvetet utelämnad så att appen inte fryser om man råkar ta bort händelserna från live
			return;
		
		var git = gitcontent ? generateGitEvents(gitcontent) : [];
		gitcontent = null;
		
		var latestDate = null;
		var add = function (event) {
		    if (new Date(event.start).toDateString() != latestDate) {
				latestDate = new Date(event.start).toDateString();
				index[latestDate] = all.length;
			}
			all.push(event);
		};
		
		all = [];
		index = {};
		
        var kthIndex = 0, sectionIndex = 0, officialIndex = 0, programIndex = 0, gitIndex = 0;
        var currentSorted, currentSection, currentOfficial, currentProgram, currentGit;

        while (kthIndex < kth.length || sectionIndex < section.length || officialIndex < official.length || programIndex < program.length || gitIndex < git.length) {
            currentSorted = kthIndex < kth.length ? kth[kthIndex] : null;
            currentSection = sectionIndex < section.length ? SectionService.convert(section[sectionIndex]) : null;
            currentOfficial = officialIndex < official.length ? official[officialIndex] : null;
            currentProgram = programIndex < program.length ? program[programIndex] : null;
			currentGit = gitIndex < git.length ? git[gitIndex] : null;
			
			var earliest = currentSorted || currentSection || currentOfficial || currentProgram || currentGit;
			
			if (currentOfficial && new Date(currentOfficial.start).getTime() < new Date(earliest.start).getTime())
			    earliest = currentOfficial;
            if (currentProgram && new Date(currentProgram.start).getTime() < new Date(earliest.start).getTime())
                earliest = currentProgram;
			if (currentSection && new Date(currentSection.start).getTime() < new Date(earliest.start).getTime())
				earliest = currentSection;
			if (currentSorted && new Date(currentSorted.start).getTime() < new Date(earliest.start).getTime())
				earliest = currentSorted;
			if (currentGit && new Date(currentGit.start).getTime() < new Date(earliest.start).getTime())
				earliest = currentGit;
			
			add(earliest);
			if (earliest == currentOfficial) officialIndex++;
			else if (earliest == currentSection) sectionIndex++;
			else if (earliest == currentProgram) programIndex++;
			else if (earliest == currentGit) gitIndex++;
            else kthIndex++;
        }

        ready = true;
		for (var i = 0; i < callbacks.length; i++)
			callbacks[i]();
	};
	
	var eventsByDate = function (dateString, getkth, getsection, getofficial, getprogram, getcustom) {
		var ind = index[dateString];
		if (ind) {
			var res = [];
			while (ind < all.length && new Date(all[ind].start).toDateString() == dateString) {
			    if ((!all[ind].isSectionEvent && !all[ind].isOfficialEvent && !all[ind].isProgramEvent && getkth) || (all[ind].isSectionEvent && getsection) || (all[ind].isOfficialEvent && getofficial) || (all[ind].isProgramEvent && getprogram))
					res.push(all[ind]);
				ind++;
			}
			return res;
		}
		else return [];
	};
	
	var generateGitEvents = function (gc) {
		var res = [];
		var e;
		var year = DataService.getNotFanclub();
		year = year.enabled ? year.startYear % 100 : 15;
		for (var i = 0; i < gc.length; i++) {
			e = gc[i];
			if (e.years.indexOf(-1) == -1 && e.years.indexOf(year) == -1)
				continue;
			e.course = { name: (e.subject || "").trim(), color: "#ff642b" };
			e.locations = [{ name: e.location }];
			e.isCustomEvent = true;
			e.type = "custom";
			res.push(e);
		}
		
		return res;
	};
	
	merge();
	
	
	return {
		allByDate: function (dateString) {
			return ready ? eventsByDate(dateString, true, true, true, true, true) : null;
		},
		kthByDate: function (dateString) {
			return ready ? eventsByDate(dateString, true, false, false, false, false) : null;
		},
		sectionByDate: function (dateString) {
			return ready ? eventsByDate(dateString, false, true, false, false, false) : null;
		},
		getByDate: function (dateString, getKth, getSection, getOfficial, getProgram, getCustom) {
			return ready ? eventsByDate(dateString, getKth, getSection, getOfficial, getProgram, getCustom) : null;
		},
		isReady: function () {
			return ready;
		},
		registerCallback: function (cb) {
			callbacks.push(cb);
		},
		all: function () {
			return ready ? all : null;
		},
		refresh: function () {
			ready = false;
			
			kth = DataService.getSortedEvents();
			section = SectionService.getEvents();
			official = KthCalendarService.getEvents();
			merge();
		}
	};
})

;
