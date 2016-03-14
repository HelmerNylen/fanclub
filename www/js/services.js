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
	//läs in inställningar
	var extendedDiscard = StorageService.getOrDefault("extendedDiscard", true);
	//var menusEnabled = StorageService.getOrDefault("menusEnabled", true);
	var delimiterEnabled = StorageService.getOrDefault("delimiterEnabled", false);
	var mixEvents = StorageService.getOrDefault("mixEvents", true);
	
	var eventServiceCallback = null;

	//beräkna vilken årskurs fanclub går
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

	//körs när alla api-anrop är klara
    var onDone = function (noUpdate) {
		//för att se till att onDone bara körs en gång räknar vi alla anrop
        if (updatesLeft == 0) {
			if (!noUpdate)
				StorageService.set("lastUpdate", new Date().toDateString());
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
						//har vi inget i cachen meddelar vi användaren
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
					} else console.log("entries saknas:", course);

					updatesLeft--;
					onDone();
				},
				function errorCallback(response) {
					//fick vi ingen kursinfo försöker vi hämta den från cachen
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
						//hämtar ett xml-dokument över vilka kurser som finns för fanclub, deras kurskod, kursomgång och starttermin
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
						console.log("Error when parsing xml: " + e.message);
					}
				},
				function errorCallback(response) {
					//om vi inte får svar försöker vi i alla fall hämta scheman och info utifrån de kurser vi har i cachen, om vi har det
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
	
	//sorterar in ett event i en lista över events (mha linjärsök)
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

	//sorterar ihop händelser från alla kurser till en enda array
    var sortByDate = function (_courses, _extra) {
		//funktion för att välja bort händelser, exempelvis kurser användaren valt att gömma
        var discard = function (event) {
			var course = event.course;
			
			for (var i = 0; i < hidden.length; i++)
				if (hidden[i].courseCode == course.courseCode && hidden[i].roundId == course.roundId && hidden[i].startTerm == course.startTerm)
					return true;
					
			if (extendedDiscard) {
				//Specialkod för att ta bort mekaniklektioner vi inte går på, kan slås av i inställningarna
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
        console.log("updated " + lastUpdate + ", skipping this one");
        courses = courses_temp;
		//console.log("Extra:", extra);
        sorted = sortByDate(courses, extra);

		if (eventServiceCallback)
			eventServiceCallback();
		
        $state.go($state.current, {}, { reload: true });
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


.factory('EventService', function (DataService, SectionService, StorageService, ConvenientService) {
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
	
	var all = [];
	var index = {};
		
	var merge = function () {
		if (!kth || !section)
			return;
		
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
		
        var kthIndex = 0;
        var sectionIndex = 0;
        var currentSorted;
        var currentSection;

        while (kthIndex < kth.length && sectionIndex < section.length) {
            currentSorted = kth[kthIndex];
            currentSection = SectionService.convert(section[sectionIndex]);

            if (new Date(currentSorted.start).getTime() < new Date(currentSection.start).getTime()) {
                add(currentSorted);
                kthIndex++;
            } else {
                add(currentSection);
                sectionIndex++;
            }
        }

        if (kthIndex == kth.length)
            for (; sectionIndex < section.length; sectionIndex++)
                add(SectionService.convert(section[sectionIndex]));
        else
            for (; kthIndex < kth.length; kthIndex++)
                add(kth[kthIndex]);

        ready = true;
		for (var i = 0; i < callbacks.length; i++)
			callbacks[i]();
	};
	
	var eventsByDate = function (dateString, getkth, getsection) {
		var ind = index[dateString];
		if (ind) {
			var res = [];
			while (ind < all.length && new Date(all[ind].start).toDateString() == dateString) {
				if ((!all[ind].isSectionEvent && getkth) || (all[ind].isSectionEvent && getsection))
					res.push(all[ind]);
				ind++;
			}
			return res;
		}
		else return [];
	};
	
	merge();
	
	
	return {
		allByDate: function (dateString) {
			return ready ? eventsByDate(dateString, true, true) : null;
		},
		kthByDate: function (dateString) {
			return ready ? eventsByDate(dateString, true, false) : null;
		},
		sectionByDate: function (dateString) {
			return ready ? eventsByDate(dateString, false, true) : null;
		},
		isReady: function () {
			return ready;
		},
		registerCallback: function (cb) {
			callbacks.push(cb);
		},
		all: function () {
			return ready ? all : null;
		}
	};
})

;
