angular.module('starter.getxkcd', ['starter.services'])

.factory('xkcdService', function($http, $state, StorageService, URLs, XkcdEndpoint) {
		var title="";
		var img="";
		var alt="";
		var cLink="";
	
	//körs när alla anrop är klara
	var onDone = function (callbackFunc) {
		callbackFunc();
	};
	
	var updatexkcd = function (callbackFunc) {
		//"ta en callback"
		console.log("Updating xkcd");
		try {
			$http.get(XkcdEndpoint.url+URLs.xkcdJson()
				).then(
				function successCallback(response) {
					var safetitle = response.data.safe_title;
					var im = response.data.img;
					var al = response.data.alt;
					var n= response.data.num;
					title=safetitle;
					alt=al;
					img=im;
					cLink=XkcdEndpoint.url+n.toString();
					console.log(img);
					onDone(callbackFunc);
				},
				function errorCallback(response) {
					console.log("Error when getting xkcd: " + response.status + ": " + response.statusText + ", " + response.data);
					title="Error code";
					img="img/error_code.png";
					alt="It has a section on motherboard beep codes that lists, for each beep pattern, a song that syncs up well with it.";
					console.log(title);
					onDone(callbackFunc);

				});
				}catch (e) {
					console.log(e);
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
		update: function(callbackFunc) {
			updatexkcd(callbackFunc);
		}
    };
})
;