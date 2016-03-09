angular.module('starter.getxkcd', ['starter.services'])

.factory('xkcdService', function($http, $state, StorageService) {
	var data = [];
	
	//körs när alla anrop är klara
	var onDone = function () {
		if ($state.current.name == "tools.food"){
			$state.go($state.current, {}, { reload: true });
		}
	};
	
	var parseXml = function (xmlStr) {
		return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
	};
	
	
	var updateXkcd = function () {
		console.log("Updating xkcd");
		try {
			$http.get("http://xkcd.com/info.0.json"
				).then(
				function successCallback(response) {
					var safetitle = response.safe_title;
					var im = response.img;
					data.title = safetitle;
					data.img=im
					onDone();
				},
				function errorCallback(response) {
					console.log("Error when getting xkcd " + response.status + ": " + response.statusText + ", " + response.data);
					onDone();
				}
				);
				}catch (e) {
					console.log(e);
					}
	};
	
	
	return {
        getImg: function() {
			return data.img
		},
		getTitle: function() {
			return data.title
			
		},
		update: function() {
			updatexkcd();
		}
    };
	

})






;