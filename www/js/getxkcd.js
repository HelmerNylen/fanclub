angular.module('starter.getxkcd', ['starter.services'])

.factory('xkcdService', function($http, $state, StorageService, URLs, XkcdEndpoint) {
		var title="";
		var img="";
	
	//körs när alla anrop är klara
	var onDone = function (callbackFunc) {
		callbackFunc();
		//TODO: "kör callbacken"
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
					title = safetitle;
					img=im;
					console.log(title+img);
					onDone(callbackFunc);
				},
				function errorCallback(response) {
					console.log("Error when getting xkcd: " + response.status + ": " + response.statusText + ", " + response.data);
					onDone(callbackFunc);
				});
				}catch (e) {
					img=null;
					title="No image available";
					console.log(e);
					}
	};	
	return {
        getImg: function() {
			console.log("titeln är "+img);
			return img
		},
		getTitle: function() {
			console.log("url till bild är: "+img);
			return title
			
		},
		update: function(callbackFunc) {
			updatexkcd(callbackFunc);
		}
    };
})
;