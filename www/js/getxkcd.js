angular.module('starter.getxkcd', ['starter.services'])

.factory('xkcdService', function($http, $state, StorageService, URLs, XkcdEndpoint) {
		var title="";
		var img="";
		var alt="";
		var cLink="";
	
	
	
	var updatexkcd = function (callbackFunc,nr) {
		//nr=-1 => random comic
		//nr!=-1 => latest comic
		console.log("Updating xkcd");
		var number="";
		if(nr==-1){
			try {
			$http.get(XkcdEndpoint.url+'/'+URLs.xkcdJson()
				).then(
				function successCallback(resp) {
					var n= resp.data.num;
					number=(Math.floor(Math.random() * n) + 1).toString();
				},
				function errorCallback(resp) {
					console.log("Error when getting xkcd: " + resp.status + ": " + resp.statusText + ", " + resp.data);
					callbackFunc();

				});
				}catch (e) {
					console.log(e);
					}
		}else{
			console.log("UPPDATERAR MED SENASTE");
		}
		try {
			$http.get(XkcdEndpoint.url+number+'/'+URLs.xkcdJson()
				).then(
				function successCallback(response) {
					var safetitle = response.data.safe_title;
					var im = response.data.img;
					console.log("number generated is "+number+" url requestad is: "+XkcdEndpoint.url+number+'/'+URLs.xkcdJson());
					console.log(response.data.safe_title);

					var al = response.data.alt;
					var n= response.data.num;
					title=safetitle;
					alt=al;
					img=im;
					cLink=XkcdEndpoint.url+n.toString()+'/#';
					callbackFunc();
				},
				function errorCallback(response) {
					console.log("Error when getting xkcd: " + response.status + ": " + response.statusText + ", " + response.data);
					title="Error code";
					img="img/error_code.png";
					alt="It has a section on motherboard beep codes that lists, for each beep pattern, a song that syncs up well with it.";
					console.log(title);
					callbackFunc();

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
		update: function(callbackFunc,nr) {
			updatexkcd(callbackFunc,nr);
		}
    };
})
;