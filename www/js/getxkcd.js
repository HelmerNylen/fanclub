angular.module('starter.getxkcd', ['starter.services'])

.factory('xkcdService', function($http, $state, StorageService, URLs, XkcdEndpoint, DebuggerService) {
    var title = "", img = "", alt = "", cLink = "", num = "";
    var randmax = 1600; //skrivs över
	
	//körs när alla anrop är klara
	var onDone = function (callbackFunc) {
		callbackFunc();
	};
	
	var updatexkcd = function (callbackFunc,nr) {
		//nr=-1 => random comic
		//nr!=-1 => latest comic
		DebuggerService.log("Updating xkcd");
		var number="";
		if (nr == -1) {
			number=(Math.floor(Math.random() * randmax) + 1).toString();
		}
		else if (nr == -2) {
		    number = Math.min(num + 1, randmax);
		}
		else if (nr == -3) {
		    number = Math.max(num - 1, 1);
		}
		try {
			$http.get(XkcdEndpoint.url+number+'/'+URLs.xkcdJson()
				).then(
				function successCallback(response) {
					var safetitle = response.data.safe_title;
					var im = response.data.img;
					var al = response.data.alt;
					var n= response.data.num;
					title=safetitle;
					alt=al;
					img = im;
					num = n;
					cLink = XkcdEndpoint.url + n.toString() + '/#';

					if (num > randmax)
					    randmax = num;
					onDone(callbackFunc);
				},
				function errorCallback(response) {
			    DebuggerService.log("Error when getting xkcd: " + JSON.stringify(response), "red");
					title = "Kunde inte hämta xkcd";
					num = "-41";
					img="img/error_code.png";
					alt="It has a section on motherboard beep codes that lists, for each beep pattern, a song that syncs up well with it.";
					onDone(callbackFunc);

				});
				}catch (e) {
					DebuggerService.log(e.stack || e, 1);
					}
	};	
	return {
        getImg: function() {
			return img;
		},
		getTitle: function() {
			return title;
		},
		getAlt: function() {
			return alt;
		},
		getUrl: function() {
			return cLink;
		},
		getNumber: function() {
		    return num;
		},
		update: function(callbackFunc,nr) {
			updatexkcd(callbackFunc,nr);
		}
    };
})
;