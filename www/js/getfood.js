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


    //XML är verkligen inte apples starka sida
	var pleaseIOs = function (xmlnode) {
	    return xmlnode.children || xmlnode.childNodes;
	};

	var nthNotText = function (arr, n) {
	    for (var i = 0; i < arr.length; i++)
	        if (arr[i].nodeName != "#text" && --n == -1)
	            return arr[i];
	    return undefined;
	};

	var ffsGetTheContent = function (node) {
	    return node.innerHTML || node.textContent;
	};

	var nonTextCount = function (arr) {
	    var count = 0;
	    for (var i = 0; i < arr.length; i++)
	        if (arr[i].nodeName != "#text")
	            count++;

	    return count;
	};
	
	var updateMenus = function () {
		DebuggerService.log("Updating menus");
		try {
			//Restaurang Q
		    $http.get(FoodEndpoint.q + URLs.weekMenuQ((StorageService.getOrDefault("gitContent", {}).foodsettings || {}).qurlsuffix)
				).then(
				function successCallback(response) {
					var partial = response.data.substring(response.data.indexOf("<table id=\"mattabellen\""));
					partial = partial.substring(0, partial.indexOf("</table>") + "</table>".length);
					var menu = [];
					try {
						var xml = parseXml(partial);
						var row = nthNotText(pleaseIOs(nthNotText(pleaseIOs(xml.documentElement), 0)), day + 1);
						for (var i = 1; i <= 3; i++)
							menu.push(ffsGetTheContent(nthNotText(pleaseIOs(row), i)).trim());
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

				    try {
				        var raw = response.data.acf.meal_of_the_day[0].menu[0][["monday", "tuesday", "wednesday", "thursday", "friday"][day]];
				        var lines = raw.replace(/<[^>]+>/ig, "|").split("|");

				        for (var i = 0; i < lines.length; i++) {
				            var line = lines[i].trim();
				            if (line.length > 1)
				                menu.push(line);
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
						
						for (var i = 0; i < nonTextCount(pleaseIOs(row)); i++) {
							var str = nthNotText(pleaseIOs(nthNotText(pleaseIOs(row), i)), 0).childNodes[0].nodeValue;
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
                            var d = xml.documentElement;
                            var child = function (node, n) {
                                return nthNotText(pleaseIOs(node), n);
                            };
                            //fråga inte ens
                            menu.push(ffsGetTheContent(child(child(child(child(child((child(d, 0).tagName == "parsererror" ? child(d, 1) : child(d, 0)), 0), 1), day), 0), 1)).trim());
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
