angular.module('starter.controllers', [])

//controller som är synlig i hela appen
.controller('AppCtrl', function ($scope, $ionicModal, $timeout, DebuggerService, DataService, ConvenientService, NoteService) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
	
	
	//skapar detaljyvy för en KTH-händelse som popup
    $ionicModal.fromTemplateUrl('templates/modals/details.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
        modal.show(); modal.hide();
    });
	
	//skapar detaljyvy för en sektionshändelse som popup
	$ionicModal.fromTemplateUrl('templates/modals/sectiondetails.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.sectionModal = modal;
        modal.show(); modal.hide();
    });

    //skapar modal för att skriva anteckningar på händelser
	$ionicModal.fromTemplateUrl('templates/modals/note.html', {
	    scope: $scope
	}).then(function (modal) {
	    $scope.noteModal = modal;
	});
	$scope.note = {};


	$scope.closeDetails = function () {
        $scope.modal.hide();
    };
	$scope.closeSectionDetails = function () {
		$scope.sectionModal.hide();
	};

	$scope.openNote = function (event) {
	    $scope.noteModal.show();
	};

	$scope.saveNote = function (event, note) {
	    if (note == null || note.length == 0)
	        NoteService.clearNote(event);
	    else
	        NoteService.setNote(note, event);
	    $scope.noteModal.hide();
	};

	$scope.closeNote = function () {
	    $scope.note.note = NoteService.getNote($scope.note.event) || "";
	    $scope.noteModal.hide();
	};

	$scope.split = function (n) {
	    return n.split(/\r?\n/ig);
	};

	//öppnar KTH-popupen och sätter värden som används
    $scope.openEvent = function (event) {
		DebuggerService.log("Opening KTH event modal", "yellow")
		DebuggerService.log(JSON.stringify(event));
		$scope.modalEvent = event;
		$scope.course = event.course;
		$scope.courseBGcolor = $scope.course.color;
		$scope.coursecolor = ConvenientService.contrastingColor($scope.courseBGcolor);
		$scope.eventBGcolor = DataService.getEventTypeColors()[event.type.toLowerCase()];
		$scope.eventcolor = ConvenientService.contrastingColor($scope.eventBGcolor);
		$scope.hasBegun = new Date() >= new Date(event.start);
		$scope.note.note = NoteService.getNote(event) || "";
		$scope.note.event = event;
		
        $scope.modal.show();
    };
	
	$scope.openSectionEvent = function (event) {
		DebuggerService.log("Opening section event modal", "yellow")
		DebuggerService.log(JSON.stringify(event));
		$scope.sectionModalEvent = event;
		$scope.hasBegun = new Date() >= new Date(event.isOfficialEvent ? event.start : event.start.dateTime || event.start.date);
		$scope.note.note = NoteService.getNote(event) || "";
		$scope.note.event = event;
		
		$scope.sectionModal.show();
	};
	$scope.openInBrowser = ConvenientService.openURL;
	
	//funktioner för att på ett snyggt sätt skriva hur länge en händelse pågår
	$scope.duration = function (event) {
		return ConvenientService.timeFormat(new Date(event.end).getTime() - new Date(event.start).getTime());
	};
	$scope.sectionDuration = function (event) {
		if (event.isOfficialEvent || event.isCustomEvent) {
			if (event.end)
				return ConvenientService.timeFormat(new Date(event.end).getTime() - new Date(event.start).getTime());
			else return false;
		}
		if (event.start.date && event.end.date) {
			var days = Math.round((new Date(event.end.date).getTime() - new Date(event.start.date).getTime()) / (1000 * 3600 * 24));
			return (days == 1 ? "1 dag" : days + " dagar");
		} else return ConvenientService.timeFormat(new Date(event.end.dateTime || event.end.date).getTime() - new Date(event.start.dateTime || event.start.date).getTime());
	};
	
	//funktioner för att på ett snyggt sätt skriva när en händelse börjar
	$scope.exactDateFormat = ConvenientService.dateFormat;
	$scope.dateFormat = function (date, notime) {
		var d = new Date(date);
		if (notime)
			return ConvenientService.verboseDateFormat(d);
		
		var time = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
		if (d.toDateString() == ConvenientService.today) {
			if (d <= new Date())
				return "kl " + time;
			else
				return "kl " + time + ", om " + ConvenientService.timeFormat(d.getTime() - new Date().getTime(), true);
		}
		else
			return ConvenientService.verboseDateFormat(d) + " kl " + time;
	};
	
	
	//$scope.menusEnabled = DataService.getMenusEnabled();
	
    $scope.feedStart = ConvenientService.dateFormat(new Date());
    $scope.feedEnd = ConvenientService.dateFormat(DataService.endDate);
	
	//visar eller döljer matknappen när användaren ändrar i inställningarna
	var refresh = function(e) {
		$scope.menusEnabled = DataService.getMenusEnabled();
    };
	$scope.$on('menusEnabledToggle', refresh);
	$scope.$on('$destroy', function () {
	    $scope.modal.remove();
	    $scope.sectionModal.remove();
	    $scope.noteModal.remove();
	});

    //pick monday this week, or the next week if it is currently weekend
    var weekStart = new Date();
    if (weekStart.getDay() == 6 || weekStart.getDay() == 0)
        weekStart = new Date(weekStart.getTime() + 1000 * 3600 * 24 * 3);
    while (weekStart.getDay() > 1)
        weekStart = new Date(weekStart.getTime() - 1000 * 3600 * 24);
    $scope.weekStart = ConvenientService.dateFormat(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()));
	
	$scope.month = new Date().getMonth() + 1;
	$scope.year = new Date().getFullYear();
})

//controller för week.html
.controller('WeekViewCtrl', function ($scope, $state, $stateParams, DataService, ConvenientService, SectionService, EventService) {
	//hämta färglistan för olika händelser
    var colorRef = DataService.getEventTypeColors();
    $scope.typeColor = function (event) {
		//lägg till ny (lite mörkare) färg för händelsetypen om vi inte stött på den tidigare
        if (event.type) {
            if (!colorRef[event.type.toLowerCase()]) {
                colorRef[event.type.toLowerCase()] = ConvenientService.randomColor(0.7);
                StorageService.set("eventTypeColors", colorRef);
            }
            return colorRef[event.type.toLowerCase()];
        }
        else return "#ff642b";
    };
	
    $scope.color = function (event) {
        return event.course.color;
    };
    $scope.getTime = function (date) {
		var d = date;
		if (!d.getFullYear)
			d = new Date(date);
        return d.getHours() + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
    };
	//sammanfatta vilka lokaler händelsen utspelar sig i
    $scope.location = function (eventLocations) {
	    var str = "";
	    for (var i = 0; i < eventLocations.length; i++)
	        str += eventLocations[i].name + ", ";
	    return str.substring(0, str.length - 2);
    };
	$scope.dayName = ConvenientService.getDayName;
	$scope.contrastingColor = ConvenientService.contrastingColor;
	$scope.today = ConvenientService.today;
	
	//definiera gränser för veckan - endast händelser som faller inom denna ram visas
    $scope.start = new Date($stateParams.startTime);
    $scope.start.setHours(0);
    $scope.end = new Date($scope.start.getTime() + 1000 * 3600 * 24 * 7 - 1);
	
	//nästa veckas startdag
    $scope.next = (function () {
        var d = new Date($scope.start);
        d.setDate(d.getDate() + 7)
        return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1) + "-" + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
    })();
	
	//föregående veckas startdag
    $scope.previous = (function () {
        var d = new Date($scope.start);
        d.setDate(d.getDate() - 7);
        return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1) + "-" + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
    })();

	//fult hack för att tvinga "Ovveonsdag!" och andra långa heldagshändelser att inte peta ut på nästa dag
	//gör egentligen ingenting, men tvingar på något automagiskt sätt in texten i textrutan
    $scope.fix = function () {
        var toFix = document.getElementsByClassName("allDayEvent");
        for (var i = 0; i < toFix.length; i++)
            toFix[i].childNodes[1].style.width = (toFix[i].offsetWidth - 2) + "px";
    };

	//körs varje gång veckan öppnas
    var refresh;
    refresh = function () {
        $scope.weekNumber = ConvenientService.weekNumber($scope.start);
		
        if (EventService.isReady()) {
			//vi har 5 eller 7 dagar med lite namn och datum, samt en array med eventlådor
			//eventlådorna har en referens till eventet, och låter oss hålla koll på om det sker fler saker samtidigt
			//systemet funkar halvkackigt, men krockar bara två saker kan den hantera det iaf
            var allEvents = [];
            var days = [];
            for (var i = 0; i < 7; i++) {
                var d = new Date($scope.start.getTime() + 1000 * 3600 * 24 * i)
                days.push({
                    name: ConvenientService.getDayName(i + 1),
                    dateString: d.getDate() + "/" + (d.getMonth() + 1),
                    eventBoxes: [],
                    date: d.toDateString()
                });
			}
			
			var hasOverlap = false;
			
			for (var i = 0; i < 7; i++) {
				var events = EventService.getByDate(days[i].date, true, DataService.getMixEvents(), false, true, true);
				
				for (var j = 0; j < events.length; j++) {
					var start, end;
					
					if (events[j].isAllDayEvent) {
						if (events[j].isCustomEvent) {
							start = new Date(events[j].start.substring(0, 4), events[j].start.substring(5, 7) - 1, events[j].start.substring(8));
							end = new Date(start.getTime() + new Date(events[j].end).getTime() - new Date(events[j].start).getTime() - 1);
						}
						else {
							start = new Date(events[j].original.start.date.substring(0, 4), events[j].original.start.date.substring(5, 7) - 1, events[j].original.start.date.substring(8));
							end = new Date(start.getTime() + new Date(events[j].end).getTime() - new Date(events[j].start).getTime() - 1);
						}
					} else {
						start = new Date(events[j].start);
						end = new Date(events[j].end);
					}

					allEvents.push(events[j]);
					
					//om det är en heldagshändelse splittar den i en eventbox för varje dag, där alla pekar på samma originalhändelse
					//heldagshändelser krockar inte utan staplas alltid på varandra, så vi hårdkodar att de är ensamma och först
					if ((events[j].isSectionEvent && events[j].original.start.date) || (events[j].isCustomEvent && events[j].isAllDayEvent)) {
						var dur = Math.round((new Date(events[j].end).getTime() - new Date(events[j].start).getTime()) / (1000 * 3600 * 24));
						for (var k = 0; k < dur && (start.getDay() + 6) % 7 + k < 7; k++) {
							days[(start.getDay() + 6 + k) % 7].eventBoxes.push({
								event: events[j],
								simultaneous: 1,
								index: 0,
								allDay: true
							});
						}
					} else {
						//vi kollar hur många händelser som redan är ditlagda i eventboxlistan på samma tid, oftast är detta 0 (händelsen själv exkluderas)
						var sim = ConvenientService.collisions(events[j], days[(start.getDay() + 6) % 7].eventBoxes);
						var indexes = [true];
						for (var k = 0; k < sim.length; k++) {
							sim[k].simultaneous = sim.length + 1;
							indexes.push(true);
						}
						var simindex = sim.length;
						for (var k = 0; k < sim.length; k++)
							if (sim[k].index < indexes.length)
								indexes[sim[k].index] = false;
						for (var k = 0; k < indexes.length; k++)
							if (indexes[k]) {
								simindex = k;
								break;
							}
						
						//stoppa händelsen i en låda på rätt dag
						var endtime;
						if (end.toDateString() != start.toDateString()) {
							hasOverlap = true;
							endtime = new Date(start);
							endtime.setHours(23); endtime.setMinutes(59);
							endtime = endtime.getTime();
						} else
							endtime = end.getTime();
						
						days[(start.getDay() + 6) % 7].eventBoxes.push({
							event: events[j],
							//tiderna mäts i millisekunder
							timeTop: (start.getHours() * 60 + start.getMinutes()) * 60 * 1000,
							timeHeight: (endtime - start.getTime()),
							simultaneous: sim.length + 1,
							index: simindex,
							allDay: false
						});
					}
				}
			}
			
			//om inget händer på helgen tar vi bort de dagarna
			//det är ett fritt land, vi får göra så
			if (days[5].eventBoxes.length == 0 && days[6].eventBoxes.length == 0) {
			    days.pop();
			    days.pop();
			}
			
            $scope.days = days;
			
			//beräkna hur många tidsstreck vi ska visa, visar alltid minst 8:00-17:00 hur som helst
            $scope.earliest = Math.min(ConvenientService.earliestTimeOfDay(allEvents), 1000 * 3600 * 8);
            $scope.latest = Math.max(ConvenientService.latestTimeOfDay(allEvents), 1000 * 3600 * 17);
			if (hasOverlap)
				$scope.latest = 1000 * 3600 * 24 - 1;
			var hours = [];
			for (var i = $scope.earliest; i <= $scope.latest; i += 1000 * 3600)
			    hours.push(i);
			$scope.hours = hours;
			
			//beräkna hur många heldagshändelser som ligger på samma dag som mest
			//detta trycker ned övriga schemat, som måste göras lite kompaktare
			var maxAllDayEvents = 0;
			for (var i = 0; i < days.length; i++) {
			    var counter = 0;
			    for (var j = 0; j < days[i].eventBoxes.length; j++)
			        if (days[i].eventBoxes[j].allDay)
			            counter++;
			    maxAllDayEvents = Math.max(maxAllDayEvents, counter);
			}
			
			//definiera en timmes längd i schemat. ögonmåttat, men verkar typ oftast duga
			$scope.unit = (80 - 3 * maxAllDayEvents) / (hours.length);
        }
        else {
			$scope.days = null;
			EventService.registerCallback(refresh);
		}
    };

    $scope.$on('$ionicView.enter', refresh);
})

//controller för month.html
.controller('MonthViewCtrl', function ($scope, $state, $stateParams, DataService, ConvenientService, EventService) {
	$scope.month = $stateParams.month * 1;
	$scope.year = $stateParams.year * 1;
	
	$scope.next = $scope.month == 12 ? ($scope.year + 1) + "/1" : $scope.year + "/" + ($scope.month + 1);
	$scope.previous = $scope.month == 1 ? ($scope.year - 1) + "/12" : $scope.year + "/" + ($scope.month - 1);
	$scope.title = ConvenientService.getMonthName($scope.month - 1) + " " + $scope.year;
	
	$scope.dayName = function (day) {
		return ConvenientService.getDayName(day).replace("dag", "");
	};
	$scope.dateFormat = ConvenientService.dateFormat;
	
	$scope.start = new Date($scope.year, $scope.month - 1, 1);
	while ($scope.start.getDay() != 1)
		$scope.start.setDate($scope.start.getDate() - 1);
	$scope.end = new Date($scope.year, $scope.month, 0);
	while ($scope.end.getDay() % 7 != 0)
		$scope.end.setDate($scope.end.getDate() + 1);
	
	var refresh;
	refresh = function () {
		if (EventService.isReady()) {
			var weeks = [];
			var current = new Date($scope.start);
			while (current < $scope.end) {
				var week = {
					number: ConvenientService.weekNumber(current),
					days: []
				};
				for (var i = 0; i < 7; i++) {
					week.days.push({
						date: new Date(current),
						today: current.toDateString() == new Date().toDateString(),
						events: EventService.getByDate(current.toDateString(), true, DataService.getMixEvents(), DataService.getMixEvents(), true)
					});
					current.setDate(current.getDate() + 1);
				}
				weeks.push(week);
			}
			$scope.weeks = weeks;
		}
		else {
			$scope.weeks = null;
			EventService.registerCallback(refresh);
		}
	};
    
    $scope.$on('$ionicView.enter', refresh);
})

//controller för feed.html
.controller('FeedViewCtrl', function ($scope, $state, $stateParams, $ionicScrollDelegate, DataService, ConvenientService, StorageService, SectionService, EventService, GitService, NoteService, DebuggerService) {
    //try {
	$scope.format = ConvenientService.verboseDateFormat;
    $scope.getTime = function (dateString) {
        var d = new Date(dateString);
        return d.getHours() + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
    };
	$scope.sectionEventDuration = function (event) {
		if (event.isCustomEvent)
			return SectionService._duration(event.start, event.end, event.isAllDayEvent);
		else
			return SectionService.duration(event);
	};

	//parsa start- och slutdatum från parametrarna i urlen
    $scope.start = new Date($stateParams.startTime);
    $scope.start.setHours(0);
    $scope.end = new Date($stateParams.endTime);
    $scope.end.setHours(0);
	
	$scope.incrementSoftEnd = function (weeks) {
		weeks = weeks || 1;
		$scope.softEnd = new Date($scope.softEnd.getTime() + 1000 * 3600 * 24 * 7 * weeks); //ladda några veckor framåt
		$scope.softEnd.setHours(0);
	};
	$scope.resetSoftEnd = function () {
		$scope.softEnd = new Date($scope.start.getTime());
		while ($scope.softEnd.getDay() != 0)
			$scope.softEnd = new Date($scope.softEnd.getTime() + 1000 * 3600 * 24);
		$scope.incrementSoftEnd(4);
		$scope.moreEventsAvailible = true;
	};
	$scope.resetSoftEnd();
	
	//ger en sträng med alla platser händelsen utspelar sig på
    $scope.location = function (eventLocations) {
        var str = "";
        for (var i = 0; i < eventLocations.length - 2; i++)
            str += eventLocations[i].name + ", ";
        if (eventLocations.length >= 2)
            str += eventLocations[eventLocations.length - 2].name + " och ";
        if (eventLocations.length >= 1)
            str += eventLocations[eventLocations.length - 1].name;
        return str;
    };

	//hämta färgdefinitioner för de olika typerna av KTH-händelser (övning, föreläsning etc.)
    var colorRef = DataService.getEventTypeColors();
    $scope.color = function (event) {
        if (!colorRef[event.type.toLowerCase()]) {
            colorRef[event.type.toLowerCase()] = ConvenientService.randomColor(0.7);
            StorageService.set("eventTypeColors", colorRef);
        }
        return colorRef[event.type.toLowerCase()];
    };
    $scope.days = null;
	
	$scope.filter = {};
	$scope.filter.filter = $stateParams.filter || "";
	$scope.showFilter = $scope.filter.filter.length > 0;
	if ($scope.showFilter)
		$scope.softEnd = $scope.end;
	$scope.toggleFilter = function () {
		$scope.showFilter = !$scope.showFilter;
		if ($scope.showFilter)
			$ionicScrollDelegate.scrollTop(true);
		else if ($scope.filter.filter != "") {
			$scope.filter.filter = "";
			$scope.refilter();
		}
	};
	$scope.refilter = function () {
		if ($scope.filter.filter == "")
			$scope.resetSoftEnd();
		else
			$scope.softEnd = $scope.end;
		$state.go($state.current, {}, { reload: true });
	};
	
	$scope.hasNote = function (event) {
		return NoteService.getNote(event.original || event) != null;
	};

	var hyphens = (GitService.getContent() || {}).hyphens || {};
	$scope.softHyphenate = function (str) {
	    return hyphens[str] || str;
	};
	
	//returnerar true/false beroende på om en händelse anses matcha det givna filtret
	var matchesFilter = function (event, filter) {
		var f = filter.toLowerCase();
		if (event) {
			//sök efter texten bland properties på händelsen
			for (var property in {title:0, url:0, info:0, start:0, end:0, type:0}) {
				if (event[property] && event[property].toLowerCase().indexOf(f) != -1)
					return true;
			}
			
			if (event.course)
				for (var property in {courseCode:0, name:0})
					if (event.course[property] && event.course[property].toLowerCase().indexOf(f) != -1)
						return true;
				
			if (event.original) {
				if (event.original.organizer && event.original.organizer.displayName.toLowerCase().indexOf(f) != -1)
					return true;
				if (event.original.creator && ((event.original.creator.displayName && event.original.creator.displayName.toLowerCase().indexOf(f) != -1)
						|| (event.original.creator.email && event.original.creator.email.toLowerCase().indexOf(f) != -1)))
					return true;
			}
			
			for (var i = 0; i < event.locations.length; i++)
				if (event.locations[i].name.toLowerCase().indexOf(f) != -1)
					return true;
		}
		return false;
	};
	
	//körs när feedet öppnas
	$scope.refresh = function () {
	    $scope.delimiterEnabled = DataService.getDelimiterEnabled();

	    if (EventService.isReady()) {
			//days är en array med dagar, dvs. objekt som har för- och eftermiddagshändelser samt ett datum
	        var days = [];
	        var mix = DataService.getMixEvents();
	        var date = new Date($scope.start);
	        var events, day;

	        while (date < $scope.end && date < $scope.softEnd) {
	            events = EventService.getByDate(date.toDateString(), true, mix, mix, true, true);

	            if (events.length > 0) {
	                day = { am: [], pm: [], date: new Date(date) };
	                for (var i = 0; i < events.length; i++)
	                    if (matchesFilter(events[i], $scope.filter.filter)) {
	                        if (new Date(events[i].start).getHours() < 12)
	                            day.am.push(events[i]);
	                        else
	                            day.pm.push(events[i]);
	                    }

                    if (day.am.length + day.pm.length > 0)
	                    days.push(day);
	            }

	            date.setDate(date.getDate() + 1);
	        }

	        $scope.days = days;
	    }
	};

	setTimeout(function () {
	    //rensa ut gamla notes en gång i månaden
	    if (StorageService.getOrDefault("lastNotePurge", new Date().getMonth()) != new Date().getMonth()) {
	        DebuggerService.log("Checking old notes");
			
			var notes = NoteService.getAllNotes();
            var events = EventService.all();
			
			var idSet = new Set();
			for (var i = 0; i < notes.length; i++)
				idSet.add(notes[i].id || notes[i].url);
			for (var i = 0; i < events.length; i++)
				idSet.delete((events[i].original && events[i].original.id) || events[i].id || events[i].url);
			
			if (idSet.size > 0) {
				DebuggerService.log("Deleting " + idSet.size + " note" + (idSet.size > 1 ? "s" : ""));
				
				idSet.forEach(function (x) {
					NoteService.clearNote({id: x});
				});
				
				idSet.forEach(function (x) {
					NoteService.clearNote({url: x});
				});
			}
			

	        StorageService.set("lastNotePurge", new Date().getMonth());
	    }
	}, 0);
	
	$scope.currentlyLoading = false;
	$scope.loadMore = function () {
		if (!$scope.currentlyLoading) {
			$scope.currentlyLoading = true;
			if ($scope.softEnd < $scope.end)
				$scope.incrementSoftEnd();
			else
				$scope.moreEventsAvailible = false;
			DebuggerService.log("Events until " + $scope.softEnd);
			$scope.refresh();
			$scope.$broadcast('scroll.infiniteScrollComplete');
			$scope.currentlyLoading = false;
		}
	};
    
	$scope.$on('$ionicView.enter', $scope.refresh);
	EventService.registerCallback($scope.refresh);
	//} catch (e) {alert(e);}
})

//controller för settings.html
.controller('SettingsCtrl', function ($scope, $state, $ionicPopup, $ionicModal, $rootScope, $ionicHistory, DataService, ConvenientService, StorageService, EventService, DebuggerService, GitService) {
	$scope.resetData = function() {
		$ionicPopup.confirm({
			title: 'Bekräfta',
			template: 'Dina färg- och kursinställningar kommer att återställas. Vill du verkligen rensa bort appens data?',
			cancelText: 'Nej',
			okText: 'Ja',
			okType: 'button-ctfys'
		}).then(function (yes) {
			if (yes) {
				StorageService.clear();
				
				
				var format = function (date) {
					var d = new Date(date);

					return d.getFullYear() + "-" + (d.getMonth() < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1).toString()) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate().toString());
				};
				var start = new Date().getMonth() >= 6 ? new Date(new Date().getFullYear(), 6) : new Date(new Date().getFullYear() - 1, 6);
				var end = new Date(start.getFullYear() + 1, start.getMonth());
				
				$state.go('app.feed', { startTime: format(new Date().toDateString()), endTime: format(end) });
				//starta om appen
				window.location.reload(true);
			}
		});
	};
	
	//checkboxarna ändrar värden i $scope.settings
	$scope.settings = {};
	$scope.settings.extendedDiscard = DataService.getExtendedDiscard();
	$scope.updateExtendedDiscard = function () {
		DataService.setExtendedDiscard($scope.settings.extendedDiscard);
	};
	$scope.modeLabels = ["Inga", "Lunch & Musik", "Alla"];
	$scope.settings.interestingMode = $scope.modeLabels[StorageService.getOrDefault("KthCalendarInterestingMode", 1)];
	$scope.updateInterestingMode = function () {
	    StorageService.set("KthCalendarInterestingMode", $scope.modeLabels.indexOf($scope.settings.interestingMode));
		EventService.refresh();
	};
	$scope.settings.delimiterEnabled = DataService.getDelimiterEnabled();
	$scope.updateDelimiterEnabled = function () {
		DataService.setDelimiterEnabled($scope.settings.delimiterEnabled);
	};
	$scope.settings.mixEvents = DataService.getMixEvents();
	$scope.updateMixEvents = function () {
		DataService.setMixEvents($scope.settings.mixEvents);
	};
	
	try {
		$scope.years = GitService.getContent().settings.years;
	} catch (e) {
		DebuggerService.log("Error when reading years");
		DebuggerService.log(e.stack || e, 1);
		DebuggerService.log(GitService.getContent());
		$scope.years = {"Fanclub": 2015};
		if (new Date().getMonth() >= 6)
			$scope.years["nØllan"] = new Date().getFullYear();
	}
	$scope.settings.startYear = 2015;
	if (DataService.getNotFanclub().enabled)
		$scope.settings.startYear = DataService.getNotFanclub().startYear;
	
	
	$scope.updateNotFanclub = function () {
		var name = "";
		for (var yearname in $scope.years)
			if ($scope.years[yearname] == $scope.settings.startYear) {
				name = yearname;
				break;
			}
		
		$ionicPopup.confirm({
			title: 'Bekräfta',
			template: 'Hämtar kurser för ' + name,
			cancelText: 'Avbryt',
			okText: 'OK',
			okType: 'button-ctfys'
		}).then(function (yes) {
			if (yes) {
				DataService.setNotFanclub({
					enabled: $scope.settings.startYear != 2015,
					startYear: $scope.settings.startYear
				});
				$scope.update();
			}
			else {
				$scope.settings.startYear = 2015;
				if (DataService.getNotFanclub().enabled)
					$scope.settings.startYear = DataService.getNotFanclub().startYear;
			}
		});
	};
	
	var makeColor = function (hue, saturation, value) {
		return ConvenientService.RGBtohex(ConvenientService.HSVtoRGB([hue, saturation, value]));
	};
	
	//gör två modals, en för att visa detaljer om en kurs,
	//en för att lägga till ny kurs
	$ionicModal.fromTemplateUrl('templates/modals/course.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.viewCourseModal = modal;
    });
	
	$ionicModal.fromTemplateUrl('templates/modals/addcourse.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.addCourseModal = modal;
    });
	
	$ionicModal.fromTemplateUrl('templates/modals/about.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.aboutModal = modal;
    });
	
	$scope.openAbout = function () {
	    $scope.updates = [
            { name: "Kurser och händelser", date: DataService.getLastUpdate() ? ConvenientService.dateFormat(DataService.getLastUpdate()) : "Aldrig" },
            { name: "Programhändelser", date: StorageService.getOrDefault("ProgramLastUpdate", null) ? ConvenientService.dateFormat(StorageService.getOrDefault("ProgramLastUpdate", null)) : "Aldrig" },
            { name: "Sektionshändelser", date: StorageService.getOrDefault("sectionLastUpdated", null) ? ConvenientService.dateFormat(StorageService.getOrDefault("sectionLastUpdated", null)) : "Aldrig" },
            { name: "Matsedlar", date: StorageService.getOrDefault("foodLastUpdate", null) ? ConvenientService.dateFormat(StorageService.getOrDefault("foodLastUpdate", null)) : "Aldrig" },
            { name: "GitHub-data", date: StorageService.getOrDefault("gitLastUpdate", null) ? ConvenientService.dateFormat(StorageService.getOrDefault("gitLastUpdate", null)) : "Aldrig" },
            { name: "Nyhetsflöden", date: StorageService.getOrDefault("rssLastUpdate", null) ? ConvenientService.dateFormat(StorageService.getOrDefault("rssLastUpdate", null)) : "Aldrig" }
	    ];
		$scope.aboutModal.show();
	};
	$scope.closeAbout = function () {
		$scope.aboutModal.hide();
	};
	$scope.debuggerEnabled = false;
	$scope.log = [];
	$scope.enableDebugger = function () {
		$ionicPopup.prompt({
			title: "Aktivera debugger",
			okType: "button-ctfys",
			inputPlaceholder: "Kod",
			cancelText: "Avbryt",
			cancelType: "button-stable"
		}).then(function (value) {
			$scope.debuggerEnabled = value && value.toLowerCase() == "gauss";
			if ($scope.debuggerEnabled) {
				DebuggerService.registerCallback($scope.updateDebugger);
				DebuggerService.log("Enabled debugger", 3);
			}
		});
	};
	$scope.updateDebugger = function () {
		$scope.log = DebuggerService.getLog();
	};
	$scope.getFromStorage = function () {
		$ionicPopup.prompt({
			title: "Prompt",
			okType: "button-ctfys",
			inputPlaceholder: "Kommando",
			cancelText: "Avbryt",
			cancelType: "button-stable"
		}).then(function (value) {
			if (value) {
				DebuggerService.log('Getting "' + value + '"', 3);
				DebuggerService.log(StorageService.getOrDefault(value, "Not in storage"));
			}
		});
	};
	$scope.clearLog = DebuggerService.clear;
	
	//sätter en massa värden och visar course.html
	$scope.openCourse = function (course) {
		$scope.modalCourse = course;
		$scope.contrastingColor = ConvenientService.contrastingColor(course.color);
		var count = 0;
		var now = new Date();
		for (var i = 0; i < course.entries.length; i++)
		    if (new Date(course.entries[i].start) > now)
		        count++;
		$scope.eventCount = count; //course.entries.length;
		
		$scope.settings = $scope.settings || {};
		$scope.settings.hidden = ($scope.hiddenIndex(course) != -1);
		$scope.initialHidden = $scope.settings.hidden;
		
		$scope.col = {};
		var hsv = ConvenientService.RGBtoHSV(ConvenientService.hextoRGB(course.color));
		$scope.col.hue = hsv[0];
		$scope.col.sat = hsv[1];
		$scope.col.val = hsv[2];
		
		$scope.fullSat = makeColor($scope.col.hue, 100, $scope.col.val);
		$scope.fullVal = makeColor($scope.col.hue, $scope.col.sat, 100);
		//$scope.red = makeColor(0, $scope.col.sat, $scope.col.val);
		$scope.minSat = makeColor($scope.col.hue, 0, $scope.col.val);
		
		//live-uppdaterar färgerna när man drar i sliders
		$scope.recalculateColor = function () {
			$scope.modalCourse.color = makeColor($scope.col.hue, $scope.col.sat, $scope.col.val);
			$scope.contrastingColor = ConvenientService.contrastingColor($scope.modalCourse.color);
			
			$scope.fullSat = makeColor($scope.col.hue, 100, $scope.col.val);
			$scope.fullVal = makeColor($scope.col.hue, $scope.col.sat, 100);
			//$scope.red = makeColor(0, $scope.col.sat, $scope.col.val);
			$scope.minSat = makeColor($scope.col.hue, 0, $scope.col.val);
		};
		
		$scope.viewCourseModal.show();
	};
	
	//sparar inställningar och stänger course.html
	$scope.closeCourse = function () {
		DataService.saveCourses();
		DataService.getCourseColors()[$scope.modalCourse.courseCode] = $scope.modalCourse.color;
		DataService.saveCourseColors();
		DataService.updateEventColors();
		if ($scope.initialHidden ^ $scope.settings.hidden) {
			var index = $scope.hiddenIndex($scope.modalCourse);
			if (index == -1)
				$scope.hidden.push({
					courseCode: $scope.modalCourse.courseCode,
					startTerm: $scope.modalCourse.startTerm,
					roundId: $scope.modalCourse.roundId
				});
			else
				$scope.hidden.splice(index, 1);
			DataService.setHidden($scope.hidden);
			DataService.resort();
		}
		$scope.viewCourseModal.hide();
	};

	$scope.gotoCourse = function (courseCode) {
	    $scope.closeCourse();

	    //vi tar ett span från läsårets början (räknar juli som start) och ett år framåt
	    var format = function (date) {
	        var d = new Date(date);

	        return d.getFullYear() + "-" + (d.getMonth() < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1).toString()) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate().toString());
	    };

	    var start = new Date().getMonth() >= 6 ? new Date(new Date().getFullYear(), 6) : new Date(new Date().getFullYear() - 1, 6);
	    var end = new Date(start.getFullYear() + 1, start.getMonth());

	    $ionicHistory.nextViewOptions({
            historyRoot: true
	    });

	    $state.go('app.feed', {startTime: format(new Date().toDateString()), endTime: format(end), filter: courseCode}, { reload: true, location: "replace" });
	};
	
	$scope.removeCourse = function () {
		$ionicPopup.confirm({
			title: 'Bekräfta',
			template: 'Vill du verkligen ta bort den här kursen?',
			cancelText: 'Nej',
			okText: 'Ja',
			okType: 'button-ctfys'
		}).then(function (yes) {
			if (yes) {
				var index = $scope.hiddenIndex($scope.modalCourse);
				if (index != -1)
					$scope.hidden.splice(index, 1);
				DataService.setHidden($scope.hidden);
				DataService.removeExtra($scope.modalCourse);
				$scope.viewCourseModal.hide();
				$state.go($state.current, {}, { reload: true });
			}
		});
	};
	
	$scope.openAddCourse = function () {
		$scope.newCourse = {};
		$scope.newCourse.courseCode = "";
		$scope.newCourse.roundId = "";
		$scope.newCourse.startTerm = "";
		
		$scope.addCourseModal.show();
	};
	
	$scope.closeAddCourse = function () {
		$scope.addCourseModal.hide();
	};
	
	//lägger till en ny kurs, körs från addcourse.html
	$scope.addCourse = function () {
		var cc = $scope.newCourse.courseCode.toUpperCase().trim();
		var rid = $scope.newCourse.roundId;
		var st = $scope.newCourse.startTerm.replace(":", "");
		
		//kollar att följande stämmer: kurskoden är 6 tecken formaterad som AB1234 eller AB123X, kursomgången är endast ett tal, startåret är ett femsiffrigt tal som slutar med 1 eller 2 för vår resp. hösttermin
		if (cc.length == 6 && /[A-Z][A-Z]\d\d\d(\d|X|N|V)/i.test(cc) && !/\D+/.test(rid) && /\d+/.test(rid) && st.length == 5 && !/\D+/.test(st) && /\d{5}/.test(st) && /[12]$/.test(st)) {
			//kolla om kursen redan är med
			var has = false;
			var res = {
				courseCode: cc,
				roundId: rid,
				startTerm: st,
				isExtra: true
			};
			for (var i = 0; i < $scope.allCourses.length; i++)
				if ($scope.coursesEqual(res, $scope.allCourses[i])) {
					has = true;
					break;
				}
				
			if (has) {
				$ionicPopup.alert({
					title: "Kan inte lägga till kursen",
					template: "Kursen är redan tillagd.",
					okType: "button-ctfys"
				});
			} else {
				//lägger till kursen och ser till att kursinfo + händelser hämtas
				DataService.addExtra(res, function (c) {
					$ionicPopup.alert({
						title: "Kursen lades till",
						template: "Kursen " + c.name + " lades till. Tryck OK för att hämta händelser.",
						okType: "button-ctfys"
					}).then(function () {
						//tvinga uppdatering
						StorageService.set("lastUpdate", null);
						window.location.reload(true);
					});
					$state.go($state.current, {}, { reload: true });
				},
				function (response) {
				    if (response.status == 404)
				        $ionicPopup.alert({
				            title: "Kan inte lägga till kursen",
				            template: "Kursen hittades inte",
				            okType: "button-ctfys"
				        });
                    else
					    $ionicPopup.alert({
						    title: "Kan inte lägga till kursen",
						    template: response.status ? "Kopps svarade med kod " + response.status + (response.statusText ? ": " + response.statusText : ".") : "Kunde inte nå Kopps.",
						    okType: "button-ctfys"
					    });
				});
				$scope.closeAddCourse();
			}
		}
		else {
			//ge en fel-popup med vad det var som var ogiltigt
			var temp = '<div class="list">';
			if (cc.length != 6 || !/[A-Z][A-Z]\d\d\d(\d|X|N|V)/i.test(cc))
				temp += '<div class="item item-text-wrap" style="border: 0; background-color: transparent">Kurskoden måste vara två bokstäver följt av fyra siffror, eller tre siffror och ett X, N eller V.</div>';
			if (/\D+/.test(rid) || !/\d+/.test(rid))
				temp += '<div class="item item-text-wrap" style="border: 0; background-color: transparent">Kursomgången måste vara ett tal.</div>';
			if (st.length != 5 || /\D+/.test(st) || !/\d{5}/.test(st) || !/[12]$/.test(st))
				temp += '<div class="item item-text-wrap" style="border: 0; background-color: transparent">Startterminen måste vara ett årtal följt av 1 eller 2.</div>';
			
			temp += "</div>";
			$ionicPopup.alert({
				title: "Kan inte lägga till kursen",
				template: temp,
				okType: "button-ctfys"
			});
		}
		
	};
	
	$scope.coursesEqual = function (course1, course2) {
		return course1.courseCode.toLowerCase() == course2.courseCode.toLowerCase() && course1.roundId == course2.roundId && course1.startTerm.replace(":", "") == course2.startTerm.replace(":", "");
	};
	
	//ger vilket index kursen har i arrayen med gömda kurser, eller -1
	$scope.hiddenIndex = function (course) {
		for (var i = 0; i < $scope.hidden.length; i++)
			if ($scope.coursesEqual(course, $scope.hidden[i]))
				return i;
		return -1;
	};

	//sätter alla lastUpdate-värden till null (så att all data antas vara utgången) och startar om appen
	$scope.update = function () {
	    StorageService.set("lastUpdate", null);
	    StorageService.set("sectionLastUpdated", null);
	    StorageService.set("foodLastUpdate", null);
	    StorageService.set("rssLastUpdate", null);
	    StorageService.set("gitLastUpdate", null); 
	    StorageService.set("KthCalendarLastUpdate", null);
	    StorageService.set("ProgramLastUpdate", null);
	    window.location.reload(true);
	};
	
	//körs när man öppnar inställningarna
    var refresh = function () {
		$scope.courses = DataService.getCourses();
		$scope.hidden = DataService.getHidden();
		$scope.extra = DataService.getExtra();
		
		$scope.allCourses = [];
		if ($scope.courses)
			for (var i = 0; i < $scope.courses.length; i++)
				$scope.allCourses.push($scope.courses[i]);
		if ($scope.extra)
			for (var i = 0; i < $scope.extra.length; i++)
				$scope.allCourses.push($scope.extra[i]);
		
		var lu = DataService.getLastUpdate();
		$scope.lastUpdated = lu ? ConvenientService.dateFormat(lu) : "Aldrig";
	};
	
    $scope.$on('$ionicView.enter', refresh);
    $scope.$on('$destroy', function () {
        $scope.viewCourseModal.remove();
        $scope.addCourseModal.remove();
		$scope.aboutModal.remove();
    });
})

//controller för food.html
.controller('FoodCtrl', function ($scope, FoodEndpoint, URLs, FoodService, ConvenientService, StorageService) {
	//definierar vilka restauranger vars menyer hämtas
	$scope.restaurants = [{
		name: "Restaurang Q",
		shortName: "q",
		url: FoodEndpoint.q + URLs.weekMenuQ()
	},
	{
		name: "Restaurang Nymble",
		shortName: "nymble",
		url: "http://ths.kth.se/om-ths/restaurang-cafe/restaurang-nymble-meny/"
	},
	{
		name: "Brazilia",
		shortName: "brazilia",
		url: FoodEndpoint.brazilia + URLs.weekMenuBrazilia()
	},
	{
	    name: "Syster O Bror",
	    shortName: "syster",
	    url: FoodEndpoint.syster + URLs.weekMenuSyster()
	}];
	
	//läser in menyerna om det går, flaggar dem som otillgängliga om det är helg
	var refresh = function () {
		$scope.menus = FoodService.getMenus();
		$scope.unavailible = (typeof $scope.menus == "string");
	};
	
	$scope.$on('$ionicView.enter', refresh);
	FoodService.registerCallback(refresh);
	
	//hämtar menyerna i servicen
    FoodService.update();
})

//controller för section.html
.controller('SectionCtrl', function ($scope, $ionicPopover, $ionicModal, $ionicScrollDelegate, DataService, SectionService, ConvenientService, RssService, KthCalendarService, NoteService, GitService) {
	$scope.date = function (day) {
		if (day[0].isOfficialEvent)
			return ConvenientService.verboseDateFormat(day[0].start);
		else
			return ConvenientService.verboseDateFormat(day[0].start.date ? day[0].start.date : day[0].start.dateTime);
	};
    var getTime = function (dateString) {
        var d = new Date(dateString);
        return d.getHours() + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
    };
	$scope.dateFormat = ConvenientService.dateFormat;
	$scope.sectionEventDuration = function (e) {
		if (e.isOfficialEvent) {
			if (e.end)
				return getTime(e.start) + "-" + getTime(e.end);
			else
				return getTime(e.start);
		} else
			return SectionService.duration(e);
	};
	
	var noteButtonContent = ((GitService.getContent() || {}).notebutton || {})[DataService.getNotFanclub().enabled ? DataService.getNotFanclub().startYear : "2015"] || {
	    "title": "Sha-la-lie på...",
	    "links": [{
	        "url": "spotify:track:5TnZihe1AVVHPtgX1osH6Y",
	        "name": "Spotify"
	    }, {
	        "url": "https://youtu.be/PtBG_df3QbQ",
	        "name": "YouTube"
	    }, {
	        "url": "https://youtu.be/wzRHqOSg--s",
	        "name": "Nederländska"
	    }]
	};

	var template = '<ion-popover-view><ion-header-bar class="bar-ctfys"> <h1 class="title">' + noteButtonContent.title + '</h1></ion-header-bar> <ion-content><div class="list" style="border-bottom: 1px solid #ccc; border-top: 1px solid #ccc; padding-top: 0;">';
	for (var i = 0; i < noteButtonContent.links.length; i++)
	    template += '<div class="item" style="text-align: center;" on-tap="openInBrowser(\'' + noteButtonContent.links[i].url + '\') || shalaliePopover.hide()">' + noteButtonContent.links[i].name + '</div>'
    template += '</div></ion-content></ion-popover-view>';

	//gör en popover-meny av koden ovan
	//popovers öppnas på en viss plats på skärmen, i stället för att ta upp hela likt modals
	$scope.shalaliePopover = $ionicPopover.fromTemplate(template, {
	    scope: $scope
	});

	$scope.shalalie = function ($event) {
	    $scope.shalaliePopover.show($event);
	};

	$scope.hasNote = function (event) {
	    return NoteService.getNote(event.original || event) != null;
	};

	//gör en modal av rssflödesvisaren
	$ionicModal.fromTemplateUrl('templates/modals/rss.html', {
	    scope: $scope
	}).then(function (modal) {
	    $scope.rssmodal = modal;
	});

    //Tar bort "Läs mer"-länken i slutet av nyheten
	$scope.replace = function (desc) {
	    return desc.replace(/<a([^>]+)>Läs mer<\/a>/ig, ' ...');
	};
	
	var lastfeed = -1;
	//öppnar rssmodalen. feed: 0 = fysiksektionen, 1 = ths, 2 = kth
	$scope.openNews = function (feed) {
		$scope.currentRss = [$scope.sectionRss, $scope.unionRss, $scope.kthRss][feed];
	    $scope.rssmodal.show();
		if (feed != lastfeed)
			$ionicScrollDelegate.$getByHandle("rss").scrollTop(false);
		lastfeed = feed;
	};

	$scope.closeRss = function () {
	    $scope.rssmodal.hide();
	};
	
	var merge = function (events, kthEvents) {
		var eindex = 0, kindex = 0;
		var res = [];
		
		while (eindex < events.length && kindex < kthEvents.length) {
			if (new Date(kthEvents[kindex].start) < new Date(events[eindex].start.date || events[eindex].start.dateTime))
				res.push(kthEvents[kindex++]);
			else
				res.push(events[eindex++]);
		}
		while (eindex < events.length)
			res.push(events[eindex++]);
		while (kindex < kthEvents.length)
			res.push(kthEvents[kindex++]);
		
		return res;
	};

	
	//körs varje gång sidan öppnas
	var refresh = function () {
		var events = SectionService.getEvents();
		var kthEvents = KthCalendarService.getEvents();
		
		if (!kthEvents)
			KthCalendarService.registerCallback(refresh);
		
		if (events && kthEvents) {
			//hämta sektionshändelser och sortera dessa per dag
			//dagarna är här bara arrays av händelser
		    var days = [];
		    var day = [];
		    var today = new Date(ConvenientService.today);
			
			events = merge(events, kthEvents);
			
		    for (var i = 0; i < events.length; i++) {
		        var push = false;
                //gave fel (start odefinierat)
		        if (!events[i].isOfficialEvent && events[i].start.date && new Date(events[i].start.date).getTime() >= today.getTime()) {
		            events[i].start.dateTime = events[i].start.date;
		            push = true;
		        }
		        else if (!events[i].isOfficialEvent && events[i].start.dateTime && new Date(events[i].start.dateTime).getTime() >= today.getTime())
		            push = true;
				else if (events[i].isOfficialEvent && new Date(events[i].start) >= today.getTime())
					push = true;

		        if (push) {
		            if (day.length == 0 || new Date(day[0].isOfficialEvent ? day[0].start : (day[0].start.dateTime || day[0].start.date)).toDateString() == new Date(events[i].isOfficialEvent ? events[i].start : (events[i].start.dateTime || events[i].start.date)).toDateString())
		                day.push(events[i]);
		            else {
		                days.push(day);
		                day = [events[i]];
		            }
		        }
		    }
		    if (day.length != 0)
		        days.push(day);
		    $scope.days = days;
		}

		//hämta rsshändelser
		var rssf = RssService.getSection();
		var rssths = RssService.getUnion();
		var rsskth = RssService.getKTH();

		if (rssf)
		    $scope.sectionRss = rssf;
		if (rssths)
		    $scope.unionRss = rssths;
		if (rsskth)
		    $scope.kthRss = rsskth;
	};
	
	$scope.$on('$ionicView.enter', refresh);
	$scope.$on('$destroy', function () {
	    $scope.rssmodal.remove();
		$scope.shalaliePopover.remove();
	});
})

.controller('ToolsCtrl', function ($scope, $ionicModal, $ionicScrollDelegate, $ionicPlatform, DebuggerService, URLs, xkcdService, StorageService, ConvenientService, GitService, Lyrics) {
 	$scope.openURL = ConvenientService.openURL;
	
	
	$ionicModal.fromTemplateUrl('templates/modals/food.html', {
         scope: $scope
     }).then(function (modal) {
         $scope.foodModal = modal;
     });
 	
 	$scope.openFood = function () {
 		$scope.foodModal.show();
 	};
 	$scope.closeFood = function () {
 		$scope.foodModal.hide();
 	};

 	$scope.lyrics = null;
 	$scope.lyricsIndexes = null;
 	$scope.lyricsMode = null;
 	$scope.parseLyrics = function (text) {
 	    return text.replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/\n/igm, '<br />');
 	};
 	$scope.lyricsScrollAmount = 0;
 	$scope.scrollLyrics = function (save) {
 	    if (save)
 	        $scope.lyricsScrollAmount = $ionicScrollDelegate.$getByHandle("lyrics").getScrollPosition().top;
 	    $ionicScrollDelegate.$getByHandle("lyrics").scrollTop(false);
 	};
 	$scope.resetLyricsScroll = function () {
 	    $ionicScrollDelegate.$getByHandle("lyrics").scrollTo(0, $scope.lyricsScrollAmount, false);
 	};
    $ionicModal.fromTemplateUrl('templates/modals/lyrics.html', {
        scope: $scope,
        hardwareBackButtonClose: false
     }).then(function (modal) {
         $scope.lyricsModal = modal;
     });

    $scope.searchLyrics = function () {
        if ($scope.lyricsMode.filter.trim().length == 0)
            $scope.lyricsMode.searchResults = false;
        else {
            var titleHits = [];
            var otherHits = [];
            var strs = $scope.lyricsMode.filter.toLowerCase().trim().split(" ");

            for (var i = 0; i < $scope.lyrics.length; i++)
                for (var j = 0; j < $scope.lyrics[i].songs.length; j++) {
                    var inTitle = false;
                    var inOther = false;
                    for (var k = 0; k < strs.length; k++) {
                        if ($scope.lyrics[i].songs[j].title.toLowerCase().indexOf(strs[k]) != -1)
                            inTitle = true;
                        else if ($scope.lyrics[i].songs[j].text.toLowerCase().indexOf(strs[k]) != -1
                            || ($scope.lyrics[i].songs[j].author || "").toLowerCase().indexOf(strs[k]) != -1
                            || ($scope.lyrics[i].songs[j].melody || "").toLowerCase().indexOf(strs[k]) != -1)
                            inOther = true;
                    }
                    if (inTitle)
                        titleHits.push({ chapter: i + 1, song: j + 1 });
                    else if (inOther)
                        otherHits.push({ chapter: i + 1, song: j + 1 });
                }
            ;
            $scope.lyricsMode.searchResults = titleHits.concat(otherHits);
        }
    };
 	$scope.openLyrics = function () {
 	    $scope.lyrics = Lyrics.chapters;
 	    $scope.lyricsIndexes = Lyrics.indexes;
 	    $scope.lyricsMode = { chapter: false, song: false, filter: "", searchResults: false };
 	    try {
 	        $ionicPlatform.onHardwareBackButton($scope.applyBackLyrics);
 	    } catch (e) {
 	        DebuggerService.log(e, 1);
 	    }
 	    $scope.lyricsModal.show();
 	};
 	$scope.closeLyrics = function () {
 	    try {
 	        $ionicPlatform.offHardwareBackButton($scope.applyBackLyrics);
 	    } catch (e) {
 	        DebuggerService.log(e.stack || e, 1);
 	    }
 		$scope.lyricsModal.hide();
 	};
 	$scope.lyricsSetChapter = function (c) {
 	    $scope.lyricsMode.chapter = c;
 	    return false;
 	};
 	$scope.lyricsSetSong = function (s) {
        $scope.lyricsMode.song = s;
 	    return false;
 	};
 	$scope.backLyrics = function () {
 	    if ($scope.lyricsMode.searchResults) {
 	        if (!$scope.lyricsMode.song && !$scope.lyricsMode.chapter) {
 	            $scope.lyricsMode.filter = "";
 	            $scope.lyricsMode.searchResults = false;
 	        } else
 	            $scope.lyricsMode.song = ($scope.lyricsMode.chapter = false);
 	    }
 	    else if (!$scope.lyricsMode.chapter) {
 	        $scope.closeLyrics();
 	        return;
 	    }

 	    if ($scope.lyricsMode.song)
 	        $scope.lyricsMode.song = false;
 	    else
 	        $scope.lyricsMode.chapter = false;

 	    if ($scope.lyricsMode.chapter)
 	        $scope.resetLyricsScroll();
 	    else
 	        $scope.scrollLyrics();

 	    //($scope.lyricsMode[$scope.lyricsMode.song ? 'song' : 'chapter'] = false) || ($scope.lyricsMode.chapter ? $scope.resetLyricsScroll() : $scope.scrollLyrics());
 	};
 	$scope.applyBackLyrics = function () {
 	    $scope.$apply($scope.backLyrics);
 	};
	
	

	$scope.openToolModal = function (modal) {
	    $scope.currentModal = modal.modal;
	    $scope.vars = modal.vars;
	    $scope.currentModal.show();
	};
	$scope.closeToolModal = function () {
	    $scope.currentModal.hide();
	};
	
	
	var refresh = function () {
	    var git = GitService.getContent();

	    if (git && git.tools && git.tools.modals) {
	        var extraModals = {
	            school: [],
                other: []
	        };
            for (var prop in extraModals)
	            for (var i = 0; i < git.tools.modals[prop].length; i++) {
	                var o = git.tools.modals[prop][i];
	                o.modal = $ionicModal.fromTemplate(git.tools.modals[prop][i].template, {
	                    scope: $scope
	                });
	                extraModals[prop].push(o);
	            }
	        $scope.extraModals = extraModals;
	    }
        
	};
	var setVars = function (){
		$scope.xkcdTitle = xkcdService.getTitle();
		$scope.xkcdImg = xkcdService.getImg();
		$scope.xkcdAlt = xkcdService.getAlt();
		$scope.xkcdUrl = xkcdService.getUrl();
		$scope.xkcdNum = xkcdService.getNumber();
		DebuggerService.log("xkcd link is: " + $scope.xkcdUrl, 4);
	}
	
	
	$ionicModal.fromTemplateUrl('templates/modals/map.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.mapModal = modal;
    });
	
	$scope.openMap = function () {
		$ionicScrollDelegate.zoomTo(1);
        $scope.mapModal.show();
    };
	
	$scope.closeMap = function () {
		$scope.mapModal.hide();
	};
	
	$scope.releaseGauss = function (){
		DebuggerService.log("Gauss är triggad", 4);
		if($ionicScrollDelegate.$getByHandle('kartan').getScrollPosition().zoom>99){
			$scope.gaussModal.show();
		}
	};
	$scope.closeGauss = function () {
		$scope.gaussModal.hide();
	};
	

	$ionicModal.fromTemplateUrl('templates/modals/gauss.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.gaussModal = modal;
    });
		
	$ionicModal.fromTemplateUrl('templates/modals/xkcd.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.xkcdModal = modal;
    });

    $scope.openXkcd = function () {
		refresh();
        $scope.xkcdModal.show();
    };
	
	$scope.closeXkcd = function () {
		$scope.xkcdModal.hide();
	};
	
	$scope.updateXkcd = function(nr){
	    xkcdService.update(setVars, nr);
		$ionicScrollDelegate.scrollTop(false);
	};

	
    //0 is latest comic, -1 is random
	xkcdService.update(setVars, 0);

	$scope.$on('$ionicView.enter', refresh);
	$scope.$on('$destroy', function () {
	    $scope.foodModal.remove();
	    $scope.mapModal.remove();
	    $scope.gaussModal.remove();
	    $scope.xkcdModal.remove();
	    $scope.lyricsModal.remove();
	    if ($scope.extraModals) {
	        for (var i = 0; i < $scope.extraModals.school.length; i++)
	            $scope.extraModals.school[i].modal.remove();
            for (var i = 0; i < $scope.extraModals.other.length; i++)
                $scope.extraModals.other[i].modal.remove();
	    }

	    try {
	        $ionicPlatform.offHardwareBackButton($scope.backLyrics);
	    } catch (e) {
	        DebuggerService.log(e.stack || e, 1);
	    }
	});
	GitService.registerCallback(refresh);

})


;
