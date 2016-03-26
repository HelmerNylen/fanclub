angular.module('starter.getfood', ['starter.services'])

//har hand om inläsningen av menyer från restauranghemsidorna
.factory('FoodService', function ($http, $state, FoodEndpoint, URLs, StorageService) {
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
		console.log("Updating menus");
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
						console.log("Försökte parsea Q:s meny men det sket sig: " + e);
					}
					menus.q = menu;
					restaurantsLeft--;
					onDone();
				},
				function errorCallback(response) {
					console.log("Error when getting Q's menu " + response.status + ": " + response.statusText + ", " + response.data);
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
						
						
					    /*var keywords = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Veckans fisk", "Veckans vegetariska", "Veckans sallad", "monday"];

					    for (var i = 0; i < keywords.length - 1; i++) {
					        var str = partial.substring(partial.search(new RegExp(keywords[i], "im")));
					        str = str.substring(0, str.search(new RegExp(keywords[i + 1], "im")));
							//ta bort taggar
					        str = str.replace(/<([^>]+)>/ig, "");

					        var arr = str.split(/\r?\n/);

					        if (i == day || i > 4)
					            for (var j = 1; j < arr.length; j++)
                                    if (arr[j].trim().length != 0) {
					                    menu.push((i > 4 ? keywords[i] + "<br />" : "") + arr[j].trim());
					                }
					    }*/

						/*var xml = parseXml(partial);
						var sections = xml.documentElement.children[1].children;
						//dagens
						var today = sections[day + 2];
						for (var i = today.children.length - 1; i >= 0; i--)
							today.removeChild(today.children[i]);
						for (var i = 0; i < today.childNodes.length; i++)
							menu.push(today.childNodes[i].nodeValue.trim());
						
						//veckans
						for (var i = 7; i < sections.length; i++)
						{
							if (sections[i].innerHTML.toLowerCase().indexOf("veckans") == -1)
								break;
							var str = sections[i].innerHTML;
							var type = str.substring(str.toLowerCase().indexOf("veckans"));
							type = type.substring(0, type.indexOf("<br"));
							menu.push(type + ": " + sections[i].childNodes[sections[i].childNodes.length - 1].nodeValue);
						}*/
					}
					catch (e) {
						console.log("Försökte parsea nymbles meny men det sket sig: " + e);
					}
					menus.nymble = menu;
					restaurantsLeft--;
					onDone();
				},
				function errorCallback(response) {
					console.log("Error when getting Nymble's menu " + response.status + ": " + response.statusText + ", " + response.data);
					restaurantsLeft--;
					onDone();
				});
				
		    //Brazilia
            //buggar ibland, så kan förbättras
			$http.get(FoodEndpoint.brazilia + URLs.weekMenuBrazilia()
				).then(
				function successCallback(response) {
					var partial = response.data.substring(response.data.indexOf("<table class=\"table lunch_menu\">"));
					partial = partial.substring(0, partial.indexOf("</table>") + "</table>".length);
					
					partial = partial.replace(/<br>/ig, "").replace(/<img([^>]+)>/ig, "");
					
					var menu = [];
					try {
						var xml = parseXml(partial);
						//var row = xml.getElementsByTagName("tbody")[day];
						var row = xml.getElementsByTagName("tbody")[0];
						
						for (var i = 0; i < row.children.length; i++)
							menu.push(row.children[i].children[0].childNodes[0].nodeValue.trim());
					}
					catch (e) {
						console.log("Försökte parsea brazilias meny men det sket sig: " + e);
					}
					menus.brazilia = menu;
					restaurantsLeft--;
					onDone();
				},
				function errorCallback(response) {
					console.log("Error when getting Brazilia's menu " + response.status + ": " + response.statusText + ", " + response.data);
					restaurantsLeft--;
					onDone();
				});
                
                //Syster O Bror
				//buggar
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
                            console.log("Försökte parsea Syster O Brors meny men det sket sig: " + e);
                        }
                        menus.syster = menu;
                        restaurantsLeft--;
                        onDone();
                    },
                    function errorCallback(response) {
                        console.log("Error when getting Syster O Bror's menu " + response.status + ": " + response.statusText + ", " + response.data);
                        restaurantsLeft--;
                        onDone();
                    });
		} catch (e) {
			console.log(e);
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
				console.log("Getting menus from cache");
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
