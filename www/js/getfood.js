angular.module('starter.getfood', ['starter.services'])

//har hand om inläsningen av menyer från restauranghemsidorna
.factory('FoodService', function ($http, $state, FoodEndpoint, URLs, StorageService, DebuggerService) {
	var menus = {};
	var day = new Date().getDay() - 1;
	var restaurantsLeft = -1;
	var restaurantCount = 4;
	var foodLastUpdate = StorageService.getOrDefault("foodLastUpdate", "");
	var callbacks = [];
	
	//körs när alla anrop är klara
	var onDone = function () {
		if (restaurantsLeft == 0) {
			restaurantsLeft = -1;
			foodLastUpdate = new Date().toDateString();
			StorageService.set("foodLastUpdate", foodLastUpdate);
			StorageService.set("foodMenus", menus);

			for (var i = 0; i < callbacks.length; i++)
			    callbacks[i]();
		}
	};
	
	var parseXml = function (xmlStr) {
		return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
	};
	
	var updateMenus = function () {
		DebuggerService.log("Updating menus");
		try {
			//Restaurang Q
			$http.get(FoodEndpoint.q + URLs.weekMenuQ()
				).then(
				function successCallback(response) {
					var partial = response.data.substring(response.data.indexOf("<table id=\"mattabellen\""));
					partial = partial.substring(0, partial.indexOf("</table>") + "</table>".length);
					var menu = [];
					try {
						var xml = parseXml(partial);
						var row = xml.documentElement.children[0].children[day + 1];
						for (var i = 1; i <= 3; i++)
							menu.push(row.children[i].innerHTML.trim());
					}
					catch (e) {
						DebuggerService.log("Error parsing Q's menu: " + e, "red");
					}
					menus.q = menu;
					restaurantsLeft--;
					onDone();
				},
				function errorCallback(response) {
					DebuggerService.log("Error getting Q's menu: " + JSON.stringify(response), "red");
					restaurantsLeft--;
					onDone();
				});
				
				//Restaurang Nymble
				$http.get(FoodEndpoint.nymble + URLs.weekMenuNymble()
				).then(
				function successCallback(response) {
				    var menu = [];
					
					var getDishes = function (str) {
						//efter första bolden kommer priserna, de är inte sallad
						var d = str.indexOf("<b>") != -1 ? str.substring(0, str.indexOf("<b>")) : str;
						d = d.replace(/<([^>]+)>/ig, "|").split("|");
						
						var res = [];
						for (var i = 0; i < d.length; i++)
							if (d[i].trim().length)
								res.push(d[i]);
						
						return res;
					};

				    try {
					    var partial = response.data.substring(response.data.indexOf("<div class=\"post realpost page\""));
					    partial = partial.substring(0, partial.indexOf("<!-- You can start editing here. -->"));
						
						var dayNames = ["måndag", "tisdag", "onsdag", "torsdag", "fredag"];
						
						//matcha alla rubriker med dagar/veckans fisk/etc.
					    var matches = partial.match(/<strong>([^<]+)<\/strong>/ig);
						var dishes = [];
						for (var i = 0; i < matches.length; i++) {
							if (/lunch vecka/ig.test(matches[i]))
								continue;
							
							var str = partial.substring(partial.indexOf(matches[i]) + matches[i].length);
							str = str.substring(0, str.indexOf(matches[i + 1]));
							
							dishes.push({
								title: matches[i].replace(/<(strong|\/strong)>/ig, ""),
								dish: str
							});
						}
						
						for (var i = 0; i < dishes.length; i++) {
							if (/(monday|lunch|priser)/ig.test(dishes[i].title))
								break;
							
							var todays = getDishes(dishes[i].dish);
							//dagens
							if (dishes[i].title.toLowerCase().indexOf(dayNames[day]) != -1)
								for (var j = 0; j < todays.length; j++)
									menu.push(todays[j]);
							//veckans
							else if (dayNames.indexOf(dishes[i].title.toLowerCase()) == -1)
								for (var j = 0; j < todays.length; j++)
									menu.push(dishes[i].title + "<br />" + todays[j]);
						}
					}
					catch (e) {
						DebuggerService.log("Error parsing Nymble's menu: " + e, "red");
					}
					menus.nymble = menu;
					restaurantsLeft--;
					onDone();
				},
				function errorCallback(response) {
					DebuggerService.log("Error getting Nymble's menu: " + JSON.stringify(response), "red");
					restaurantsLeft--;
					onDone();
				});
				
		    //Brazilia
			$http.get(FoodEndpoint.brazilia + URLs.weekMenuBrazilia()
				).then(
				function successCallback(response) {
					var partial = response.data.substring(response.data.indexOf("<table class=\"table lunch_menu\">"));
					partial = partial.substring(0, partial.indexOf("</table>") + "</table>".length);
					partial = partial.replace(/& /ig, "&amp; ");
					partial = partial.replace(/<br>/ig, "").replace(/<br \/>/ig, "").replace(/<img([^>]+)>/ig, "");
					
					var menu = [];
					try {
						var xml = parseXml(partial);
						//var row = xml.getElementsByTagName("tbody")[day];
						var row = xml.getElementsByTagName("tbody")[0];
						
						for (var i = 0; i < row.children.length; i++) {
							var str = row.children[i].children[0].childNodes[0].nodeValue;
							str = str.trim();
							if (str[str.length - 1] == "." && (str.match(/\./g) || []).length == 1)
								str = str.substring(0, str.length - 1);
							menu.push(str);
						}
					}
					catch (e) {
						DebuggerService.log("Error parsing Brazilia's menu: " + e, "red");
					}
					menus.brazilia = menu;
					restaurantsLeft--;
					onDone();
				},
				function errorCallback(response) {
					DebuggerService.log("Error getting Brazilia's menu: " + JSON.stringify(response), "red");
					restaurantsLeft--;
					onDone();
				});
                
                //Syster O Bror
				$http.get(FoodEndpoint.syster + URLs.weekMenuSyster()
                    ).then(
                    function successCallback(response) {
                        var partial = response.data.substring(response.data.indexOf("<div id=\"dagens-lunch-carousel\""));
                        partial = partial.substring(0, partial.indexOf("<div class=\"control-for-carousel\">"));
                        partial = partial.replace(/& /ig, "&amp; ");
                        var menu = [];
                        try {
                            var xml = parseXml(partial);
                            menu.push((xml.documentElement.children[0].tagName == "parsererror" ? xml.documentElement.children[1] : xml.documentElement.children[0]).children[0].children[1].children[day].children[0].children[1].innerHTML.trim());
                        }
                        catch (e) {
							DebuggerService.log("Error parsing Syster O Bror's menu: " + e, "red");
                        }
                        menus.syster = menu;
                        restaurantsLeft--;
                        onDone();
                    },
                    function errorCallback(response) {
						DebuggerService.log("Error getting Syster O Bror's menu: " + JSON.stringify(response), "red");
                        restaurantsLeft--;
                        onDone();
                    });
		} catch (e) {
			DebuggerService.log(e, "red");
			DebuggerService.log("Error occurred when updating menus");
		}
	};
	
    return {
        getMenus: function() {
			if (day >= 0 && day <= 4)
				return restaurantsLeft == -1 ? menus : null;
			else
				return "unavailible";
		},
		update: function() {
			if (foodLastUpdate == new Date().toDateString()){
				DebuggerService.log("Getting menus from cache", "green");
				menus = StorageService.getOrDefault("foodMenus");
			    for (var i = 0; i < callbacks.length; i++)
				    callbacks[i]();
			} else {
				restaurantsLeft = restaurantCount;
				if (day >= 0 && day <= 4)
				    updateMenus();
				else
				    for (var i = 0; i < callbacks.length; i++)
				        callbacks[i]();
			}
		},
		registerCallback: function (cb) {
			callbacks.push(cb);
		}
    };
})

;
